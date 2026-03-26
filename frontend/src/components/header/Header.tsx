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

  link: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },

    [theme.fn.smallerThan("sm")]: {
      borderRadius: 0,
      padding: theme.spacing.md,
    },
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.fn.rgba(theme.colors[theme.primaryColor][9], 0.25)
          : theme.colors[theme.primaryColor][0],
      color:
        theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 3 : 7],
    },
  },

  langBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.5px",
    borderRadius: theme.radius.sm,
    border: `1px solid ${
      theme.colorScheme === "dark"
        ? theme.colors.dark[4]
        : theme.colors.gray[3]
    }`,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: "background-color 150ms ease",

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
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
  const [currentLang, setCurrentLang] = useState(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|;\s*)language=([^;]*)/);
      return match ? match[1] : "en-US";
    }
    return "en-US";
  });

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
    {
      component: <ThemeToggle />,
    },
    {
      component: <LanguageBadge />,
    },
    {
      component: <ActionAvatar />,
    },
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

  unauthenticatedLinks.push(
    { component: <ThemeToggle /> },
    { component: <LanguageBadge /> },
  );

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
              variant="filled"
              size="xs"
              leftIcon={<TbUpload size={14} />}
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
  return (
    <MantineHeader height={HEADER_HEIGHT} mb={40} className={classes.root}>
      <Container className={classes.header}>
        <Link href="/" passHref>
          <Group>
            <Logo height={35} width={35} />
            <Text weight={600}>{config.get("general.appName")}</Text>
          </Group>
        </Link>
        <Group spacing={5} className={classes.links}>
          {items}
        </Group>
        <Group spacing={8} noWrap>
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
              <Stack spacing={0}>{items}</Stack>
            </Paper>
          )}
        </Transition>
      </Container>
    </MantineHeader>
  );
};

export default Header;
