# Navigation & Account Pages Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the header nav (Upload CTA + theme toggle + language badge + consolidated avatar menu) and add a shared sidebar layout with fluent animations to all account pages.

**Architecture:** Replace the current mix of text links and icon dropdowns with a clean Upload button + utility icons + single avatar menu. Create an `AccountLayout` wrapper with left sidebar nav for `/account`, `/account/shares`, `/account/reverseShares`. Replace share tables with animated stacked row cards.

**Tech Stack:** Mantine v6, Next.js 14, React 18, CSS keyframe animations, react-icons/tb

---

### Task 1: Update ActionAvatar — Add Shares & Reverse Shares to dropdown

**Files:**
- Modify: `frontend/src/components/header/ActionAvatar.tsx`

- [ ] **Step 1: Add share links to avatar dropdown**

Replace the entire content of `frontend/src/components/header/ActionAvatar.tsx`:

```tsx
import { ActionIcon, Avatar, Menu } from "@mantine/core";
import Link from "next/link";
import {
  TbArrowLoopLeft,
  TbDoorExit,
  TbLink,
  TbSettings,
  TbUser,
} from "react-icons/tb";
import useUser from "../../hooks/user.hook";
import authService from "../../services/auth.service";
import { FormattedMessage } from "react-intl";

const ActionAvatar = () => {
  const { user } = useUser();

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon>
          <Avatar size={28} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          component={Link}
          href="/account/shares"
          icon={<TbLink size={14} />}
        >
          <FormattedMessage id="navbar.links.shares" />
        </Menu.Item>
        <Menu.Item
          component={Link}
          href="/account/reverseShares"
          icon={<TbArrowLoopLeft size={14} />}
        >
          <FormattedMessage id="navbar.links.reverse" />
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          component={Link}
          href="/account"
          icon={<TbUser size={14} />}
        >
          <FormattedMessage id="navbar.avatar.account" />
        </Menu.Item>
        {user!.isAdmin && (
          <Menu.Item
            component={Link}
            href="/admin"
            icon={<TbSettings size={14} />}
          >
            <FormattedMessage id="navbar.avatar.admin" />
          </Menu.Item>
        )}
        <Menu.Divider />
        <Menu.Item
          onClick={async () => {
            await authService.signOut();
          }}
          icon={<TbDoorExit size={14} />}
        >
          <FormattedMessage id="navbar.avatar.signout" />
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default ActionAvatar;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/header/ActionAvatar.tsx
git commit -m "feat(nav): add shares links to avatar dropdown menu"
```

---

### Task 2: Redesign Header — Upload CTA, Language Badge, remove NavbarShareMenu

**Files:**
- Modify: `frontend/src/components/header/Header.tsx`
- Delete: `frontend/src/components/header/NavbarShareMenu.tsx`

- [ ] **Step 1: Rewrite Header.tsx**

Replace the entire content of `frontend/src/components/header/Header.tsx`:

```tsx
import {
  ActionIcon,
  Box,
  Burger,
  Button,
  ColorScheme,
  Container,
  createStyles,
  Group,
  Menu,
  Paper,
  Stack,
  Text,
  Transition,
  UnstyledButton,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useColorScheme, useDisclosure } from "@mantine/hooks";
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
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.5px",
    border: `1px solid ${
      theme.colorScheme === "dark"
        ? theme.colors.dark[4]
        : theme.colors.gray[3]
    }`,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[6],
    cursor: "pointer",
    transition: "background 150ms ease",
    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[1],
    },
  },
}));

const languageData = Object.values(LOCALES).map((l) => ({
  code: l.code,
  name: l.name,
}));

const ThemeToggle = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const handleToggle = () => {
    const next = colorScheme === "dark" ? "light" : "dark";
    userPreferences.set("colorScheme", next);
    toggleColorScheme(next as ColorScheme);
  };

  return (
    <ActionIcon variant="subtle" onClick={handleToggle} size={30}>
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

  // Extract short code (e.g. "en-US" -> "EN")
  const shortCode = currentLang.split("-")[0].toUpperCase();

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <UnstyledButton className={classes.langBadge}>{shortCode}</UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        {languageData.map((lang) => (
          <Menu.Item
            key={lang.code}
            onClick={() => {
              setCurrentLang(lang.code);
              i18nUtil.setLanguageCookie(lang.code);
              location.reload();
            }}
            sx={(theme) => ({
              fontWeight: lang.code === currentLang ? 600 : 400,
              backgroundColor:
                lang.code === currentLang
                  ? theme.colorScheme === "dark"
                    ? theme.colors.dark[5]
                    : theme.colors.gray[1]
                  : undefined,
            })}
          >
            {lang.name}
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
      component: (
        <Button
          component={Link}
          href="/upload"
          variant="filled"
          size="xs"
          leftIcon={<TbUpload size={14} />}
        >
          {t("navbar.upload")}
        </Button>
      ),
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
      component: (
        <Button
          component={Link}
          href="/upload"
          variant="filled"
          size="xs"
          leftIcon={<TbUpload size={14} />}
        >
          {t("navbar.upload")}
        </Button>
      ),
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

  // Always add theme toggle and language badge for unauthenticated
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
        <Burger
          opened={opened}
          onClick={() => toggleOpened.toggle()}
          className={classes.burger}
          size="sm"
        />
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

// Need to import MantineHeader
import { Header as MantineHeader } from "@mantine/core";

export default Header;
```

**Wait — the import for `Header as MantineHeader` is already at the top in the `@mantine/core` import. Let me fix that.** The `MantineHeader` import needs to be in the top import block. Here's the corrected top imports — the `Header as MantineHeader` stays in the main `@mantine/core` import:

The top import from `@mantine/core` should be:
```tsx
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
```

And remove the standalone `import { Header as MantineHeader }` line at the bottom.

- [ ] **Step 2: Delete NavbarShareMenu**

```bash
rm frontend/src/components/header/NavbarShareMenu.tsx
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/header/Header.tsx
git rm frontend/src/components/header/NavbarShareMenu.tsx
git commit -m "feat(nav): redesign header with Upload CTA, language badge, consolidated avatar menu"
```

---

### Task 3: Create AccountLayout with sidebar navigation

**Files:**
- Create: `frontend/src/components/account/AccountLayout.tsx`

- [ ] **Step 1: Create the AccountLayout component**

Write to `frontend/src/components/account/AccountLayout.tsx`:

```tsx
import {
  Box,
  Container,
  createStyles,
  Group,
  Text,
  UnstyledButton,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { TbArrowLoopLeft, TbLink, TbUser } from "react-icons/tb";
import useTranslate from "../../hooks/useTranslate.hook";

const useStyles = createStyles((theme) => ({
  wrapper: {
    display: "flex",
    gap: theme.spacing.xl,

    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
      gap: 0,
    },
  },

  sidebar: {
    width: 180,
    flexShrink: 0,

    [theme.fn.smallerThan("sm")]: {
      width: "100%",
      display: "flex",
      gap: 0,
      marginBottom: theme.spacing.md,
      borderBottom: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[3]
      }`,
    },
  },

  navLink: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.xs,
    padding: "10px 14px",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
    borderLeft: "2px solid transparent",
    transition: "all 150ms ease",
    textDecoration: "none",

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[1],
    },

    [theme.fn.smallerThan("sm")]: {
      borderLeft: "none",
      borderBottom: "2px solid transparent",
      flex: 1,
      justifyContent: "center",
      padding: "10px 8px",
    },
  },

  navLinkActive: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[9],
    borderLeftColor:
      theme.colorScheme === "dark"
        ? theme.colors.printstream[4]
        : theme.colors.printstream[6],
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.gray[0],

    [theme.fn.smallerThan("sm")]: {
      borderLeftColor: "transparent",
      borderBottomColor:
        theme.colorScheme === "dark"
          ? theme.colors.printstream[4]
          : theme.colors.printstream[6],
    },
  },

  content: {
    flex: 1,
    minWidth: 0,
    animation: "accountFadeIn 200ms ease forwards",
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
}));

const NAV_ITEMS = [
  { href: "/account", labelKey: "account.title", icon: TbUser },
  { href: "/account/shares", labelKey: "account.shares.title", icon: TbLink },
  {
    href: "/account/reverseShares",
    labelKey: "account.reverseShares.title",
    icon: TbArrowLoopLeft,
  },
];

const AccountLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const t = useTranslate();
  const { classes, cx } = useStyles();

  return (
    <Container size="lg">
      <div className={classes.wrapper}>
        <nav className={classes.sidebar}>
          {NAV_ITEMS.map((item) => (
            <UnstyledButton
              key={item.href}
              component={Link}
              href={item.href}
              className={cx(classes.navLink, {
                [classes.navLinkActive]: router.pathname === item.href,
              })}
            >
              <item.icon size={16} />
              <Text size="sm" inherit>
                {t(item.labelKey)}
              </Text>
            </UnstyledButton>
          ))}
        </nav>
        <div className={classes.content} key={router.pathname}>
          {children}
        </div>
      </div>
    </Container>
  );
};

export default AccountLayout;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/account/AccountLayout.tsx
git commit -m "feat(account): create AccountLayout with sidebar navigation"
```

---

### Task 4: Wrap account index page in AccountLayout

**Files:**
- Modify: `frontend/src/pages/account/index.tsx`

- [ ] **Step 1: Add AccountLayout wrapper**

In `frontend/src/pages/account/index.tsx`, add the import at the top (after existing imports):

```tsx
import AccountLayout from "../../components/account/AccountLayout";
```

Then replace the outer `<Container size="sm">` wrapper with `<AccountLayout>`, and remove the `Container` import if it's no longer used elsewhere. The return statement should change from:

```tsx
  return (
    <>
      <Meta title={t("account.title")} />
      <Container size="sm">
        <Title order={3} mb="xs">
```

To:

```tsx
  return (
    <>
      <Meta title={t("account.title")} />
      <AccountLayout>
        <Title order={3} mb="xs">
```

And the closing tag changes from `</Container>` to `</AccountLayout>` (near the end of the return, before `</>`).

Remove `Container` from the `@mantine/core` import since it's no longer used in this file.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/account/index.tsx
git commit -m "feat(account): wrap account settings page in AccountLayout"
```

---

### Task 5: Redesign My Shares page — row list with animations

**Files:**
- Modify: `frontend/src/pages/account/shares.tsx`

- [ ] **Step 1: Rewrite shares.tsx with row list and animations**

Replace the entire content of `frontend/src/pages/account/shares.tsx`:

```tsx
import {
  ActionIcon,
  Box,
  Button,
  Center,
  createStyles,
  Group,
  Space,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { useModals } from "@mantine/modals";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TbEdit, TbInfoCircle, TbLink, TbLock, TbTrash } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import Meta from "../../components/Meta";
import AccountLayout from "../../components/account/AccountLayout";
import showShareInformationsModal from "../../components/account/showShareInformationsModal";
import showShareLinkModal from "../../components/account/showShareLinkModal";
import CenterLoader from "../../components/core/CenterLoader";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { MyShare } from "../../types/share.type";
import toast from "../../utils/toast.util";

const useStyles = createStyles((theme) => ({
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
    from: { opacity: 1, transform: "translateY(0)" },
    to: { opacity: 0, transform: "translateY(-5px)" },
  },

  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    border: `1px solid ${
      theme.colorScheme === "dark"
        ? theme.colors.dark[4]
        : theme.colors.gray[3]
    }`,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.white,
    marginBottom: 8,
    borderLeft: "2px solid transparent",
    transition: "all 150ms ease",
    opacity: 0,
    animation: "$fadeSlideUp 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards",

    "&:hover": {
      borderLeftColor:
        theme.colorScheme === "dark"
          ? theme.colors.printstream[4]
          : theme.colors.printstream[6],
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[0],
    },
  },

  rowDeleting: {
    animation: "$fadeOut 200ms ease forwards",
  },

  stat: {
    textAlign: "center" as const,
    minWidth: 60,
  },

  statLabel: {
    fontSize: 9,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[2]
        : theme.colors.gray[5],
  },
}));

const MyShares = () => {
  const modals = useModals();
  const clipboard = useClipboard();
  const config = useConfig();
  const t = useTranslate();
  const { classes, cx } = useStyles();

  const [shares, setShares] = useState<MyShare[]>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    shareService.getMyShares().then((shares) => setShares(shares));
  }, []);

  const handleDelete = (share: MyShare) => {
    modals.openConfirmModal({
      title: t("account.shares.modal.delete.title", {
        share: share.id,
      }),
      children: (
        <Text size="sm">
          <FormattedMessage id="account.shares.modal.delete.description" />
        </Text>
      ),
      confirmProps: {
        color: "red",
      },
      labels: {
        confirm: t("common.button.delete"),
        cancel: t("common.button.cancel"),
      },
      onConfirm: () => {
        setDeletingId(share.id);
        shareService.remove(share.id);
        setTimeout(() => {
          setShares((prev) => prev?.filter((item) => item.id !== share.id));
          setDeletingId(null);
        }, 250);
      },
    });
  };

  if (!shares) return <CenterLoader />;

  return (
    <>
      <Meta title={t("account.shares.title")} />
      <AccountLayout>
        <Title mb={30} order={3}>
          <FormattedMessage id="account.shares.title" />
        </Title>
        {shares.length == 0 ? (
          <Center style={{ height: "70vh" }}>
            <Stack align="center" spacing={10}>
              <Title order={3}>
                <FormattedMessage id="account.shares.title.empty" />
              </Title>
              <Text>
                <FormattedMessage id="account.shares.description.empty" />
              </Text>
              <Space h={5} />
              <Button component={Link} href="/upload" variant="light">
                <FormattedMessage id="account.shares.button.create" />
              </Button>
            </Stack>
          </Center>
        ) : (
          <Stack spacing={0}>
            {shares.map((share, index) => (
              <Box
                key={share.id}
                className={cx(classes.row, {
                  [classes.rowDeleting]: deletingId === share.id,
                })}
                sx={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Left: Name + ID */}
                <Box>
                  <Text weight={600} size="sm">
                    {share.name}
                  </Text>
                  <Group spacing={4}>
                    <Text color="dimmed" size="xs">
                      {share.id}
                    </Text>
                    {share.security.passwordProtected && (
                      <TbLock
                        size={12}
                        color="orange"
                        title={t("account.shares.table.password-protected")}
                      />
                    )}
                  </Group>
                </Box>

                {/* Center: Stats */}
                <Group spacing="xl">
                  <Box className={classes.stat}>
                    <Text weight={500} size="sm">
                      {share.security.maxViews
                        ? `${share.views}/${share.security.maxViews}`
                        : share.views}
                    </Text>
                    <Text className={classes.statLabel}>
                      <FormattedMessage id="account.shares.table.visitors" />
                    </Text>
                  </Box>
                  <Box className={classes.stat}>
                    <Text weight={500} size="sm">
                      {moment(share.expiration).unix() === 0
                        ? t("account.shares.table.expiry-never")
                        : moment(share.expiration).format("ll")}
                    </Text>
                    <Text className={classes.statLabel}>
                      <FormattedMessage id="account.shares.table.expiresAt" />
                    </Text>
                  </Box>
                </Group>

                {/* Right: Actions */}
                <Group spacing={6}>
                  <Link href={`/share/${share.id}/edit`}>
                    <ActionIcon color="orange" variant="light" size={25}>
                      <TbEdit />
                    </ActionIcon>
                  </Link>
                  <ActionIcon
                    color="blue"
                    variant="light"
                    size={25}
                    onClick={() => {
                      showShareInformationsModal(
                        modals,
                        share,
                        parseInt(config.get("share.maxSize")),
                      );
                    }}
                  >
                    <TbInfoCircle />
                  </ActionIcon>
                  <ActionIcon
                    color="printstream"
                    variant="light"
                    size={25}
                    onClick={() => {
                      if (window.isSecureContext) {
                        clipboard.copy(
                          `${window.location.origin}/s/${share.id}`,
                        );
                        toast.success(t("common.notify.copied-link"));
                      } else {
                        showShareLinkModal(modals, share.id);
                      }
                    }}
                  >
                    <TbLink />
                  </ActionIcon>
                  <ActionIcon
                    color="red"
                    variant="light"
                    size={25}
                    onClick={() => handleDelete(share)}
                  >
                    <TbTrash />
                  </ActionIcon>
                </Group>
              </Box>
            ))}
          </Stack>
        )}
      </AccountLayout>
    </>
  );
};

export default MyShares;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/account/shares.tsx
git commit -m "feat(shares): redesign My Shares as animated stacked row list"
```

---

### Task 6: Redesign Reverse Shares page — row list with animations

**Files:**
- Modify: `frontend/src/pages/account/reverseShares.tsx`

- [ ] **Step 1: Rewrite reverseShares.tsx with row list and animations**

Replace the entire content of `frontend/src/pages/account/reverseShares.tsx`:

```tsx
import {
  Accordion,
  ActionIcon,
  Anchor,
  Box,
  Button,
  Center,
  createStyles,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { useModals } from "@mantine/modals";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  TbInfoCircle,
  TbLink,
  TbPlus,
  TbTrash,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import Meta from "../../components/Meta";
import AccountLayout from "../../components/account/AccountLayout";
import showReverseShareLinkModal from "../../components/account/showReverseShareLinkModal";
import showShareLinkModal from "../../components/account/showShareLinkModal";
import CenterLoader from "../../components/core/CenterLoader";
import showCreateReverseShareModal from "../../components/share/modals/showCreateReverseShareModal";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { MyReverseShare } from "../../types/share.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";

const useStyles = createStyles((theme) => ({
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
    from: { opacity: 1, transform: "translateY(0)" },
    to: { opacity: 0, transform: "translateY(-5px)" },
  },

  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    border: `1px solid ${
      theme.colorScheme === "dark"
        ? theme.colors.dark[4]
        : theme.colors.gray[3]
    }`,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
    marginBottom: 8,
    borderLeft: "2px solid transparent",
    transition: "all 150ms ease",
    opacity: 0,
    animation: "$fadeSlideUp 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards",

    "&:hover": {
      borderLeftColor:
        theme.colorScheme === "dark"
          ? theme.colors.printstream[4]
          : theme.colors.printstream[6],
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[0],
    },
  },

  rowDeleting: {
    animation: "$fadeOut 200ms ease forwards",
  },

  stat: {
    textAlign: "center" as const,
    minWidth: 60,
  },

  statLabel: {
    fontSize: 9,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[2]
        : theme.colors.gray[5],
  },
}));

const MyReverseShares = () => {
  const modals = useModals();
  const clipboard = useClipboard();
  const t = useTranslate();
  const config = useConfig();
  const { classes, cx } = useStyles();

  const [reverseShares, setReverseShares] = useState<MyReverseShare[]>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getReverseShares = () => {
    shareService
      .getMyReverseShares()
      .then((shares) => setReverseShares(shares));
  };

  useEffect(() => {
    getReverseShares();
  }, []);

  const handleDelete = (reverseShare: MyReverseShare) => {
    modals.openConfirmModal({
      title: t("account.reverseShares.modal.delete.title"),
      children: (
        <Text size="sm">
          <FormattedMessage id="account.reverseShares.modal.delete.description" />
        </Text>
      ),
      confirmProps: {
        color: "red",
      },
      labels: {
        confirm: t("common.button.delete"),
        cancel: t("common.button.cancel"),
      },
      onConfirm: () => {
        setDeletingId(reverseShare.id);
        shareService.removeReverseShare(reverseShare.id);
        setTimeout(() => {
          setReverseShares((prev) =>
            prev?.filter((item) => item.id !== reverseShare.id),
          );
          setDeletingId(null);
        }, 250);
      },
    });
  };

  if (!reverseShares) return <CenterLoader />;

  return (
    <>
      <Meta title={t("account.reverseShares.title")} />
      <AccountLayout>
        <Group position="apart" align="baseline" mb={20}>
          <Group align="center" spacing={3} mb={30}>
            <Title order={3}>
              <FormattedMessage id="account.reverseShares.title" />
            </Title>
            <Tooltip
              position="bottom"
              multiline
              width={220}
              label={t("account.reverseShares.description")}
              events={{ hover: true, focus: false, touch: true }}
            >
              <ActionIcon>
                <TbInfoCircle />
              </ActionIcon>
            </Tooltip>
          </Group>
          <Button
            onClick={() =>
              showCreateReverseShareModal(
                modals,
                config.get("smtp.enabled"),
                config.get("share.maxExpiration"),
                getReverseShares,
              )
            }
            leftIcon={<TbPlus size={20} />}
          >
            <FormattedMessage id="common.button.create" />
          </Button>
        </Group>
        {reverseShares.length == 0 ? (
          <Center style={{ height: "70vh" }}>
            <Stack align="center" spacing={10}>
              <Title order={3}>
                <FormattedMessage id="account.reverseShares.title.empty" />
              </Title>
              <Text>
                <FormattedMessage id="account.reverseShares.description.empty" />
              </Text>
            </Stack>
          </Center>
        ) : (
          <Stack spacing={0}>
            {reverseShares.map((reverseShare, index) => (
              <Box
                key={reverseShare.id}
                className={cx(classes.row, {
                  [classes.rowDeleting]: deletingId === reverseShare.id,
                })}
                sx={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Left: Share count with accordion */}
                <Box sx={{ width: 180 }}>
                  {reverseShare.shares.length == 0 ? (
                    <Text color="dimmed" size="sm">
                      <FormattedMessage id="account.reverseShares.table.no-shares" />
                    </Text>
                  ) : (
                    <Accordion>
                      <Accordion.Item
                        value="shares"
                        sx={{ borderBottom: "none" }}
                      >
                        <Accordion.Control p={0}>
                          <Text size="sm">
                            {reverseShare.shares.length == 1
                              ? `1 ${t(
                                  "account.reverseShares.table.count.singular",
                                )}`
                              : `${reverseShare.shares.length} ${t(
                                  "account.reverseShares.table.count.plural",
                                )}`}
                          </Text>
                        </Accordion.Control>
                        <Accordion.Panel>
                          {reverseShare.shares.map((share) => (
                            <Group key={share.id} mb={4}>
                              <Anchor
                                href={`${window.location.origin}/share/${share.id}`}
                                target="_blank"
                              >
                                <Text maw={120} truncate>
                                  {share.id}
                                </Text>
                              </Anchor>
                              <ActionIcon
                                color="printstream"
                                variant="light"
                                size={25}
                                onClick={() => {
                                  if (window.isSecureContext) {
                                    clipboard.copy(
                                      `${window.location.origin}/s/${share.id}`,
                                    );
                                    toast.success(
                                      t("common.notify.copied-link"),
                                    );
                                  } else {
                                    showShareLinkModal(modals, share.id);
                                  }
                                }}
                              >
                                <TbLink />
                              </ActionIcon>
                            </Group>
                          ))}
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>
                  )}
                </Box>

                {/* Center: Stats */}
                <Group spacing="xl">
                  <Box className={classes.stat}>
                    <Text weight={500} size="sm">
                      {reverseShare.remainingUses}
                    </Text>
                    <Text className={classes.statLabel}>
                      <FormattedMessage id="account.reverseShares.table.remaining" />
                    </Text>
                  </Box>
                  <Box className={classes.stat}>
                    <Text weight={500} size="sm">
                      {byteToHumanSizeString(
                        parseInt(reverseShare.maxShareSize),
                      )}
                    </Text>
                    <Text className={classes.statLabel}>
                      <FormattedMessage id="account.reverseShares.table.max-size" />
                    </Text>
                  </Box>
                  <Box className={classes.stat}>
                    <Text weight={500} size="sm">
                      {moment(reverseShare.shareExpiration).unix() === 0
                        ? "Never"
                        : moment(reverseShare.shareExpiration).format("ll")}
                    </Text>
                    <Text className={classes.statLabel}>
                      <FormattedMessage id="account.reverseShares.table.expires" />
                    </Text>
                  </Box>
                </Group>

                {/* Right: Actions */}
                <Group spacing={6}>
                  <ActionIcon
                    color="printstream"
                    variant="light"
                    size={25}
                    onClick={() => {
                      if (window.isSecureContext) {
                        clipboard.copy(
                          `${window.location.origin}/upload/${reverseShare.token}`,
                        );
                        toast.success(t("common.notify.copied-link"));
                      } else {
                        showReverseShareLinkModal(
                          modals,
                          reverseShare.token,
                        );
                      }
                    }}
                  >
                    <TbLink />
                  </ActionIcon>
                  <ActionIcon
                    color="red"
                    variant="light"
                    size={25}
                    onClick={() => handleDelete(reverseShare)}
                  >
                    <TbTrash />
                  </ActionIcon>
                </Group>
              </Box>
            ))}
          </Stack>
        )}
      </AccountLayout>
    </>
  );
};

export default MyReverseShares;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/account/reverseShares.tsx
git commit -m "feat(shares): redesign Reverse Shares as animated stacked row list"
```

---

### Task 7: Visual verification and cleanup

- [ ] **Step 1: Run the dev server and verify**

```bash
cd frontend && npm run dev
```

Manually check:
1. Header shows: Logo | Upload button | Theme toggle | Language badge (EN) | Avatar
2. Click avatar → dropdown has: My Shares, Reverse Shares, divider, Account, Admin (if admin), divider, Sign Out
3. Click language badge → menu with all languages, selecting one reloads
4. Navigate to /account → sidebar on left with Account (active), My Shares, Reverse Shares
5. Navigate to /account/shares → sidebar highlights My Shares, content fades in
6. Share rows stagger-animate in from below
7. Hover a row → left border accent + background shift
8. Delete a share → row fades out then disappears
9. Navigate to /account/reverseShares → same layout, row cards, animations
10. Resize to mobile → sidebar becomes horizontal tabs above content
11. Mobile → burger menu works, all items accessible

- [ ] **Step 2: Fix any TypeScript/lint issues**

```bash
cd frontend && npx tsc --noEmit
```

Fix any reported errors.

- [ ] **Step 3: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address lint and type issues from nav/account redesign"
```
