import { Box, Group, Text, Title } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import Meta from "../../../components/Meta";
import DownloadAllButton from "../../../components/share/DownloadAllButton";
import FileList from "../../../components/share/FileList";
import SnippetList from "../../../components/share/PasteView";
import showEnterPasswordModal from "../../../components/share/showEnterPasswordModal";
import showErrorModal from "../../../components/share/showErrorModal";
import useTranslate from "../../../hooks/useTranslate.hook";
import shareService from "../../../services/share.service";
import { Share as ShareType } from "../../../types/share.type";
import toast from "../../../utils/toast.util";
import { byteToHumanSizeString } from "../../../utils/fileSize.util";
import mime from "mime-types";

type SharePageProps = {
  shareId: string;
  ogData?: {
    name?: string;
    description?: string;
    type?: string;
    ogImage?: string;
    ogVideo?: string;
  };
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const shareId = context.params!.shareId as string;
  const apiURL = process.env.API_URL || "http://localhost:8080";

  let ogData = undefined;
  try {
    const res = await fetch(`${apiURL}/api/shares/${shareId}`, {
      headers: { cookie: context.req.headers.cookie || "" },
    });
    if (res.ok) {
      const share = await res.json();
      const data: SharePageProps["ogData"] = {
        name: share.name,
        description: share.description,
        type: share.type,
      };

      // Generate OG image/video for the first file
      if (share.type !== "PASTE" && share.files?.length > 0) {
        const firstFile = share.files[0];
        const mimeType = (mime.contentType(firstFile.name) || "").split(";")[0];
        const fileUrl = `${context.req.headers["x-forwarded-proto"] || "https"}://${context.req.headers.host}/api/shares/${shareId}/files/${firstFile.id}?download=false`;

        if (mimeType.startsWith("image/")) {
          data.ogImage = fileUrl;
        } else if (mimeType.startsWith("video/")) {
          data.ogVideo = fileUrl;
        }
      }
      ogData = data;
    }
  } catch {
    // Failed to fetch share data — skip OG tags
  }

  return {
    props: { shareId, ogData: ogData || null },
  };
}

const Share = ({ shareId, ogData }: SharePageProps) => {
  const modals = useModals();
  const [share, setShare] = useState<ShareType>();
  const t = useTranslate();

  const getShareToken = async (password?: string) => {
    await shareService
      .getShareToken(shareId, password)
      .then(() => {
        modals.closeAll();
        getFiles();
      })
      .catch((e) => {
        const { error } = e.response.data;
        if (error == "share_max_views_exceeded") {
          showErrorModal(
            modals,
            t("share.error.visitor-limit-exceeded.title"),
            t("share.error.visitor-limit-exceeded.description"),
            "go-home",
          );
        } else if (error == "share_password_required") {
          showEnterPasswordModal(modals, getShareToken);
        } else {
          toast.axiosError(e);
        }
      });
  };

  const getFiles = async () => {
    shareService
      .get(shareId)
      .then((share) => {
        setShare(share);
      })
      .catch((e) => {
        const { error } = e.response.data;
        if (e.response.status == 404) {
          if (error == "share_removed") {
            showErrorModal(
              modals,
              t("share.error.removed.title"),
              e.response.data.message,
              "go-home",
            );
          } else {
            showErrorModal(
              modals,
              t("share.error.not-found.title"),
              t("share.error.not-found.description"),
              "go-home",
            );
          }
        } else if (e.response.status == 403 && error == "private_share") {
          showErrorModal(
            modals,
            t("share.error.access-denied.title"),
            t("share.error.access-denied.description"),
          );
        } else if (error == "share_password_required") {
          showEnterPasswordModal(modals, getShareToken);
        } else if (error == "share_token_required") {
          getShareToken();
        } else {
          showErrorModal(
            modals,
            t("common.error"),
            t("common.error.unknown"),
            "go-home",
          );
        }
      });
  };

  useEffect(() => {
    getFiles();
  }, []);

  return (
    <>
      <Meta
        title={t("share.title", { shareId: share?.name || ogData?.name || shareId })}
        description={ogData?.description || t("share.description")}
        ogImage={ogData?.ogImage}
        ogVideo={ogData?.ogVideo}
        ogType={ogData?.ogVideo ? "video.other" : undefined}
      />

      <Group position="apart" mb="lg">
        <Box style={{ maxWidth: "70%" }}>
          <Title order={3}>{share?.name || share?.id}</Title>
          <Text size="sm">{share?.description}</Text>
          {share?.type !== "PASTE" && (() => {
            const realFiles = (share?.files || []).filter((f: any) => f.name !== "paste.txt");
            return realFiles.length > 0 ? (
              <Text size="sm" color="dimmed" mt={5}>
                <FormattedMessage
                  id="share.fileCount"
                  values={{
                    count: realFiles.length,
                    size: byteToHumanSizeString(
                      realFiles.reduce(
                        (total: number, file: { size: string }) =>
                          total + parseInt(file.size),
                        0,
                      ),
                    ),
                  }}
                />
              </Text>
            ) : null;
          })()}
        </Box>

        {share?.type !== "PASTE" &&
          (share?.files || []).filter((f: any) => f.name !== "paste.txt").length > 1 && (
          <DownloadAllButton shareId={shareId} />
        )}
      </Group>

      {(share?.type === "PASTE" || share?.type === "MIXED") &&
        share?.snippets &&
        share.snippets.length > 0 && (
          <SnippetList snippets={share.snippets} shareId={shareId} />
        )}

      {share?.type !== "PASTE" && (
        <FileList
          files={share?.files?.filter((f: any) => f.name !== "paste.txt")}
          setShare={setShare}
          share={share!}
          isLoading={!share}
        />
      )}
    </>
  );
};

export default Share;
