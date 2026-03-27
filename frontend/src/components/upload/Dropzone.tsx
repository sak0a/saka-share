import { Button, Center, createStyles, Group, Text } from "@mantine/core";
import { Dropzone as MantineDropzone } from "@mantine/dropzone";
import { ForwardedRef, useRef } from "react";
import { TbCloudUpload, TbUpload } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import useTranslate from "../../hooks/useTranslate.hook";
import { FileUpload } from "../../types/File.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    marginBottom: 30,
  },

  dropzone: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor:
      theme.colorScheme === "dark" ? "#2a2a2a" : theme.colors.gray[3],
    paddingBottom: 50,
    paddingTop: 40,
    backgroundColor:
      theme.colorScheme === "dark"
        ? "rgba(17, 17, 17, 0.5)"
        : theme.colors.gray[0],
    transition: "all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",

    "&:hover": {
      borderColor:
        theme.colorScheme === "dark"
          ? "rgba(139, 92, 246, 0.4)"
          : theme.colors.gray[5],
      backgroundColor:
        theme.colorScheme === "dark"
          ? "rgba(139, 92, 246, 0.02)"
          : theme.colors.gray[1],
    },

    "&[data-accept]": {
      borderColor: "#8b5cf6",
      backgroundColor:
        theme.colorScheme === "dark"
          ? "rgba(139, 92, 246, 0.05)"
          : "rgba(139, 92, 246, 0.08)",
    },
  },

  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[4],
    transition: "color 300ms ease",
  },

  control: {
    position: "absolute",
    bottom: -20,
  },

  uploadTitle: {
    fontFamily: "'Chakra Petch', sans-serif",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },

  uploadDesc: {
    fontFamily: "'Fira Code', monospace",
    fontSize: "0.8rem",
  },
}));

const Dropzone = ({
  title,
  isUploading,
  maxShareSize,
  onFilesChanged,
}: {
  title?: string;
  isUploading: boolean;
  maxShareSize: number;
  onFilesChanged: (files: FileUpload[]) => void;
}) => {
  const t = useTranslate();

  const { classes } = useStyles();
  const openRef = useRef<() => void>();
  return (
    <div className={classes.wrapper}>
      <MantineDropzone
        onReject={(e) => {
          toast.error(e[0].errors[0].message);
        }}
        disabled={isUploading}
        openRef={openRef as ForwardedRef<() => void>}
        onDrop={(files: FileUpload[]) => {
          const fileSizeSum = files.reduce((n, { size }) => n + size, 0);

          if (fileSizeSum > maxShareSize) {
            toast.error(
              t("upload.dropzone.notify.file-too-big", {
                maxSize: byteToHumanSizeString(maxShareSize),
              }),
            );
          } else {
            files = files.map((newFile) => {
              newFile.uploadingProgress = 0;
              return newFile;
            });
            onFilesChanged(files);
          }
        }}
        className={classes.dropzone}
      >
        <div style={{ pointerEvents: "none" }}>
          <Group position="center">
            <TbCloudUpload size={50} className={classes.icon} />
          </Group>
          <Text align="center" size="lg" mt="xl" className={classes.uploadTitle}>
            {title || <FormattedMessage id="upload.dropzone.title" />}
          </Text>
          <Text align="center" mt="xs" color="dimmed" className={classes.uploadDesc}>
            <FormattedMessage
              id="upload.dropzone.description"
              values={{ maxSize: byteToHumanSizeString(maxShareSize) }}
            />
          </Text>
        </div>
      </MantineDropzone>
      <Center>
        <Button
          className={classes.control}
          size="sm"
          disabled={isUploading}
          onClick={() => openRef.current && openRef.current()}
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === "dark" ? "#8b5cf6" : theme.black,
            color: theme.colorScheme === "dark" ? "#0a0a0a" : theme.white,
            border: "none",
            "&:hover": {
              backgroundColor:
                theme.colorScheme === "dark" ? "#a78bfa" : theme.colors.gray[8],
            },
          })}
        >
          {<TbUpload />}
        </Button>
      </Center>
    </div>
  );
};
export default Dropzone;
