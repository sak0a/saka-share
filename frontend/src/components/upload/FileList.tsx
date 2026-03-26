import {
  ActionIcon,
  Box,
  Card,
  Collapse,
  Group,
  Stack,
  Table,
  Text,
  UnstyledButton,
} from "@mantine/core";
import mime from "mime-types";
import React, { useEffect, useState } from "react";
import { TbChevronDown, TbChevronRight, TbTrash } from "react-icons/tb";
import { GrUndo } from "react-icons/gr";
import { FormattedMessage } from "react-intl";
import { FileListItem } from "../../types/File.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import UploadProgressIndicator from "./UploadProgressIndicator";

const MAX_PREVIEW_HEIGHT = "50vh";

const getFileMimeType = (fileName: string): string => {
  return (mime.contentType(fileName) || "").split(";")[0];
};

const isPreviewableLocally = (mimeType: string): boolean => {
  return (
    mimeType.startsWith("image/") ||
    mimeType.startsWith("video/") ||
    mimeType.startsWith("audio/")
  );
};

const LocalFilePreview = ({ file }: { file: FileListItem }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mimeType = getFileMimeType(file.name);

  useEffect(() => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (!previewUrl) return null;

  if (mimeType.startsWith("image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={previewUrl}
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
        <source src={previewUrl} type={mimeType} />
      </video>
    );
  }

  if (mimeType.startsWith("audio/")) {
    return (
      <audio controls style={{ width: "100%" }}>
        <source src={previewUrl} type={mimeType} />
      </audio>
    );
  }

  return null;
};

const CollapsibleUploadPreview = ({
  file,
  onRemove,
}: {
  file: FileListItem;
  onRemove: () => void;
}) => {
  const [open, setOpen] = useState(true);
  const uploadable = "uploadingProgress" in file;
  const uploading = uploadable && file.uploadingProgress !== 0;
  const removable = uploadable ? file.uploadingProgress === 0 : true;

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
              ({byteToHumanSizeString(+file.size)})
            </Text>
          </Group>
          <Group
            spacing={4}
            noWrap
            style={{ flexShrink: 0 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {uploading && (
              <UploadProgressIndicator progress={file.uploadingProgress} />
            )}
            {removable && (
              <ActionIcon
                color="red"
                variant="light"
                size={22}
                onClick={onRemove}
              >
                <TbTrash size={14} />
              </ActionIcon>
            )}
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
          <LocalFilePreview file={file} />
        </Box>
      </Collapse>
    </Card>
  );
};

const FileListRow = ({
  file,
  onRemove,
  onRestore,
}: {
  file: FileListItem;
  onRemove?: () => void;
  onRestore?: () => void;
}) => {
  {
    const uploadable = "uploadingProgress" in file;
    const uploading = uploadable && file.uploadingProgress !== 0;
    const removable = uploadable
      ? file.uploadingProgress === 0
      : onRemove && !file.deleted;
    const restorable = onRestore && !uploadable && !!file.deleted;
    const deleted = !uploadable && !!file.deleted;

    return (
      <tr
        style={{
          color: deleted ? "rgba(120, 120, 120, 0.5)" : "inherit",
          textDecoration: deleted ? "line-through" : "none",
        }}
      >
        <td>{file.name}</td>
        <td>{byteToHumanSizeString(+file.size)}</td>
        <td>
          {removable && (
            <ActionIcon
              color="red"
              variant="light"
              size={25}
              onClick={onRemove}
            >
              <TbTrash />
            </ActionIcon>
          )}
          {uploading && (
            <UploadProgressIndicator progress={file.uploadingProgress} />
          )}
          {restorable && (
            <ActionIcon
              color="primary"
              variant="light"
              size={25}
              onClick={onRestore}
            >
              <GrUndo />
            </ActionIcon>
          )}
        </td>
      </tr>
    );
  }
};

const FileList = <T extends FileListItem = FileListItem>({
  files,
  setFiles,
}: {
  files: T[];
  setFiles: (files: T[]) => void;
}) => {
  const remove = (index: number) => {
    const file = files[index];

    if ("uploadingProgress" in file) {
      files.splice(index, 1);
    } else {
      files[index] = { ...file, deleted: true };
    }

    setFiles([...files]);
  };

  const restore = (index: number) => {
    const file = files[index];

    if ("uploadingProgress" in file) {
      return;
    } else {
      files[index] = { ...file, deleted: false };
    }

    setFiles([...files]);
  };

  // Split into previewable (with collapsible cards) and non-previewable (table rows)
  const previewableIndices: number[] = [];
  const nonPreviewableIndices: number[] = [];

  files.forEach((f, i) => {
    const isFile = f instanceof File;
    const mimeType = getFileMimeType(f.name);
    const deleted = !("uploadingProgress" in f) && !!f.deleted;

    if (isFile && isPreviewableLocally(mimeType) && !deleted) {
      previewableIndices.push(i);
    } else {
      nonPreviewableIndices.push(i);
    }
  });

  return (
    <Stack spacing="sm">
      {/* Collapsible previews for media files */}
      {previewableIndices.map((idx) => (
        <CollapsibleUploadPreview
          key={`preview-${files[idx].name}-${idx}`}
          file={files[idx]}
          onRemove={() => remove(idx)}
        />
      ))}

      {/* Table for non-previewable files */}
      {nonPreviewableIndices.length > 0 && (
        <Table>
          <thead>
            <tr>
              <th>
                <FormattedMessage id="upload.filelist.name" />
              </th>
              <th>
                <FormattedMessage id="upload.filelist.size" />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {nonPreviewableIndices.map((idx) => (
              <FileListRow
                key={idx}
                file={files[idx]}
                onRemove={() => remove(idx)}
                onRestore={() => restore(idx)}
              />
            ))}
          </tbody>
        </Table>
      )}
    </Stack>
  );
};

export default FileList;
