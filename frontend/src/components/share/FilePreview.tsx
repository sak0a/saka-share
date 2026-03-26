import {
  Box,
  Button,
  Card,
  Center,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import DOMPurify from "dompurify";
import Markdown, { MarkdownToJSX } from "markdown-to-jsx";
import Link from "next/link";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import api from "../../services/api.service";

const FilePreviewContext = React.createContext<{
  shareId: string;
  fileId: string;
  fileName: string;
  mimeType: string;
  setIsNotSupported: Dispatch<SetStateAction<boolean>>;
}>({
  shareId: "",
  fileId: "",
  fileName: "",
  mimeType: "",
  setIsNotSupported: () => {},
});

const FilePreview = ({
  shareId,
  fileId,
  mimeType,
  fileName,
}: {
  shareId: string;
  fileId: string;
  mimeType: string;
  fileName?: string;
}) => {
  const [isNotSupported, setIsNotSupported] = useState(false);
  if (isNotSupported) return <UnSupportedFile />;

  return (
    <Stack>
      <FilePreviewContext.Provider
        value={{ shareId, fileId, fileName: fileName || "", mimeType, setIsNotSupported }}
      >
        <FileDecider />
      </FilePreviewContext.Provider>
      <Button
        variant="subtle"
        component={Link}
        onClick={() => modals.closeAll()}
        target="_blank"
        href={`/api/shares/${shareId}/files/${fileId}?download=false`}
      >
        View original file
      </Button>
    </Stack>
  );
};

const FileDecider = () => {
  const { mimeType, setIsNotSupported } = React.useContext(FilePreviewContext);

  if (mimeType == "application/pdf") {
    return <PdfPreview />;
  } else if (mimeType.startsWith("video/")) {
    return <VideoPreview />;
  } else if (mimeType === "image/svg+xml") {
    return <SvgPreview />;
  } else if (mimeType.startsWith("image/")) {
    return <ImagePreview />;
  } else if (mimeType.startsWith("audio/")) {
    return <AudioPreview />;
  } else if (mimeType.startsWith("text/")) {
    return <TextPreview />;
  } else {
    setIsNotSupported(true);
    return null;
  }
};

const AudioPreview = () => {
  const { shareId, fileId, fileName, setIsNotSupported } =
    React.useContext(FilePreviewContext);
  return (
    <Center style={{ minHeight: 200 }}>
      <Card withBorder style={{ width: "100%" }} p="md">
        <Stack align="center" spacing={10} style={{ width: "100%" }}>
          {fileName && (
            <Text size="sm" weight={500} truncate style={{ maxWidth: "100%" }}>
              {fileName}
            </Text>
          )}
          <audio controls style={{ width: "100%" }}>
            <source
              src={`/api/shares/${shareId}/files/${fileId}?download=false`}
              onError={() => setIsNotSupported(true)}
            />
          </audio>
        </Stack>
      </Card>
    </Center>
  );
};

const VideoPreview = () => {
  const { shareId, fileId, setIsNotSupported } =
    React.useContext(FilePreviewContext);
  return (
    <video
      width="100%"
      controls
      playsInline
      controlsList="nodownload"
    >
      <source
        src={`/api/shares/${shareId}/files/${fileId}?download=false`}
        onError={() => setIsNotSupported(true)}
      />
    </video>
  );
};

const SvgPreview = () => {
  const { shareId, fileId, setIsNotSupported } =
    React.useContext(FilePreviewContext);
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
      .catch(() => setIsNotSupported(true));
  }, [shareId, fileId]);

  if (!svgContent) return null;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        "& svg": {
          maxWidth: "100%",
          height: "auto",
        },
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

const ImagePreview = () => {
  const { shareId, fileId, setIsNotSupported } =
    React.useContext(FilePreviewContext);
  const [zoomed, setZoomed] = useState(false);

  return (
    <Box
      onClick={() => setZoomed(!zoomed)}
      sx={{
        cursor: zoomed ? "zoom-out" : "zoom-in",
        overflow: zoomed ? "auto" : "hidden",
        maxHeight: zoomed ? "80vh" : undefined,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/shares/${shareId}/files/${fileId}?download=false`}
        alt={`${fileId}_preview`}
        style={{
          width: zoomed ? "auto" : "100%",
          maxWidth: zoomed ? "none" : "100%",
          transition: "all 0.2s ease",
        }}
        onError={() => setIsNotSupported(true)}
      />
    </Box>
  );
};

const TextPreview = () => {
  const { shareId, fileId } = React.useContext(FilePreviewContext);
  const [text, setText] = useState<string>("");
  const { colorScheme } = useMantineTheme();

  useEffect(() => {
    api
      .get(`/shares/${shareId}/files/${fileId}?download=false`)
      .then((res) => setText(res.data ?? "Preview couldn't be fetched."));
  }, [shareId, fileId]);

  const options: MarkdownToJSX.Options = {
    disableParsingRawHTML: true,
    overrides: {
      pre: {
        props: {
          style: {
            backgroundColor:
              colorScheme == "dark"
                ? "rgba(30, 30, 30, 0.8)"
                : "rgba(240, 240, 240, 0.8)",
            padding: "0.75em",
            whiteSpace: "pre-wrap",
          },
        },
      },
      table: {
        props: {
          className: "md",
        },
      },
    },
  };

  return <Markdown options={options}>{text}</Markdown>;
};

const PdfPreview = () => {
  const { shareId, fileId } = React.useContext(FilePreviewContext);
  if (typeof window !== "undefined") {
    window.location.href = `/api/shares/${shareId}/files/${fileId}?download=false`;
  }
  return null;
};

const UnSupportedFile = () => {
  return (
    <Center style={{ minHeight: 200 }}>
      <Stack align="center" spacing={10}>
        <Title order={3}>
          <FormattedMessage id="share.modal.file-preview.error.not-supported.title" />
        </Title>
        <Text>
          <FormattedMessage id="share.modal.file-preview.error.not-supported.description" />
        </Text>
      </Stack>
    </Center>
  );
};

export default FilePreview;
