import {
  Box,
  Container,
  createStyles,
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
        theme.colorScheme === "dark" ? "#1a1a1a" : theme.colors.gray[3]
      }`,
    },
  },

  navLink: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.xs,
    padding: "10px 14px",
    fontFamily: "'Fira Code', monospace",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[7],
    fontSize: "0.8rem",
    fontWeight: 500,
    letterSpacing: "0.02em",
    borderLeft: `2px solid transparent`,
    transition: "all 200ms ease",
    textDecoration: "none",

    "&:hover": {
      color:
        theme.colorScheme === "dark" ? "#8b5cf6" : theme.colors.gray[9],
      backgroundColor:
        theme.colorScheme === "dark"
          ? "rgba(139, 92, 246, 0.03)"
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
      theme.colorScheme === "dark" ? "#8b5cf6" : theme.colors.gray[9],
    borderLeftColor:
      theme.colorScheme === "dark" ? "#8b5cf6" : theme.black,
    backgroundColor:
      theme.colorScheme === "dark"
        ? "rgba(139, 92, 246, 0.03)"
        : theme.colors.gray[0],

    [theme.fn.smallerThan("sm")]: {
      borderLeftColor: "transparent",
      borderBottomColor:
        theme.colorScheme === "dark" ? "#8b5cf6" : theme.black,
    },
  },

  content: {
    flex: 1,
    minWidth: 0,
    animation: "accountFadeIn 300ms ease forwards",
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
