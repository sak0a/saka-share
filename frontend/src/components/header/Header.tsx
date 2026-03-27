import {
  ActionIcon,
  Box,
  Burger,
  Button,
  ColorScheme,
  Container,
  createStyles,
  Group,
  Header as MantineHeader,
  Menu,
  Paper,
  Stack,
  Text,
  Transition,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { TbLanguage, TbMoon, TbSun, TbUpload } from "react-icons/tb";
import { LOCALES } from "../../i18n/locales";
import useConfig from "../../hooks/config.hook";
import useUser from "../../hooks/user.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import i18nUtil from "../../utils/i18n.util";
import userPreferences from "../../utils/userPreferences.util";
import Logo from "../Logo";
import ActionAvatar from "./ActionAvatar";

const HEADER_HEIGHT = 60;

type NavLink = {
  link?: string;
  label?: string;
  component?: ReactNode;
  isUpload?: boolean;
  action?: () => Promise<void>;
};

const useStyles = createStyles((theme) => ({
  root: {
    position: "relative",
    zIndex: 1,
    borderBottom: `1px solid ${
      theme.colorScheme === "dark" ? "#1a1a1a" : theme.colors.gray[2]
    }`,
    backgroundColor:
      theme.colorScheme === "dark"
        ? "rgba(10, 10, 10, 0.85)"
        : "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
  },

  dropdown: {
    position: "absolute",
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: "hidden",
    backgroundColor:
      theme.colorScheme === "dark"
        ? "rgba(10, 10, 10, 0.95)"
        : theme.white,
    backdropFilter: "blur(12px)",

    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
  },

  links: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  burger: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  logoGroup: {
    transition: "opacity 200ms ease",
    "&:hover": {
      opacity: 0.7,
    },
  },

  logoText: {
    fontFamily: "'Chakra Petch', sans-serif",
    fontWeight: 800,
    textTransform: "uppercase" as const,
    letterSpacing: "0.12em",
    fontSize: "0.85rem",
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    textDecoration: "none",
    fontFamily: "'Fira Code', monospace",
    fontSize: "0.8rem",
    fontWeight: 500,
    letterSpacing: "0.02em",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[6],
    transition: "all 200ms ease",
    position: "relative" as const,

    "&:hover": {
      color:
        theme.colorScheme === "dark" ? "#8b5cf6" : theme.colors.gray[9],
      backgroundColor: "transparent",
    },

    "&::after": {
      content: "''",
      position: "absolute" as const,
      bottom: 2,
      left: 12,
      right: 12,
      height: 1,
      backgroundColor: "#8b5cf6",
      transform: "scaleX(0)",
      transformOrigin: "left",
      transition: "transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    },

    "&:hover::after": {
      transform: "scaleX(1)",
    },

    [theme.fn.smallerThan("sm")]: {
      padding: theme.spacing.md,
      "&::after": {
        display: "none",
      },
      "&:hover": {
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[5]
            : theme.colors.gray[0],
      },
    },
  },

  linkActive: {
    "&, &:hover": {
      color: theme.colorScheme === "dark" ? "#8b5cf6" : theme.colors.gray[9],
    },
    "&::after": {
      transform: "scaleX(1)",
    },
  },

  langBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    fontFamily: "'Fira Code', monospace",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.08em",
    border: `1px solid ${
      theme.colorScheme === "dark"
        ? theme.colors.dark[4]
        : theme.colors.gray[3]
    }`,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[7],
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: "all 200ms ease",

    "&:hover": {
      borderColor: theme.colorScheme === "dark" ? "#8b5cf6" : theme.colors.gray[5],
      color: theme.colorScheme === "dark" ? "#8b5cf6" : theme.colors.gray[9],
    },
  },

  uploadButton: {
    fontFamily: "'Chakra Petch', sans-serif",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    fontSize: "0.75rem",
    backgroundColor: theme.colorScheme === "dark" ? "#8b5cf6" : theme.black,
    color: theme.colorScheme === "dark" ? "#0a0a0a" : theme.white,
    border: "none",
    transition: "all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",

    "&:hover": {
      backgroundColor: theme.colorScheme === "dark" ? "#a78bfa" : theme.colors.gray[8],
      transform: "translateY(-1px)",
    },
  },
}));

const languageData = Object.values(LOCALES).map((l) => ({
  value: l.code,
  label: l.name,
}));

const ThemeToggle = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const handleToggle = () => {
    const next = colorScheme === "dark" ? "light" : "dark";
    userPreferences.set("colorScheme", next);
    toggleColorScheme(next as ColorScheme);
  };

  return (
    <ActionIcon
      variant="subtle"
      onClick={handleToggle}
      size={30}
    >
      {colorScheme === "dark" ? <TbSun size={18} /> : <TbMoon size={18} />}
    </ActionIcon>
  );
};

const LanguageBadge = () => {
  const { classes } = useStyles();
  const [currentLang, setCurrentLang] = useState("en-US");

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)language=([^;]*)/);
    if (match) setCurrentLang(match[1]);
  }, []);

  const shortCode = currentLang.split("-")[0].toUpperCase();

  return (
    <Menu shadow="md" width={180} position="bottom-end">
      <Menu.Target>
        <UnstyledButton className={classes.langBadge}>
          <TbLanguage size={12} style={{ marginRight: 4 }} />
          {shortCode}
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        {languageData.map((lang) => (
          <Menu.Item
            key={lang.value}
            onClick={() => {
              setCurrentLang(lang.value);
              i18nUtil.setLanguageCookie(lang.value);
              location.reload();
            }}
          >
            {lang.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

const Header = () => {
  const { user } = useUser();
  const router = useRouter();
  const config = useConfig();
  const t = useTranslate();

  const [opened, toggleOpened] = useDisclosure(false);

  const [currentRoute, setCurrentRoute] = useState("");

  useEffect(() => {
    setCurrentRoute(router.pathname);
  }, [router.pathname]);

  const authenticatedLinks: NavLink[] = [
    {
      link: "/upload",
      label: t("navbar.upload"),
      isUpload: true,
    },
  ];

  const rightLinks: ReactNode[] = [
    <ThemeToggle key="theme" />,
    <LanguageBadge key="lang" />,
    <ActionAvatar key="avatar" />,
  ];

  let unauthenticatedLinks: NavLink[] = [
    {
      link: "/auth/signIn",
      label: t("navbar.signin"),
    },
  ];

  if (config.get("share.allowUnauthenticatedShares")) {
    unauthenticatedLinks.unshift({
      link: "/upload",
      label: t("navbar.upload"),
      isUpload: true,
    });
  }

  if (config.get("general.showHomePage"))
    unauthenticatedLinks.unshift({
      link: "/",
      label: t("navbar.home"),
    });

  if (config.get("share.allowRegistration"))
    unauthenticatedLinks.push({
      link: "/auth/signUp",
      label: t("navbar.signup"),
    });

  const unauthRightLinks: ReactNode[] = [
    <ThemeToggle key="theme" />,
    <LanguageBadge key="lang" />,
  ];

  const { classes, cx } = useStyles();
  const items = (
    <>
      {(user ? authenticatedLinks : unauthenticatedLinks).map((link, i) => {
        if (link.component) {
          return (
            <Box pl={5} py={15} key={i}>
              {link.component}
            </Box>
          );
        }
        if (link.isUpload) {
          return (
            <Button
              key={link.label}
              component={Link}
              href={link.link ?? ""}
              size="xs"
              leftIcon={<TbUpload size={14} />}
              className={classes.uploadButton}
              onClick={() => toggleOpened.toggle()}
            >
              {link.label}
            </Button>
          );
        }
        return (
          <Link
            key={link.label}
            href={link.link ?? ""}
            onClick={() => toggleOpened.toggle()}
            className={cx(classes.link, {
              [classes.linkActive]: currentRoute == link.link,
            })}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
  const currentRightLinks = user ? rightLinks : unauthRightLinks;

  return (
    <MantineHeader height={HEADER_HEIGHT} mb={40} className={classes.root}>
      <Container className={classes.header}>
        <Link href="/" passHref>
          <Group className={classes.logoGroup} spacing={10}>
            <Logo height={28} width={28} />
            <Text className={classes.logoText}>
              {config.get("general.appName")}
            </Text>
          </Group>
        </Link>
        <Group spacing={5} className={classes.links}>
          {items}
        </Group>
        <Group spacing={8} noWrap>
          <Group spacing={8} noWrap className={classes.links}>
            {currentRightLinks}
          </Group>
          <Burger
            opened={opened}
            onClick={() => toggleOpened.toggle()}
            className={classes.burger}
            size="sm"
          />
        </Group>
        <Transition transition="pop-top-right" duration={200} mounted={opened}>
          {(styles) => (
            <Paper className={classes.dropdown} withBorder style={styles}>
              <Stack spacing={0}>
                {items}
                <Group px="md" py="sm" spacing={8}>
                  {currentRightLinks}
                </Group>
              </Stack>
            </Paper>
          )}
        </Transition>
      </Container>
    </MantineHeader>
  );
};

export default Header;
