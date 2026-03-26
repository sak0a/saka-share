import { Button, Card, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { cleanNotifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import { useRouter } from "next/router";
import pLimit from "p-limit";
import { useEffect, useMemo, useRef, useState } from "react";
import { TbCode, TbPlus, TbX } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import Dropzone from "../../components/upload/Dropzone";
import FileList from "../../components/upload/FileList";
import SnippetEditor, { SnippetDraft } from "../../components/upload/PasteEditor";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { FileListItem, FileMetaData, FileUpload } from "../../types/File.type";
import { Snippet } from "../../types/share.type";
import toast from "../../utils/toast.util";

const promiseLimit = pLimit(3);
let errorToastShown = false;

const EditableUpload = ({
  maxShareSize,
  shareId,
  files: savedFiles = [],
  snippets: savedSnippets = [],
}: {
  maxShareSize?: number;
  isReverseShare?: boolean;
  shareId: string;
  files?: FileMetaData[];
  snippets?: Snippet[];
}) => {
  const t = useTranslate();
  const router = useRouter();
  const config = useConfig();

  const chunkSize = useRef(parseInt(config.get("share.chunkSize")));
  const maxPasteSize = parseInt(config.get("share.pasteMaxSize") || "1048576");

  const [existingFiles, setExistingFiles] =
    useState<Array<FileMetaData & { deleted?: boolean }>>(savedFiles);
  const [uploadingFiles, setUploadingFiles] = useState<FileUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Snippet state: existing (from server) + new drafts
  const [existingSnippets, setExistingSnippets] = useState<Snippet[]>(savedSnippets);
  const [deletedSnippetIds, setDeletedSnippetIds] = useState<string[]>([]);
  const [newSnippets, setNewSnippets] = useState<SnippetDraft[]>([]);

  const existingAndUploadedFiles: FileListItem[] = useMemo(
    () => [...uploadingFiles, ...existingFiles],
    [existingFiles, uploadingFiles],
  );

  const dirty = useMemo(() => {
    return (
      existingFiles.some((file) => !!file.deleted) ||
      !!uploadingFiles.length ||
      deletedSnippetIds.length > 0 ||
      newSnippets.some((s) => s.content.trim().length > 0)
    );
  }, [existingFiles, uploadingFiles, deletedSnippetIds, newSnippets]);

  const setFiles = (files: FileListItem[]) => {
    const _uploadFiles = files.filter(
      (file) => "uploadingProgress" in file,
    ) as FileUpload[];
    const _existingFiles = files.filter(
      (file) => !("uploadingProgress" in file),
    ) as FileMetaData[];

    setUploadingFiles(_uploadFiles);
    setExistingFiles(_existingFiles);
  };

  maxShareSize ??= parseInt(config.get("share.maxSize"));

  const uploadFiles = async (files: FileUpload[]) => {
    const fileUploadPromises = files.map(async (file, fileIndex) =>
      promiseLimit(async () => {
        let fileId: string | undefined;

        const setFileProgress = (progress: number) => {
          setUploadingFiles((files) =>
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
              .uploadFile(shareId, blob, { id: fileId, name: file.name }, chunkIndex, chunks)
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

    await Promise.all(fileUploadPromises);
  };

  const removeFiles = async () => {
    const removedFiles = existingFiles.filter((file) => !!file.deleted);

    if (removedFiles.length > 0) {
      await Promise.all(
        removedFiles.map(async (file) => {
          await shareService.removeFile(shareId, file.id);
        }),
      );

      setExistingFiles(existingFiles.filter((file) => !file.deleted));
    }
  };

  const syncSnippets = async () => {
    // Remove deleted snippets
    for (const id of deletedSnippetIds) {
      await shareService.removeSnippet(shareId, id);
    }

    // Add new snippets
    for (const snippet of newSnippets) {
      if (snippet.content.trim().length > 0) {
        await shareService.addSnippet(shareId, {
          title: snippet.title || undefined,
          content: snippet.content,
          language: snippet.language || undefined,
        });
      }
    }
  };

  const revertComplete = async () => {
    await shareService.revertComplete(shareId);
  };

  const completeShare = async () => {
    return await shareService.completeShare(shareId);
  };

  const save = async () => {
    setIsUploading(true);

    try {
      await revertComplete();
      await uploadFiles(uploadingFiles);

      const hasFailed = uploadingFiles.some(
        (file) => file.uploadingProgress == -1,
      );

      if (!hasFailed) {
        await removeFiles();
        await syncSnippets();
      }

      await completeShare();

      if (!hasFailed) {
        toast.success(t("share.edit.notify.save-success"));
        router.back();
      }
    } catch {
      toast.error(t("share.edit.notify.generic-error"));
    } finally {
      setIsUploading(false);
    }
  };

  const appendFiles = (appendingFiles: FileUpload[]) => {
    setUploadingFiles([...appendingFiles, ...uploadingFiles]);
  };

  useEffect(() => {
    const fileErrorCount = uploadingFiles.filter(
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
  }, [uploadingFiles]);

  return (
    <>
      <Group position="right" mb={20}>
        <Button loading={isUploading} disabled={!dirty} onClick={() => save()}>
          <FormattedMessage id="common.button.save" />
        </Button>
      </Group>

      <Stack spacing="md">
        <Dropzone
          title={t("share.edit.append-upload")}
          maxShareSize={maxShareSize}
          onFilesChanged={appendFiles}
          isUploading={isUploading}
        />
        {existingAndUploadedFiles.length > 0 && (
          <FileList files={existingAndUploadedFiles} setFiles={setFiles} />
        )}

        {/* Existing snippets */}
        {existingSnippets
          .filter((s) => !deletedSnippetIds.includes(s.id))
          .map((snippet) => (
            <Card key={snippet.id} withBorder p="sm">
              <Group position="apart" mb="xs">
                <Group spacing={6}>
                  <TbCode size={16} />
                  <Text size="sm" weight={500}>
                    {snippet.title || `Snippet ${snippet.order + 1}`}
                  </Text>
                </Group>
                <UnstyledButton
                  onClick={() =>
                    setDeletedSnippetIds((prev) => [...prev, snippet.id])
                  }
                >
                  <TbX size={16} color="red" />
                </UnstyledButton>
              </Group>
              <Text
                size="xs"
                color="dimmed"
                style={{
                  fontFamily: "monospace",
                  whiteSpace: "pre",
                  maxHeight: 100,
                  overflow: "hidden",
                }}
              >
                {snippet.content.slice(0, 500)}
              </Text>
            </Card>
          ))}

        {/* New snippets */}
        {newSnippets.map((snippet, index) => (
          <Card key={`new-${index}`} withBorder p="sm">
            <Group position="apart" mb="xs">
              <Group spacing={6}>
                <TbCode size={16} />
                <Text size="sm" weight={500}>
                  {snippet.title || `${t("upload.snippet.label")} (new)`}
                </Text>
              </Group>
              <UnstyledButton
                onClick={() =>
                  setNewSnippets((prev) => prev.filter((_, i) => i !== index))
                }
              >
                <TbX size={16} />
              </UnstyledButton>
            </Group>
            <SnippetEditor
              snippet={snippet}
              onChange={(s) =>
                setNewSnippets((prev) =>
                  prev.map((old, i) => (i === index ? s : old)),
                )
              }
              maxSize={maxPasteSize}
            />
          </Card>
        ))}

        <UnstyledButton
          onClick={() =>
            setNewSnippets((prev) => [
              ...prev,
              { title: "", content: "", language: "" },
            ])
          }
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
      </Stack>
    </>
  );
};
export default EditableUpload;
