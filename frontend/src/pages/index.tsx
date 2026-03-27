import {
  Button,
  Container,
  createStyles,
  Group,
  List,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TbCheck } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import Logo from "../components/Logo";
import Meta from "../components/Meta";
import useUser from "../hooks/user.hook";
import useConfig from "../hooks/config.hook";

const useStyles = createStyles((theme) => ({
  inner: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: `calc(${theme.spacing.md} * 5)`,
    paddingBottom: `calc(${theme.spacing.md} * 5)`,
    gap: theme.spacing.xl,
  },

  content: {
    maxWidth: 560,
    animation: "staggerFadeIn 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",

    [theme.fn.smallerThan("md")]: {
      maxWidth: "100%",
    },
  },

  title: {
    fontFamily: "'Chakra Petch', sans-serif",
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontSize: 52,
    lineHeight: 1.1,
    fontWeight: 900,
    letterSpacing: "-0.03em",
    textTransform: "uppercase" as const,

    [theme.fn.smallerThan("xs")]: {
      fontSize: 32,
    },
  },

  control: {
    [theme.fn.smallerThan("xs")]: {
      flex: 1,
    },
  },

  image: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation:
      "staggerFadeIn 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 200ms forwards",
    opacity: 0,

    [theme.fn.smallerThan("md")]: {
      display: "none",
    },
  },

  highlight: {
    position: "relative",
    display: "inline",
    color: theme.colorScheme === "dark" ? "#0a0a0a" : theme.white,
    backgroundColor: theme.colorScheme === "dark" ? "#8b5cf6" : theme.black,
    padding: "2px 10px",
    lineHeight: 1.3,
  },

  description: {
    fontFamily: "'Fira Code', monospace",
    color: theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.gray[6],
    fontSize: "0.9rem",
    lineHeight: 1.6,
    animation:
      "staggerFadeIn 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 100ms forwards",
    opacity: 0,
  },

  featureList: {
    animation:
      "staggerFadeIn 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 200ms forwards",
    opacity: 0,
  },

  featureItem: {
    fontFamily: "'Fira Code', monospace",
    fontSize: "0.85rem",
    "& b": {
      fontFamily: "'Chakra Petch', sans-serif",
      fontWeight: 700,
      textTransform: "uppercase" as const,
      letterSpacing: "0.03em",
    },
  },

  buttons: {
    animation:
      "staggerFadeIn 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 300ms forwards",
    opacity: 0,
  },

  primaryButton: {
    backgroundColor: theme.colorScheme === "dark" ? "#8b5cf6" : theme.black,
    color: theme.colorScheme === "dark" ? "#0a0a0a" : theme.white,
    border: "none",
    fontFamily: "'Chakra Petch', sans-serif",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    transition: "all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",

    "&:hover": {
      backgroundColor: theme.colorScheme === "dark" ? "#a78bfa" : theme.colors.gray[8],
      transform: "translateY(-2px)",
    },
  },

  sourceButton: {
    fontFamily: "'Fira Code', monospace",
    fontWeight: 500,
    letterSpacing: "0.04em",
    border: `1px solid ${
      theme.colorScheme === "dark" ? "#2a2a2a" : theme.colors.gray[3]
    }`,
    transition: "all 200ms ease",

    "&:hover": {
      borderColor: theme.colorScheme === "dark" ? "#8b5cf6" : theme.colors.gray[5],
      transform: "translateY(-2px)",
    },
  },

  logoWrapper: {
    position: "relative",
    padding: 40,

    "&::before": {
      content: "''",
      position: "absolute",
      inset: 0,
      border: `1px solid ${
        theme.colorScheme === "dark"
          ? "rgba(139, 92, 246, 0.15)"
          : theme.colors.gray[2]
      }`,
      animation: "borderPulse 3s ease-in-out infinite",
    },
  },
}));

export default function Home() {
  const { classes } = useStyles();
  const { refreshUser } = useUser();
  const router = useRouter();
  const config = useConfig();
  const [signupEnabled, setSignupEnabled] = useState(true);

  // If user is already authenticated, redirect to the upload page
  useEffect(() => {
    refreshUser().then((user) => {
      if (user) {
        router.replace("/upload");
      }
    });

    // If registration is disabled, get started button should redirect to the sign in page
    try {
      const allowRegistration = config.get("share.allowRegistration");
      setSignupEnabled(allowRegistration !== false);
    } catch (error) {
      setSignupEnabled(true);
    }
  }, [config]);

  const getButtonHref = () => {
    return signupEnabled ? "/auth/signUp" : "/auth/signIn";
  };

  return (
    <>
      <Meta title="Home" />
      <Container>
        <div className={classes.inner}>
          <div className={classes.content}>
            <Title className={classes.title}>
              <FormattedMessage
                id="home.title"
                values={{
                  h: (chunks) => (
                    <span className={classes.highlight}>{chunks}</span>
                  ),
                }}
              />
            </Title>
            <Text className={classes.description} mt="lg">
              <FormattedMessage id="home.description" />
            </Text>

            <List
              mt={30}
              spacing="sm"
              size="sm"
              className={classes.featureList}
              icon={
                <ThemeIcon
                  size={20}
                  sx={(theme) => ({
                    backgroundColor:
                      theme.colorScheme === "dark" ? "#8b5cf6" : theme.black,
                    color:
                      theme.colorScheme === "dark" ? "#0a0a0a" : theme.white,
                  })}
                >
                  <TbCheck size={12} />
                </ThemeIcon>
              }
            >
              <List.Item>
                <div className={classes.featureItem}>
                  <b>
                    <FormattedMessage id="home.bullet.a.name" />
                  </b>{" "}
                  — <FormattedMessage id="home.bullet.a.description" />
                </div>
              </List.Item>
              <List.Item>
                <div className={classes.featureItem}>
                  <b>
                    <FormattedMessage id="home.bullet.b.name" />
                  </b>{" "}
                  — <FormattedMessage id="home.bullet.b.description" />
                </div>
              </List.Item>
              <List.Item>
                <div className={classes.featureItem}>
                  <b>
                    <FormattedMessage id="home.bullet.c.name" />
                  </b>{" "}
                  — <FormattedMessage id="home.bullet.c.description" />
                </div>
              </List.Item>
            </List>

            <Group mt={30} className={classes.buttons}>
              <Button
                component={Link}
                href={getButtonHref()}
                size="md"
                className={classes.primaryButton}
              >
                <FormattedMessage id="home.button.start" />
              </Button>
              <Button
                component={Link}
                href="https://github.com/sak0a/saka-share"
                target="_blank"
                variant="default"
                size="md"
                className={classes.sourceButton}
              >
                <FormattedMessage id="home.button.source" />
              </Button>
            </Group>
          </div>
          <Group className={classes.image} align="center">
            <div className={classes.logoWrapper}>
              <Logo width={160} height={160} />
            </div>
          </Group>
        </div>
      </Container>
    </>
  );
}
