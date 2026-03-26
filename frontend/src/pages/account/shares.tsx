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
    animation: "fadeSlideUp 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards",

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
    animation: "fadeOut 200ms ease forwards",
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

  if (!shares) return <CenterLoader />;

  return (
    <AccountLayout>
      <Meta title={t("account.shares.title")} />
      <Title mb={30} order={3}>
        <FormattedMessage id="account.shares.title" />
      </Title>
      {shares.length === 0 ? (
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
        <Box>
          {shares.map((share, index) => (
            <Box
              key={share.id}
              className={cx(classes.row, {
                [classes.rowDeleting]: deletingId === share.id,
              })}
              sx={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Left: name + id */}
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text weight={600} size="sm" lineClamp={1}>
                  {share.name || share.id}
                </Text>
                <Group spacing={4} mt={2}>
                  {share.security.passwordProtected && (
                    <TbLock
                      size={11}
                      color="orange"
                      title={t("account.shares.table.password-protected")}
                    />
                  )}
                  <Text color="dimmed" size="xs" lineClamp={1}>
                    {share.id}
                  </Text>
                </Group>
              </Box>

              {/* Center: stats */}
              <Group spacing="xl" mx="xl">
                <Box className={classes.stat}>
                  <Text size="sm" weight={600}>
                    {share.security.maxViews ? (
                      <FormattedMessage
                        id="account.shares.table.visitor-count"
                        values={{
                          count: share.views,
                          max: share.security.maxViews,
                        }}
                      />
                    ) : (
                      share.views
                    )}
                  </Text>
                  <Text className={classes.statLabel}>
                    <FormattedMessage id="account.shares.table.visitors" />
                  </Text>
                </Box>
                <Box className={classes.stat}>
                  <Text size="sm" weight={600}>
                    {moment(share.expiration).unix() === 0 ? (
                      <FormattedMessage id="account.shares.table.expiry-never" />
                    ) : (
                      moment(share.expiration).format("ll")
                    )}
                  </Text>
                  <Text className={classes.statLabel}>
                    <FormattedMessage id="account.shares.table.expiresAt" />
                  </Text>
                </Box>
              </Group>

              {/* Right: actions */}
              <Group spacing={4} noWrap>
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
                  onClick={() => {
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
                          setShares((prev) =>
                            prev?.filter((item) => item.id !== share.id),
                          );
                          setDeletingId(null);
                        }, 250);
                      },
                    });
                  }}
                >
                  <TbTrash />
                </ActionIcon>
              </Group>
            </Box>
          ))}
        </Box>
      )}
    </AccountLayout>
  );
};

export default MyShares;
