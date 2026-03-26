import {
  ActionIcon,
  Box,
  Card,
  Collapse,
  Group,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { useModals } from "@mantine/modals";
import DOMPurify from "dompurify";
import mime from "mime-types";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  TbChevronDown,
  TbChevronRight,
  TbDownload,
  TbLink,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { FileMetaData } from "../../types/File.type";
import { Share } from "../../types/share.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";
import TableSortIcon, { TableSort } from "../core/SortIcon";
import api from "../../services/api.service";

const MAX_PREVIEW_HEIGHT = "60vh";

const getFileMimeType = (fileName: string): string => {
  return (mime.contentType(fileName) || "").split(";")[0];
};

const isPreviewableInline = (mimeType: string): boolean => {
  return (
    mimeType.startsWith("image/") ||
    mimeType.startsWith("video/") ||
    mimeType.startsWith("audio/")
  );
};

const InlinePreview = ({
  shareId,
  file,
}: {
  shareId: string;
  file: FileMetaData;
}) => {
  const mimeType = getFileMimeType(file.name);
  const src = `/api/shares/${shareId}/files/${file.id}?download=false`;

  if (mimeType === "image/svg+xml") {
    return <InlineSvgPreview shareId={shareId} fileId={file.id} />;
  }

  if (mimeType.startsWith("image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={file.name}
        style={{
          maxWidth: "100%",
          maxHeight: MAX_PREVIEW_HEIGHT,
          objectFit: "contain",
          display: "block",
        }}
      />
    );
  }

  if (mimeType.startsWith("video/")) {
    return (
      <video
        controls
        playsInline
        controlsList="nodownload"
        style={{ maxWidth: "100%", maxHeight: MAX_PREVIEW_HEIGHT }}
      >
        <source src={src} />
      </video>
    );
  }

  if (mimeType.startsWith("audio/")) {
    return (
      <audio controls style={{ width: "100%" }}>
        <source src={src} />
      </audio>
    );
  }

  return null;
};

const InlineSvgPreview = ({
  shareId,
  fileId,
}: {
  shareId: string;
  fileId: string;
}) => {
  const [svgContent, setSvgContent] = useState<string>("");

  useEffect(() => {
    api
      .get(`/shares/${shareId}/files/${fileId}?download=false`)
      .then((res) => {
        const sanitized = DOMPurify.sanitize(res.data, {
          USE_PROFILES: { svg: true, svgFilters: true },
        });
        setSvgContent(sanitized);
      })
      .catch(() => {});
  }, [shareId, fileId]);

  if (!svgContent) return null;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        "& svg": {
          maxWidth: "100%",
          height: "auto",
          maxHeight: MAX_PREVIEW_HEIGHT,
        },
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

const CollapsibleMediaItem = ({
  shareId,
  file,
  share,
  copyFileLink,
}: {
  shareId: string;
  file: FileMetaData;
  share: Share;
  copyFileLink: (file: FileMetaData) => void;
}) => {
  const [open, setOpen] = useState(true);

  return (
    <Card withBorder p={0} sx={(theme) => ({ borderRadius: theme.radius.sm })}>
      <UnstyledButton
        onClick={() => setOpen((o) => !o)}
        px="sm"
        py={8}
        sx={(theme) => ({
          width: "100%",
          "&:hover": {
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[5]
                : theme.colors.gray[0],
          },
        })}
      >
        <Group position="apart" noWrap>
          <Group spacing={6} noWrap style={{ overflow: "hidden", flex: 1 }}>
            {open ? (
              <TbChevronDown size={14} style={{ flexShrink: 0 }} />
            ) : (
              <TbChevronRight size={14} style={{ flexShrink: 0 }} />
            )}
            <Text size="sm" truncate>
              {file.name}
            </Text>
            <Text size="xs" color="dimmed" style={{ flexShrink: 0 }}>
              ({byteToHumanSizeString(parseInt(file.size))})
            </Text>
          </Group>
          <Group
            spacing={4}
            noWrap
            style={{ flexShrink: 0 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {!share.hasPassword && (
              <ActionIcon size={22} onClick={() => copyFileLink(file)}>
                <TbLink size={14} />
              </ActionIcon>
            )}
            <ActionIcon
              size={22}
              onClick={() => shareService.downloadFile(share.id, file.id)}
            >
              <TbDownload size={14} />
            </ActionIcon>
          </Group>
        </Group>
      </UnstyledButton>

      <Collapse in={open}>
        <Box
          px="sm"
          pb="sm"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <InlinePreview shareId={shareId} file={file} />
        </Box>
      </Collapse>
    </Card>
  );
};

const FileList = ({
  files,
  setShare,
  share,
  isLoading,
}: {
  files?: FileMetaData[];
  setShare: Dispatch<SetStateAction<Share | undefined>>;
  share: Share;
  isLoading: boolean;
}) => {
  const clipboard = useClipboard();
  const config = useConfig();
  const modals = useModals();
  const t = useTranslate();

  const [sort, setSort] = useState<TableSort>({
    property: "name",
    direction: "desc",
  });

  const sortFiles = () => {
    if (files && sort.property) {
      const sortedFiles = files.sort((a: any, b: any) => {
        if (sort.direction === "asc") {
          return b[sort.property!].localeCompare(a[sort.property!], undefined, {
            numeric: true,
          });
        } else {
          return a[sort.property!].localeCompare(b[sort.property!], undefined, {
            numeric: true,
          });
        }
      });

      setShare({
        ...share,
        files: sortedFiles,
      });
    }
  };

  const copyFileLink = (file: FileMetaData) => {
    const link = `${window.location.origin}/api/shares/${share.id}/files/${file.id}`;

    if (window.isSecureContext) {
      clipboard.copy(link);
      toast.success(t("common.notify.copied-link"));
    } else {
      modals.openModal({
        title: t("share.modal.file-link"),
        children: (
          <Stack align="stretch">
            <TextInput variant="filled" value={link} />
          </Stack>
        ),
      });
    }
  };

  useEffect(sortFiles, [sort]);

  const previewableFiles = (files || []).filter((f) =>
    isPreviewableInline(getFileMimeType(f.name)),
  );
  const nonPreviewableFiles = (files || []).filter(
    (f) => !isPreviewableInline(getFileMimeType(f.name)),
  );

  return (
    <Stack spacing="sm">
      {/* Collapsible inline media previews */}
      {!isLoading &&
        previewableFiles.map((file) => (
          <CollapsibleMediaItem
            key={file.id}
            shareId={share.id}
            file={file}
            share={share}
            copyFileLink={copyFileLink}
          />
        ))}

      {/* Table for non-previewable files */}
      {(isLoading || nonPreviewableFiles.length > 0) && (
        <Box sx={{ display: "block", overflowX: "auto" }}>
          <Table>
            <thead>
              <tr>
                <th>
                  <Group spacing="xs">
                    <FormattedMessage id="share.table.name" />
                    <TableSortIcon
                      sort={sort}
                      setSort={setSort}
                      property="name"
                    />
                  </Group>
                </th>
                <th>
                  <Group spacing="xs">
                    <FormattedMessage id="share.table.size" />
                    <TableSortIcon
                      sort={sort}
                      setSort={setSort}
                      property="size"
                    />
                  </Group>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? skeletonRows
                : nonPreviewableFiles.map((file) => (
                    <tr key={file.name}>
                      <td>{file.name}</td>
                      <td>
                        {byteToHumanSizeString(parseInt(file.size))}
                      </td>
                      <td>
                        <Group position="right">
                          {!share.hasPassword && (
                            <ActionIcon
                              size={25}
                              onClick={() => copyFileLink(file)}
                            >
                              <TbLink />
                            </ActionIcon>
                          )}
                          <ActionIcon
                            size={25}
                            onClick={async () => {
                              await shareService.downloadFile(
                                share.id,
                                file.id,
                              );
                            }}
                          >
                            <TbDownload />
                          </ActionIcon>
                        </Group>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </Table>
        </Box>
      )}
    </Stack>
  );
};

const skeletonRows = [...Array(5)].map((c, i) => (
  <tr key={i}>
    <td>
      <Skeleton height={30} width={30} />
    </td>
    <td>
      <Skeleton height={14} />
    </td>
    <td>
      <Skeleton height={14} />
    </td>
    <td>
      <Skeleton height={25} width={25} />
    </td>
  </tr>
));

export default FileList;
