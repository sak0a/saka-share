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
import { TbInfoCircle, TbLink, TbPlus, TbTrash } from "react-icons/tb";
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

  if (!reverseShares) return <CenterLoader />;

  return (
    <AccountLayout>
      <Meta title={t("account.reverseShares.title")} />
      <Group position="apart" align="baseline" mb={30}>
        <Group align="center" spacing={3}>
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
      {reverseShares.length === 0 ? (
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
        <Box>
          {reverseShares.map((reverseShare, index) => (
            <Box
              key={reverseShare.id}
              className={cx(classes.row, {
                [classes.rowDeleting]: deletingId === reverseShare.id,
              })}
              sx={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Left: share count / accordion */}
              <Box style={{ width: 180, minWidth: 180 }}>
                {reverseShare.shares.length === 0 ? (
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
                          {reverseShare.shares.length === 1
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
                                  toast.success(t("common.notify.copied-link"));
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

              {/* Center: stats */}
              <Group spacing="xl" mx="xl">
                <Box className={classes.stat}>
                  <Text size="sm" weight={600}>
                    {reverseShare.remainingUses}
                  </Text>
                  <Text className={classes.statLabel}>
                    <FormattedMessage id="account.reverseShares.table.remaining" />
                  </Text>
                </Box>
                <Box className={classes.stat}>
                  <Text size="sm" weight={600}>
                    {byteToHumanSizeString(parseInt(reverseShare.maxShareSize))}
                  </Text>
                  <Text className={classes.statLabel}>
                    <FormattedMessage id="account.reverseShares.table.max-size" />
                  </Text>
                </Box>
                <Box className={classes.stat}>
                  <Text size="sm" weight={600}>
                    {moment(reverseShare.shareExpiration).unix() === 0
                      ? "Never"
                      : moment(reverseShare.shareExpiration).format("ll")}
                  </Text>
                  <Text className={classes.statLabel}>
                    <FormattedMessage id="account.reverseShares.table.expires" />
                  </Text>
                </Box>
              </Group>

              {/* Right: actions */}
              <Group spacing={4} noWrap>
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
                      showReverseShareLinkModal(modals, reverseShare.token);
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

export default MyReverseShares;
