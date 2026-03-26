import { MantineThemeOverride } from "@mantine/core";

export default {
  colors: {
    // Printstream greyscale palette
    printstream: [
      "#f5f5f5",
      "#e0e0e0",
      "#bdbdbd",
      "#9e9e9e",
      "#757575",
      "#616161",
      "#424242",
      "#303030",
      "#212121",
      "#121212",
    ],
    dark: [
      "#ffffff", // 0 - text
      "#c1c1c1", // 1 - dimmed text
      "#8e8e8e", // 2 - secondary
      "#5c5c5c", // 3 - muted
      "#3a3a3a", // 4 - borders
      "#2a2a2a", // 5 - hover
      "#1e1e1e", // 6 - surface/cards
      "#141414", // 7 - body bg
      "#0a0a0a", // 8
      "#050505", // 9
    ],
  },
  primaryColor: "printstream",
  primaryShade: 6,
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
        },
      }),
    },
    Button: { defaultProps: { radius: 0 } },
    Card: { defaultProps: { radius: 0 } },
    TextInput: { defaultProps: { radius: 0 } },
    PasswordInput: { defaultProps: { radius: 0 } },
    NumberInput: { defaultProps: { radius: 0 } },
    Select: { defaultProps: { radius: 0 } },
    MultiSelect: { defaultProps: { radius: 0 } },
    Textarea: { defaultProps: { radius: 0 } },
    Paper: { defaultProps: { radius: 0 } },
    Notification: { defaultProps: { radius: 0 } },
    Badge: { defaultProps: { radius: 0 } },
    ActionIcon: { defaultProps: { radius: 0 } },
    Alert: { defaultProps: { radius: 0 } },
    Accordion: { defaultProps: { radius: 0 } },
    Checkbox: { defaultProps: { radius: 0 } },
    Switch: { defaultProps: { radius: 0 } },
    Tooltip: { defaultProps: { radius: 0 } },
    SegmentedControl: { defaultProps: { radius: 0 } },
  },
} as unknown as MantineThemeOverride;
