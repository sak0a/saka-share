import {
  Badge,
  Box,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import React, { useCallback, useMemo, useRef } from "react";
import useTranslate from "../../hooks/useTranslate.hook";

export const LANGUAGES = [
  { value: "", label: "Auto-detect" },
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "scala", label: "Scala" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "sql", label: "SQL" },
  { value: "shell", label: "Shell / Bash" },
  { value: "powershell", label: "PowerShell" },
  { value: "yaml", label: "YAML" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "markdown", label: "Markdown" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "lua", label: "Lua" },
  { value: "r", label: "R" },
  { value: "dart", label: "Dart" },
  { value: "elixir", label: "Elixir" },
  { value: "haskell", label: "Haskell" },
];

export type SnippetDraft = {
  title: string;
  content: string;
  language: string;
};

const FONT_FAMILY = "'JetBrains Mono', 'Fira Code', 'Consolas', monospace";
const FONT_SIZE = "0.85rem";
const LINE_HEIGHT = 1.6;

const SnippetEditor = ({
  snippet,
  onChange,
  maxSize,
}: {
  snippet: SnippetDraft;
  onChange: (snippet: SnippetDraft) => void;
  maxSize: number;
}) => {
  const t = useTranslate();
  const { colorScheme } = useMantineTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLPreElement>(null);

  const [debouncedContent] = useDebouncedValue(snippet.content, 300);

  // Instant highlight for the backdrop so text is never invisible
  const highlighted = useMemo(() => {
    if (!snippet.content) return { html: "", language: "" };
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

  // Debounced language detection for the badge only
  const detectedLanguage = useMemo(() => {
    if (!debouncedContent) return "";
    if (snippet.language && snippet.language !== "plaintext") return snippet.language;
    try {
      return hljs.highlightAuto(debouncedContent).language || "plaintext";
    } catch {
      return "plaintext";
    }
  }, [debouncedContent, snippet.language]);

  const lines = (snippet.content || "\n").split("\n");
  const lineNumberWidth = Math.max(lines.length.toString().length, 2);
  const gutterWidth = `calc(${lineNumberWidth}ch + 1.75rem)`;

  const syncScroll = useCallback(() => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const val = ta.value;
        const updated = val.substring(0, start) + "  " + val.substring(end);
        onChange({ ...snippet, content: updated });
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        });
      }
    },
    [snippet, onChange],
  );

  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#1e1e1e" : "#ffffff";
  const gutterBg = isDark ? "#1e1e1e" : "#f5f5f5";
  const gutterBorder = isDark ? "#333333" : "#e0e0e0";
  const gutterColor = isDark ? "#555555" : "#999999";
  const borderColor = isDark ? "#333333" : "#d0d0d0";

  return (
    <Stack spacing="xs">
      <Group spacing="xs" grow>
        <TextInput
          size="xs"
          placeholder={t("upload.snippet.title-placeholder")}
          value={snippet.title}
          onChange={(e) => onChange({ ...snippet, title: e.currentTarget.value })}
          style={{ flex: 1 }}
        />
        <Select
          size="xs"
          placeholder={t("upload.paste.language")}
          data={LANGUAGES}
          value={snippet.language}
          onChange={(val) => onChange({ ...snippet, language: val || "" })}
          searchable
          clearable
          style={{ flex: 0, minWidth: 160 }}
        />
      </Group>

      {/* Code editor container */}
      <Box
        sx={{
          position: "relative",
          border: `1px solid ${borderColor}`,
          borderRadius: 4,
          overflow: "hidden",
          minHeight: 180,
          maxHeight: "50vh",
          backgroundColor: bgColor,
        }}
      >
        {/* Line numbers gutter */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: gutterWidth,
            backgroundColor: gutterBg,
            borderRight: `1px solid ${gutterBorder}`,
            zIndex: 2,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <pre
            style={{
              margin: 0,
              padding: "0.75rem 0.5rem 0.75rem 0.5rem",
              fontFamily: FONT_FAMILY,
              fontSize: FONT_SIZE,
              lineHeight: LINE_HEIGHT,
              textAlign: "right",
              color: gutterColor,
              userSelect: "none",
            }}
          >
            {lines.map((_, i) => (
              <span key={i} style={{ display: "block" }}>{i + 1}</span>
            ))}
          </pre>
        </Box>

        {/* Syntax-highlighted backdrop */}
        <pre
          ref={backdropRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 0,
            padding: `0.75rem 0.75rem 0.75rem ${gutterWidth}`,
            paddingLeft: `calc(${gutterWidth} + 0.75rem)`,
            fontFamily: FONT_FAMILY,
            fontSize: FONT_SIZE,
            lineHeight: LINE_HEIGHT,
            whiteSpace: "pre",
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 1,
            background: "transparent",
          }}
        >
          <code
            className="hljs"
            style={{
              background: "transparent",
              padding: 0,
              display: "block",
            }}
            dangerouslySetInnerHTML={{ __html: highlighted.html }}
          />
        </pre>

        {/* Editable textarea overlay */}
        <textarea
          ref={textareaRef}
          value={snippet.content}
          onChange={(e) => onChange({ ...snippet, content: e.target.value })}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          placeholder={t("upload.paste.placeholder")}
          spellCheck={false}
          style={{
            position: "relative",
            display: "block",
            width: "100%",
            minHeight: 180,
            maxHeight: "50vh",
            margin: 0,
            padding: `0.75rem 0.75rem 0.75rem calc(${gutterWidth} + 0.75rem)`,
            fontFamily: FONT_FAMILY,
            fontSize: FONT_SIZE,
            lineHeight: LINE_HEIGHT,
            whiteSpace: "pre",
            overflowWrap: "normal",
            overflow: "auto",
            border: "none",
            outline: "none",
            resize: "none",
            background: "transparent",
            color: "transparent",
            caretColor: isDark ? "#d4d4d4" : "#333333",
            zIndex: 3,
            WebkitTextFillColor: "transparent",
          }}
        />
      </Box>

      <Group position="apart">
        <Group spacing="xs">
          {debouncedContent && (
            <Badge variant="outline" size="sm">
              {detectedLanguage}
            </Badge>
          )}
          <Text size="xs" color="dimmed">
            {new TextEncoder().encode(snippet.content).length.toLocaleString()} / {maxSize.toLocaleString()} bytes
          </Text>
        </Group>
      </Group>
    </Stack>
  );
};

export default SnippetEditor;
