import React from "react";
import { Button, createStyles, Stack, Text, Title } from "@mantine/core";
import Meta from "../components/Meta";
import useTranslate from "../hooks/useTranslate.hook";
import { useRouter } from "next/router";
import { FormattedMessage } from "react-intl";
import { safeRedirectPath } from "../utils/router.util";

const useStyle = createStyles((theme) => ({
  wrapper: {
    animation: "staggerFadeIn 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
    paddingTop: 40,
  },

  title: {
    fontFamily: "'Chakra Petch', sans-serif",
    fontSize: 80,
    fontWeight: 900,
    textTransform: "uppercase" as const,
    letterSpacing: "-0.03em",
    lineHeight: 1,
    color: theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.gray[3],

    [theme.fn.smallerThan("sm")]: {
      fontSize: 48,
    },
  },

  message: {
    fontFamily: "'Fira Code', monospace",
    fontSize: "0.9rem",
    lineHeight: 1.6,
  },

  button: {
    backgroundColor: theme.colorScheme === "dark" ? "#8b5cf6" : theme.black,
    color: theme.colorScheme === "dark" ? "#0a0a0a" : theme.white,
    border: "none",
    fontFamily: "'Chakra Petch', sans-serif",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    transition: "all 200ms ease",
    "&:hover": {
      backgroundColor: theme.colorScheme === "dark" ? "#a78bfa" : theme.colors.gray[8],
      transform: "translateY(-2px)",
    },
  },
}));

export default function Error() {
  const { classes } = useStyle();
  const t = useTranslate();
  const router = useRouter();

  const params = router.query.params
    ? (router.query.params as string).split(",").map((param) => {
        return t(`error.param.${param}`);
      })
    : [];

  return (
    <>
      <Meta title={t("error.title")} />
      <Stack align="center" className={classes.wrapper}>
        <Title order={3} className={classes.title}>
          {t("error.description")}
        </Title>
        <Text mt="xl" size="lg" className={classes.message}>
          <FormattedMessage
            id={`error.msg.${router.query.error || "default"}`}
            values={Object.fromEntries(
              [params].map((value, key) => [key.toString(), value]),
            )}
          />
        </Text>
        <Button
          mt="xl"
          className={classes.button}
          onClick={() =>
            router.push(safeRedirectPath(router.query.redirect as string))
          }
        >
          {t("error.button.back")}
        </Button>
      </Stack>
    </>
  );
}
