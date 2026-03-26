import {
  Button,
  Card,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useModals } from "@mantine/modals";
import { cleanNotifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import pLimit from "p-limit";
import { useEffect, useRef, useState } from "react";
import { TbCode, TbPlus, TbX } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import Meta from "../../components/Meta";
import Dropzone from "../../components/upload/Dropzone";
import FileList from "../../components/upload/FileList";
import SnippetEditor, {
  SnippetDraft,
} from "../../components/upload/PasteEditor";
import showCompletedUploadModal from "../../components/upload/modals/showCompletedUploadModal";
import showCreateUploadModal from "../../components/upload/modals/showCreateUploadModal";
import useConfig from "../../hooks/config.hook";
import useConfirmLeave from "../../hooks/confirm-leave.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import useUser from "../../hooks/user.hook";
import shareService from "../../services/share.service";
import { FileUpload } from "../../types/File.type";
import { CreateShare, Share } from "../../types/share.type";
import toast from "../../utils/toast.util";
import { useRouter } from "next/router";

const promiseLimit = pLimit(3);
let errorToastShown = false;
let createdShare: Share;

const Upload = ({
  maxShareSize,
  isReverseShare = false,
  simplified,
}: {
  maxShareSize?: number;
  isReverseShare: boolean;
  simplified: boolean;
}) => {
  const modals = useModals();
  const router = useRouter();
  const t = useTranslate();

  const { user } = useUser();
  const config = useConfig();
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isUploading, setisUploading] = useState(false);

  // Snippets state
  const [snippets, setSnippets] = useState<SnippetDraft[]>([]);

  useConfirmLeave({
    message: t("upload.notify.confirm-leave"),
    enabled: isUploading,
  });

  const chunkSize = useRef(parseInt(config.get("share.chunkSize")));
  const maxPasteSize = parseInt(config.get("share.pasteMaxSize") || "1048576");

  maxShareSize ??= parseInt(config.get("share.maxSize"));
  const autoOpenCreateUploadModal = config.get("share.autoOpenShareModal");

  const hasSnippets = snippets.some((s) => s.content.trim().length > 0);
  const hasFiles = files.length > 0;
  const canShare = hasSnippets || hasFiles;

  const addSnippet = () => {
    setSnippets((prev) => [
      ...prev,
      { title: "", content: "", language: "" },
    ]);
  };

  const updateSnippet = (index: number, snippet: SnippetDraft) => {
    setSnippets((prev) => prev.map((s, i) => (i === index ? snippet : s)));
  };

  const removeSnippet = (index: number) => {
    setSnippets((prev) => prev.filter((_, i) => i !== index));
  };

  const getShareType = (): "FILE" | "PASTE" | "MIXED" => {
    if (hasSnippets && hasFiles) return "MIXED";
    if (hasSnippets) return "PASTE";
    return "FILE";
  };

  const uploadFiles = async (share: CreateShare, filesToUpload: FileUpload[]) => {
    const shareType = getShareType();
    const validSnippets = snippets
      .filter((s) => s.content.trim().length > 0)
      .map((s, i) => ({
        title: s.title || undefined,
        content: s.content,
        language: s.language || undefined,
        order: i,
      }));

    const shareWithSnippets: CreateShare = {
      ...share,
      type: shareType,
      snippets: validSnippets.length > 0 ? validSnippets : undefined,
    };

    // Paste-only: create and we're done (auto-completed on backend)
    if (shareType === "PASTE") {
      try {
        setisUploading(true);
        const isReverse = router.pathname != "/upload";
        const created = await shareService.create(shareWithSnippets, isReverse);
        showCompletedUploadModal(modals, {
          ...created,
          notifyReverseShareCreator: undefined,
        });
        setSnippets([]);
      } catch (e) {
        toast.axiosError(e);
      } finally {
        setisUploading(false);
      }
      return;
    }

    // FILE or MIXED: create share, upload files, then complete
    setisUploading(true);

    try {
      const isReverse = router.pathname != "/upload";
      createdShare = await shareService.create(shareWithSnippets, isReverse);
    } catch (e) {
      toast.axiosError(e);
      setisUploading(false);
      return;
    }

    const fileUploadPromises = filesToUpload.map(async (file, fileIndex) =>
      promiseLimit(async () => {
        let fileId;

        const setFileProgress = (progress: number) => {
          setFiles((files) =>
            files.map((file, callbackIndex) => {
              if (fileIndex == callbackIndex) {
                file.uploadingProgress = progress;
              }
              return file;
            }),
          );
        };

        setFileProgress(1);

        let chunks = Math.ceil(file.size / chunkSize.current);
        if (chunks == 0) chunks++;

        for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
          const from = chunkIndex * chunkSize.current;
          const to = from + chunkSize.current;
          const blob = file.slice(from, to);
          try {
            await shareService
              .uploadFile(createdShare.id, blob, { id: fileId, name: file.name }, chunkIndex, chunks)
              .then((response) => {
                fileId = response.id;
              });

            setFileProgress(((chunkIndex + 1) / chunks) * 100);
          } catch (e) {
            if (
              e instanceof AxiosError &&
              e.response?.data.error == "unexpected_chunk_index"
            ) {
              chunkIndex = e.response!.data!.expectedChunkIndex - 1;
              continue;
            } else {
              setFileProgress(-1);
              await new Promise((resolve) => setTimeout(resolve, 5000));
              chunkIndex = -1;
              continue;
            }
          }
        }
      }),
    );

    Promise.all(fileUploadPromises);
  };

  const showCreateUploadModalCallback = () => {
    // Validate snippet sizes
    for (const snippet of snippets) {
      if (new TextEncoder().encode(snippet.content).length > maxPasteSize) {
        toast.error(t("upload.paste.error.too-large"));
        return;
      }
    }

    showCreateUploadModal(
      modals,
      {
        isUserSignedIn: !!user,
        isReverseShare,
        allowUnauthenticatedShares: config.get("share.allowUnauthenticatedShares"),
        enableEmailRecepients: config.get("email.enableShareEmailRecipients"),
        maxExpiration: config.get("share.maxExpiration"),
        shareIdLength: config.get("share.shareIdLength"),
        simplified,
      },
      files,
      uploadFiles,
    );
  };

  const handleDropzoneFilesChanged = (files: FileUpload[]) => {
    if (autoOpenCreateUploadModal) {
      setFiles(files);
      showCreateUploadModalCallback();
    } else {
      setFiles((oldArr) => [...oldArr, ...files]);
    }
  };

  useEffect(() => {
    const fileErrorCount = files.filter(
      (file) => file.uploadingProgress == -1,
    ).length;

    if (fileErrorCount > 0) {
      if (!errorToastShown) {
        toast.error(
          t("upload.notify.count-failed", { count: fileErrorCount }),
          { withCloseButton: false, autoClose: false },
        );
      }
      errorToastShown = true;
    } else {
      cleanNotifications();
      errorToastShown = false;
    }

    if (
      files.length > 0 &&
      files.every((file) => file.uploadingProgress >= 100) &&
      fileErrorCount == 0
    ) {
      shareService
        .completeShare(createdShare.id)
        .then((share) => {
          setisUploading(false);
          showCompletedUploadModal(modals, share);
          setFiles([]);
          setSnippets([]);
        })
        .catch(() => toast.error(t("upload.notify.generic-error")));
    }
  }, [files]);

  return (
    <>
      <Meta title={t("upload.title")} />

      <Group position="right" mb={20}>
        <Button
          loading={isUploading}
          disabled={!canShare}
          onClick={showCreateUploadModalCallback}
        >
          <FormattedMessage id="common.button.share" />
        </Button>
      </Group>

      <Stack spacing="md">
        <Dropzone
          title={
            !autoOpenCreateUploadModal && files.length > 0
              ? t("share.edit.append-upload")
              : undefined
          }
          maxShareSize={maxShareSize}
          onFilesChanged={handleDropzoneFilesChanged}
          isUploading={isUploading}
        />

        {files.length > 0 && (
          <FileList<FileUpload> files={files} setFiles={setFiles} />
        )}

        {/* Snippet editors */}
        {!isReverseShare && (
          <>
            {snippets.map((snippet, index) => (
              <Card
                key={index}
                withBorder
                p="sm"
              >
                <Group position="apart" mb="xs">
                  <Group spacing={6}>
                    <TbCode size={16} />
                    <Text size="sm" weight={500}>
                      {snippet.title || `${t("upload.snippet.label")} ${index + 1}`}
                    </Text>
                  </Group>
                  <UnstyledButton onClick={() => removeSnippet(index)}>
                    <TbX size={16} />
                  </UnstyledButton>
                </Group>
                <SnippetEditor
                  snippet={snippet}
                  onChange={(s) => updateSnippet(index, s)}
                  maxSize={maxPasteSize}
                />
              </Card>
            ))}

            <UnstyledButton
              onClick={addSnippet}
              sx={(theme) => ({
                padding: "12px 16px",
                border: `1px dashed ${
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[4]
                    : theme.colors.gray[4]
                }`,
                "&:hover": {
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[5]
                      : theme.colors.gray[0],
                },
              })}
            >
              <Group spacing={8}>
                <TbPlus size={16} />
                <TbCode size={16} />
                <Text size="sm">{t("upload.paste.add-text")}</Text>
              </Group>
            </UnstyledButton>
          </>
        )}
      </Stack>
    </>
  );
};
export default Upload;
