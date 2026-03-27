import { MantineThemeOverride } from "@mantine/core";

export default {
  fontFamily: "'Fira Code', 'Courier New', monospace",
  headings: {
    fontFamily: "'Chakra Petch', 'Impact', sans-serif",
    fontWeight: 700,
  },
  colors: {
    // Violet brutalist accent palette matching the logo
    printstream: [
      "#f0e8ff", // 0
      "#d9c6ff", // 1
      "#c4a3ff", // 2
      "#a78bfa", // 3
      "#8b5cf6", // 4 - primary accent
      "#7c3aed", // 5
      "#6d28d9", // 6
      "#5b21b6", // 7
      "#4c1d95", // 8
      "#3b0f80", // 9
    ],
    dark: [
      "#e8e8e8", // 0 - text
      "#a0a0a0", // 1 - dimmed text
      "#6b6b6b", // 2 - secondary
      "#444444", // 3 - muted
      "#2a2a2a", // 4 - borders
      "#1a1a1a", // 5 - hover
      "#111111", // 6 - surface/cards
      "#0a0a0a", // 7 - body bg
      "#050505", // 8
      "#000000", // 9
    ],
  },
  primaryColor: "printstream",
  primaryShade: 4,
  defaultRadius: 0,
  radius: {
    xs: 0,
    sm: 0,
    md: 0,
    lg: 0,
    xl: 0,
  },
  components: {
    Modal: {
      defaultProps: { radius: 0 },
      styles: (theme: any) => ({
        title: {
          fontSize: theme.fontSizes.lg,
          fontWeight: 700,
          fontFamily: "'Chakra Petch', sans-serif",
          textTransform: "uppercase" as const,
          letterSpacing: "0.05em",
        },
        header: {
          borderBottom: `1px solid ${
            theme.colorScheme === "dark"
              ? theme.colors.dark[4]
              : theme.colors.gray[3]
          }`,
        },
        body: {
          paddingTop: theme.spacing.md,
        },
      }),
    },
    Button: {
      defaultProps: { radius: 0 },
      styles: (theme: any) => ({
        root: {
          fontFamily: "'Chakra Petch', sans-serif",
          fontWeight: 600,
          textTransform: "uppercase" as const,
          letterSpacing: "0.08em",
          fontSize: "0.8rem",
          transition: "all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          border:
            theme.colorScheme === "dark" ? "1px solid #2a2a2a" : undefined,
          "&:hover": {
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0px)",
          },
        },
      }),
    },
    Card: {
      defaultProps: { radius: 0 },
      styles: (theme: any) => ({
        root: {
          transition: "border-color 300ms ease, box-shadow 300ms ease",
          "&:hover": {
            borderColor:
              theme.colorScheme === "dark" ? "#8b5cf6" : theme.colors.gray[5],
          },
        },
      }),
    },
    TextInput: {
      defaultProps: { radius: 0 },
      styles: (theme: any) => ({
        input: {
          fontFamily: "'Fira Code', monospace",
          fontSize: "0.85rem",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
          "&:focus": {
            borderColor: "#8b5cf6",
            boxShadow:
              theme.colorScheme === "dark"
                ? "0 0 0 1px rgba(139, 92, 246, 0.3)"
                : undefined,
          },
        },
        label: {
          fontFamily: "'Chakra Petch', sans-serif",
          fontWeight: 600,
          textTransform: "uppercase" as const,
          letterSpacing: "0.04em",
          fontSize: "0.75rem",
        },
      }),
    },
    PasswordInput: {
      defaultProps: { radius: 0 },
      styles: (theme: any) => ({
        input: {
          fontFamily: "'Fira Code', monospace",
          fontSize: "0.85rem",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
          "&:focus-within": {
            borderColor: "#8b5cf6",
            boxShadow:
              theme.colorScheme === "dark"
                ? "0 0 0 1px rgba(139, 92, 246, 0.3)"
                : undefined,
          },
        },
        label: {
          fontFamily: "'Chakra Petch', sans-serif",
          fontWeight: 600,
          textTransform: "uppercase" as const,
          letterSpacing: "0.04em",
          fontSize: "0.75rem",
        },
      }),
    },
    NumberInput: {
      defaultProps: { radius: 0 },
      styles: () => ({
        input: {
          fontFamily: "'Fira Code', monospace",
          fontSize: "0.85rem",
        },
        label: {
          fontFamily: "'Chakra Petch', sans-serif",
          fontWeight: 600,
          textTransform: "uppercase" as const,
          letterSpacing: "0.04em",
          fontSize: "0.75rem",
        },
      }),
    },
    Select: {
      defaultProps: { radius: 0 },
      styles: () => ({
        input: { fontFamily: "'Fira Code', monospace", fontSize: "0.85rem" },
        label: {
          fontFamily: "'Chakra Petch', sans-serif",
          fontWeight: 600,
          textTransform: "uppercase" as const,
          letterSpacing: "0.04em",
          fontSize: "0.75rem",
        },
      }),
    },
    MultiSelect: {
      defaultProps: { radius: 0 },
      styles: () => ({
        input: { fontFamily: "'Fira Code', monospace", fontSize: "0.85rem" },
      }),
    },
    Textarea: {
      defaultProps: { radius: 0 },
      styles: () => ({
        input: { fontFamily: "'Fira Code', monospace", fontSize: "0.85rem" },
        label: {
          fontFamily: "'Chakra Petch', sans-serif",
          fontWeight: 600,
          textTransform: "uppercase" as const,
          letterSpacing: "0.04em",
          fontSize: "0.75rem",
        },
      }),
    },
    Paper: {
      defaultProps: { radius: 0 },
      styles: (theme: any) => ({
        root: {
          transition: "border-color 300ms ease",
        },
      }),
    },
    Notification: { defaultProps: { radius: 0 } },
    Badge: {
      defaultProps: { radius: 0 },
      styles: () => ({
        root: {
          fontFamily: "'Fira Code', monospace",
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
        },
      }),
    },
    ActionIcon: {
      defaultProps: { radius: 0 },
      styles: () => ({
        root: {
          transition: "all 150ms ease",
          "&:hover": {
            transform: "scale(1.1)",
          },
        },
      }),
    },
    Alert: { defaultProps: { radius: 0 } },
    Accordion: { defaultProps: { radius: 0 } },
    Checkbox: { defaultProps: { radius: 0 } },
    Switch: { defaultProps: { radius: 0 } },
    Tooltip: { defaultProps: { radius: 0 } },
    SegmentedControl: { defaultProps: { radius: 0 } },
    Tabs: {
      styles: (theme: any) => ({
        tab: {
          fontFamily: "'Chakra Petch', sans-serif",
          fontWeight: 600,
          textTransform: "uppercase" as const,
          letterSpacing: "0.04em",
          fontSize: "0.8rem",
          transition: "all 200ms ease",
        },
      }),
    },
    Table: {
      styles: (theme: any) => ({
        root: {
          "& thead th": {
            fontFamily: "'Chakra Petch', sans-serif",
            fontWeight: 600,
            textTransform: "uppercase" as const,
            letterSpacing: "0.06em",
            fontSize: "0.7rem",
            borderBottom: `2px solid ${
              theme.colorScheme === "dark" ? "#8b5cf6" : theme.colors.gray[4]
            }`,
          },
          "& tbody tr": {
            transition: "background-color 150ms ease",
          },
          "& tbody tr:hover": {
            backgroundColor:
              theme.colorScheme === "dark"
                ? "rgba(139, 92, 246, 0.04)"
                : theme.colors.gray[0],
          },
        },
      }),
    },
    Title: {
      styles: () => ({
        root: {
          fontFamily: "'Chakra Petch', sans-serif",
          letterSpacing: "-0.01em",
        },
      }),
    },
    Anchor: {
      styles: (theme: any) => ({
        root: {
          color:
            theme.colorScheme === "dark" ? "#a78bfa" : theme.colors.gray[8],
          transition: "color 150ms ease",
          "&:hover": {
            color:
              theme.colorScheme === "dark"
                ? "#c4a3ff"
                : theme.colors.gray[9],
          },
        },
      }),
    },
    Menu: {
      styles: (theme: any) => ({
        dropdown: {
          border: `1px solid ${
            theme.colorScheme === "dark" ? "#2a2a2a" : theme.colors.gray[3]
          }`,
          backdropFilter: "blur(12px)",
          backgroundColor:
            theme.colorScheme === "dark"
              ? "rgba(17, 17, 17, 0.95)"
              : undefined,
        },
        item: {
          fontFamily: "'Fira Code', monospace",
          fontSize: "0.82rem",
          transition: "background-color 150ms ease",
        },
      }),
    },
  },
} as unknown as MantineThemeOverride;
