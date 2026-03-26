import { Global } from "@mantine/core";

const GlobalStyle = () => {
  return (
    <Global
      styles={(theme) => ({
        // Kill all border-radius globally
        "*, *::before, *::after": {
          borderRadius: "0 !important",
        },
        a: {
          color: "inherit",
          textDecoration: "none",
        },
        "table.md, table.md th:nth-of-type(odd), table.md td:nth-of-type(odd)":
          {
            background:
              theme.colorScheme == "dark"
                ? "rgba(40, 40, 40, 0.5)"
                : "rgba(230, 230, 230, 0.5)",
          },
        "table.md td": {
          paddingLeft: "0.5em",
          paddingRight: "0.5em",
        },
        "@keyframes accountFadeIn": {
          from: {
            opacity: 0,
            transform: "translateY(8px)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
        "@keyframes fadeSlideUp": {
          from: {
            opacity: 0,
            transform: "translateY(10px)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
        "@keyframes fadeOut": {
          from: {
            opacity: 1,
            transform: "translateY(0)",
          },
          to: {
            opacity: 0,
            transform: "translateY(-5px)",
          },
        },
      })}
    />
  );
};
export default GlobalStyle;
