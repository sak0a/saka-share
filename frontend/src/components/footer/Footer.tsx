import { Anchor, Footer as MFooter, SimpleGrid, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";

const Footer = () => {
  const t = useTranslate();
  const config = useConfig();
  const hasImprint = !!(
    config.get("legal.imprintUrl") || config.get("legal.imprintText")
  );
  const hasPrivacy = !!(
    config.get("legal.privacyPolicyUrl") ||
    config.get("legal.privacyPolicyText")
  );
  const imprintUrl =
    (!config.get("legal.imprintText") && config.get("legal.imprintUrl")) ||
    "/imprint";
  const privacyUrl =
    (!config.get("legal.privacyPolicyText") &&
      config.get("legal.privacyPolicyUrl")) ||
    "/privacy";

  const isMobile = useMediaQuery("(max-width: 700px)");

  return (
    <MFooter
      height="auto"
      py={10}
      px="xl"
      zIndex={100}
      sx={(theme) => ({
        borderTop: `1px solid ${
          theme.colorScheme === "dark" ? "#1a1a1a" : theme.colors.gray[2]
        }`,
        backgroundColor:
          theme.colorScheme === "dark" ? "transparent" : undefined,
      })}
    >
      <SimpleGrid cols={isMobile ? 2 : 3} m={0}>
        {!isMobile && <div></div>}
        <Text
          size="xs"
          color="dimmed"
          align={isMobile ? "left" : "center"}
          sx={{
            fontFamily: "'Fira Code', monospace",
            letterSpacing: "0.04em",
            fontSize: "0.7rem",
          }}
        >
          Powered by{" "}
          <Anchor
            size="xs"
            href="https://github.com/sak0a/saka-share"
            target="_blank"
            sx={(theme) => ({
              fontSize: "0.7rem",
              fontFamily: "'Fira Code', monospace",
              transition: "color 200ms ease",
              "&:hover": {
                color: theme.colorScheme === "dark" ? "#8b5cf6" : theme.black,
              },
            })}
          >
            Saka Share
          </Anchor>
        </Text>
        <div>
          {config.get("legal.enabled") && (
            <Text
              size="xs"
              color="dimmed"
              align="right"
              sx={{
                fontFamily: "'Fira Code', monospace",
                fontSize: "0.7rem",
              }}
            >
              {hasImprint && (
                <Anchor size="xs" href={imprintUrl} sx={{ fontSize: "0.7rem" }}>
                  {t("imprint.title")}
                </Anchor>
              )}
              {hasImprint && hasPrivacy && " · "}
              {hasPrivacy && (
                <Anchor size="xs" href={privacyUrl} sx={{ fontSize: "0.7rem" }}>
                  {t("privacy.title")}
                </Anchor>
              )}
            </Text>
          )}
        </div>
      </SimpleGrid>
    </MFooter>
  );
};

export default Footer;
