import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Collapse,
  CopyButton,
  Group,
  Stack,
  Switch,
  Text,
  Tooltip,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import React, { useMemo, useState } from "react";
import {
  TbCheck,
  TbChevronDown,
  TbChevronRight,
  TbClipboard,
  TbCode,
  TbExternalLink,
} from "react-icons/tb";
import useTranslate from "../../hooks/useTranslate.hook";
import { Snippet } from "../../types/share.type";

const SnippetCard = ({
  snippet,
  shareId,
  defaultExpanded,
}: {
  snippet: Snippet;
  shareId: string;
  defaultExpanded: boolean;
}) => {
  const t = useTranslate();
  const { colorScheme } = useMantineTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [wordWrap, setWordWrap] = useState(false);

  const highlighted = useMemo(() => {
    try {
      if (snippet.language && snippet.language !== "plaintext") {
        const result = hljs.highlight(snippet.content, { language: snippet.language });
        return { html: result.value, language: result.language || snippet.language };
      }
      const result = hljs.highlightAuto(snippet.content);
      return { html: result.value, language: result.language || "plaintext" };
    } catch {
      return {
        html: hljs.highlight(snippet.content, { language: "plaintext" }).value,
        language: "plaintext",
      };
    }
  }, [snippet.content, snippet.language]);

  const lines = snippet.content.split("\n");

  return (
    <Card withBorder p={0}>
      <UnstyledButton
        onClick={() => setExpanded((o) => !o)}
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
            {expanded ? <TbChevronDown size={14} /> : <TbChevronRight size={14} />}
            <TbCode size={14} />
            <Text size="sm" weight={500} truncate>
              {snippet.title || `Snippet ${snippet.order + 1}`}
            </Text>
            <Badge variant="outline" size="xs">
              {highlighted.language}
            </Badge>
            <Text size="xs" color="dimmed">
              {lines.length} {lines.length === 1 ? "line" : "lines"}
            </Text>
          </Group>

          <Group
            spacing={4}
            noWrap
            style={{ flexShrink: 0 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Switch
              size="xs"
              label={t("share.paste.word-wrap")}
              checked={wordWrap}
              onChange={(e) => setWordWrap(e.currentTarget.checked)}
              styles={{ label: { fontSize: "0.7rem" } }}
            />
            <CopyButton value={snippet.content}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? t("share.paste.copied") : t("share.paste.copy")}>
                  <ActionIcon variant="subtle" color="gray" onClick={copy} size={22}>
                    {copied ? <TbCheck size={14} /> : <TbClipboard size={14} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
            <Tooltip label={t("share.paste.raw")}>
              <ActionIcon
                variant="subtle"
                component="a"
                href={`/api/shares/${shareId}/snippets/${snippet.id}/raw`}
                target="_blank"
                size={22}
              >
                <TbExternalLink size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </UnstyledButton>

      <Collapse in={expanded}>
        <Box
          sx={(theme) => ({
            overflow: "auto",
            backgroundColor: colorScheme === "dark" ? "#000000" : "#ffffff",
            borderTop: `1px solid ${
              colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
            }`,
          })}
        >
          <pre
            style={{
              margin: 0,
              padding: "0.75rem",
              whiteSpace: wordWrap ? "pre-wrap" : "pre",
              wordBreak: wordWrap ? "break-all" : "normal",
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              fontSize: "0.85rem",
              lineHeight: 1.6,
              display: "flex",
            }}
          >
            <code
              style={{
                display: "block",
                paddingRight: "0.75rem",
                marginRight: "0.75rem",
                borderRight: `1px solid ${colorScheme === "dark" ? "#333333" : "#cccccc"}`,
                color: colorScheme === "dark" ? "#555555" : "#999999",
                textAlign: "right",
                userSelect: "none",
                minWidth: `${Math.max(lines.length.toString().length, 2)}ch`,
                flexShrink: 0,
              }}
            >
              {lines.map((_, i) => (
                <span key={i} style={{ display: "block" }}>{i + 1}</span>
              ))}
            </code>
            <code
              className="hljs"
              style={{
                display: "block",
                flex: 1,
                overflow: wordWrap ? "visible" : "auto",
                background: "transparent",
                padding: 0,
              }}
              dangerouslySetInnerHTML={{ __html: highlighted.html }}
            />
          </pre>
        </Box>
      </Collapse>
    </Card>
  );
};

const SnippetList = ({
  snippets,
  shareId,
}: {
  snippets: Snippet[];
  shareId: string;
}) => {
  if (!snippets || snippets.length === 0) return null;

  return (
    <Stack spacing="sm">
      {snippets.map((snippet, i) => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          shareId={shareId}
          defaultExpanded={snippets.length <= 3 || i === 0}
        />
      ))}
    </Stack>
  );
};

export default SnippetList;
