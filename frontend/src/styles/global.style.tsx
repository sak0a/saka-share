import { Global } from "@mantine/core";

const GlobalStyle = () => {
  return (
    <Global
      styles={(theme) => ({
        // Kill all border-radius globally
        "*, *::before, *::after": {
          borderRadius: "0 !important",
        },

        body: {
          position: "relative",
          "&::before": {
            content: "''",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 9999,
            opacity: theme.colorScheme === "dark" ? 0.03 : 0.015,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
          },
        },

        a: {
          color: "inherit",
          textDecoration: "none",
        },

        "table.md, table.md th:nth-of-type(odd), table.md td:nth-of-type(odd)":
          {
            background:
              theme.colorScheme === "dark"
                ? "rgba(40, 40, 40, 0.5)"
                : "rgba(230, 230, 230, 0.5)",
          },
        "table.md td": {
          paddingLeft: "0.5em",
          paddingRight: "0.5em",
        },

        // Scrollbar styling for dark brutalist feel
        "::-webkit-scrollbar": {
          width: 6,
          height: 6,
        },
        "::-webkit-scrollbar-track": {
          background:
            theme.colorScheme === "dark" ? "#0a0a0a" : theme.colors.gray[1],
        },
        "::-webkit-scrollbar-thumb": {
          background:
            theme.colorScheme === "dark" ? "#2a2a2a" : theme.colors.gray[4],
          "&:hover": {
            background:
              theme.colorScheme === "dark" ? "#8b5cf6" : theme.colors.gray[6],
          },
        },

        // Selection color
        "::selection": {
          backgroundColor:
            theme.colorScheme === "dark"
              ? "rgba(139, 92, 246, 0.25)"
              : "rgba(0, 0, 0, 0.15)",
          color: theme.colorScheme === "dark" ? "#e8e8e8" : "#000",
        },

        // ─── ANIMATIONS ───────────────────────────────────────
        "@keyframes accountFadeIn": {
          from: {
            opacity: 0,
            transform: "translateY(12px)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },

        "@keyframes fadeSlideUp": {
          from: {
            opacity: 0,
            transform: "translateY(20px)",
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

        "@keyframes brutalistSlideIn": {
          "0%": {
            opacity: 0,
            transform: "translateX(-30px) skewX(-2deg)",
          },
          "100%": {
            opacity: 1,
            transform: "translateX(0) skewX(0deg)",
          },
        },

        "@keyframes scanline": {
          "0%": {
            transform: "translateY(-100%)",
          },
          "100%": {
            transform: "translateY(100vh)",
          },
        },

        "@keyframes glitchShift": {
          "0%, 100%": {
            transform: "translate(0)",
          },
          "20%": {
            transform: "translate(-3px, 3px)",
          },
          "40%": {
            transform: "translate(-3px, -3px)",
          },
          "60%": {
            transform: "translate(3px, 3px)",
          },
          "80%": {
            transform: "translate(3px, -3px)",
          },
        },

        "@keyframes glitchColor": {
          "0%, 100%": {
            textShadow: "none",
          },
          "25%": {
            textShadow: "-2px 0 #8b5cf6, 2px 0 #ff0040",
          },
          "50%": {
            textShadow: "2px 0 #8b5cf6, -2px 0 #00f0ff",
          },
          "75%": {
            textShadow: "-1px 0 #ff0040, 1px 0 #8b5cf6",
          },
        },

        "@keyframes borderPulse": {
          "0%, 100%": {
            borderColor:
              theme.colorScheme === "dark" ? "#2a2a2a" : theme.colors.gray[3],
          },
          "50%": {
            borderColor:
              theme.colorScheme === "dark"
                ? "rgba(139, 92, 246, 0.4)"
                : theme.colors.gray[5],
          },
        },

        "@keyframes dropzoneDash": {
          "0%": {
            backgroundPosition: "0 0",
          },
          "100%": {
            backgroundPosition: "60px 60px",
          },
        },

        "@keyframes accentGlow": {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(139, 92, 246, 0)",
          },
          "50%": {
            boxShadow: "0 0 20px 2px rgba(139, 92, 246, 0.15)",
          },
        },

        "@keyframes typewriter": {
          from: {
            width: 0,
          },
          to: {
            width: "100%",
          },
        },

        "@keyframes blink": {
          "0%, 100%": {
            borderColor: "transparent",
          },
          "50%": {
            borderColor:
              theme.colorScheme === "dark" ? "#8b5cf6" : theme.black,
          },
        },

        "@keyframes staggerFadeIn": {
          from: {
            opacity: 0,
            transform: "translateY(16px)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },

        "@keyframes marquee": {
          "0%": {
            transform: "translateX(0)",
          },
          "100%": {
            transform: "translateX(-50%)",
          },
        },
      })}
    />
  );
};
export default GlobalStyle;
