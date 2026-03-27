import {
  Anchor,
  Button,
  Container,
  createStyles,
  Group,
  Loader,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TbInfoCircle } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import useConfig from "../../hooks/config.hook";
import useUser from "../../hooks/user.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import authService from "../../services/auth.service";
import { getOAuthIcon, getOAuthUrl } from "../../utils/oauth.util";
import { safeRedirectPath } from "../../utils/router.util";
import toast from "../../utils/toast.util";

const useStyles = createStyles((theme) => ({
  wrapper: {
    animation: "staggerFadeIn 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
  },

  title: {
    fontFamily: "'Chakra Petch', sans-serif",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },

  card: {
    border: `1px solid ${
      theme.colorScheme === "dark" ? "#2a2a2a" : theme.colors.gray[3]
    }`,
    backgroundColor:
      theme.colorScheme === "dark" ? "#111111" : theme.white,
    transition: "border-color 400ms ease",

    "&:hover": {
      borderColor:
        theme.colorScheme === "dark"
          ? "rgba(139, 92, 246, 0.2)"
          : theme.colors.gray[4],
    },
  },

  signInWith: {
    fontFamily: "'Fira Code', monospace",
    fontSize: "0.8rem",
    fontWeight: 500,
    "&:before": {
      content: "''",
      flex: 1,
      display: "block",
    },
    "&:after": {
      content: "''",
      flex: 1,
      display: "block",
    },
  },

  or: {
    fontFamily: "'Fira Code', monospace",
    fontSize: "0.8rem",
    "&:before": {
      content: "''",
      flex: 1,
      display: "block",
      borderTopWidth: 1,
      borderTopStyle: "solid",
      borderColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[4],
    },
    "&:after": {
      content: "''",
      flex: 1,
      display: "block",
      borderTopWidth: 1,
      borderTopStyle: "solid",
      borderColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[4],
    },
  },

  oauthButton: {
    border: `1px solid ${
      theme.colorScheme === "dark" ? "#2a2a2a" : theme.colors.gray[3]
    }`,
    backgroundColor: "transparent",
    transition: "all 200ms ease",

    "&:hover": {
      borderColor: theme.colorScheme === "dark" ? "#8b5cf6" : theme.colors.gray[5],
      backgroundColor:
        theme.colorScheme === "dark"
          ? "rgba(139, 92, 246, 0.05)"
          : theme.colors.gray[0],
    },
  },
}));

const SignInForm = ({ redirectPath }: { redirectPath: string }) => {
  const config = useConfig();
  const router = useRouter();
  const t = useTranslate();
  const { refreshUser } = useUser();
  const { classes } = useStyles();

  const [oauthProviders, setOauthProviders] = useState<string[] | null>(null);
  const [isRedirectingToOauthProvider, setIsRedirectingToOauthProvider] =
    useState(false);

  const validationSchema = yup.object().shape({
    emailOrUsername: yup.string().required(t("common.error.field-required")),
    password: yup.string().required(t("common.error.field-required")),
  });

  const form = useForm({
    initialValues: {
      emailOrUsername: "",
      password: "",
    },
    validate: yupResolver(validationSchema),
  });

  const signIn = async (email: string, password: string) => {
    await authService
      .signIn(email.trim(), password.trim())
      .then(async (response) => {
        if (response.data["loginToken"]) {
          // Prompt the user to enter their totp code
          showNotification({
            icon: <TbInfoCircle />,
            color: "blue",
            radius: "md",
            title: t("signIn.notify.totp-required.title"),
            message: t("signIn.notify.totp-required.description"),
          });
          router.push(
            `/auth/totp/${
              response.data["loginToken"]
            }?redirect=${encodeURIComponent(redirectPath)}`,
          );
        } else {
          await refreshUser();
          router.replace(safeRedirectPath(redirectPath));
        }
      })
      .catch(toast.axiosError);
  };

  useEffect(() => {
    authService
      .getAvailableOAuth()
      .then((providers) => {
        setOauthProviders(providers.data);
        if (
          providers.data.length === 1 &&
          config.get("oauth.disablePassword")
        ) {
          setIsRedirectingToOauthProvider(true);
          router.push(getOAuthUrl(window.location.origin, providers.data[0]));
        }
      })
      .catch(toast.axiosError);
  }, []);

  if (!oauthProviders) return null;

  if (isRedirectingToOauthProvider)
    return (
      <Group align="center" position="center">
        <Loader size="sm" />
        <Text align="center">
          <FormattedMessage id="common.text.redirecting" />
        </Text>
      </Group>
    );

  return (
    <Container size={420} my={40} className={classes.wrapper}>
      <Title order={2} align="center" weight={900} className={classes.title}>
        <FormattedMessage id="signin.title" />
      </Title>
      {config.get("share.allowRegistration") && (
        <Text
          color="dimmed"
          size="sm"
          align="center"
          mt={5}
          sx={{ fontFamily: "'Fira Code', monospace", fontSize: "0.8rem" }}
        >
          <FormattedMessage id="signin.description" />{" "}
          <Anchor component={Link} href={"signUp"} size="sm">
            <FormattedMessage id="signin.button.signup" />
          </Anchor>
        </Text>
      )}
      <Paper withBorder shadow="md" p={30} mt={30} className={classes.card}>
        {config.get("oauth.disablePassword") || (
          <form
            onSubmit={form.onSubmit((values) => {
              signIn(values.emailOrUsername, values.password);
            })}
          >
            <TextInput
              label={t("signin.input.email-or-username")}
              placeholder={t("signin.input.email-or-username.placeholder")}
              {...form.getInputProps("emailOrUsername")}
            />
            <PasswordInput
              label={t("signin.input.password")}
              placeholder={t("signin.input.password.placeholder")}
              mt="md"
              {...form.getInputProps("password")}
            />
            {config.get("smtp.enabled") && (
              <Group position="right" mt="xs">
                <Anchor component={Link} href="/auth/resetPassword" size="xs">
                  <FormattedMessage id="resetPassword.title" />
                </Anchor>
              </Group>
            )}
            <Button
              fullWidth
              mt="xl"
              type="submit"
              sx={(theme) => ({
                backgroundColor:
                  theme.colorScheme === "dark" ? "#8b5cf6" : theme.black,
                color:
                  theme.colorScheme === "dark" ? "#0a0a0a" : theme.white,
                "&:hover": {
                  backgroundColor:
                    theme.colorScheme === "dark" ? "#a78bfa" : theme.colors.gray[8],
                },
              })}
            >
              <FormattedMessage id="signin.button.submit" />
            </Button>
          </form>
        )}
        {oauthProviders.length > 0 && (
          <Stack mt={config.get("oauth.disablePassword") ? undefined : "xl"}>
            {config.get("oauth.disablePassword") ? (
              <Group align="center" className={classes.signInWith}>
                <Text>{t("signIn.oauth.signInWith")}</Text>
              </Group>
            ) : (
              <Group align="center" className={classes.or}>
                <Text>{t("signIn.oauth.or")}</Text>
              </Group>
            )}
            <Group position="center">
              {oauthProviders.map((provider) => (
                <Button
                  key={provider}
                  component="a"
                  title={t(`signIn.oauth.${provider}`)}
                  href={getOAuthUrl(window.location.origin, provider)}
                  variant="light"
                  fullWidth
                  className={classes.oauthButton}
                >
                  {getOAuthIcon(provider)}
                  {"\u2002" + t(`signIn.oauth.${provider}`)}
                </Button>
              ))}
            </Group>
          </Stack>
        )}
      </Paper>
    </Container>
  );
};

export default SignInForm;
