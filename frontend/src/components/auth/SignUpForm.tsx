import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import useUser from "../../hooks/user.hook";
import authService from "../../services/auth.service";
import toast from "../../utils/toast.util";

const SignUpForm = () => {
  const config = useConfig();
  const router = useRouter();
  const t = useTranslate();
  const { refreshUser } = useUser();

  const validationSchema = yup.object().shape({
    email: yup.string().email(t("common.error.invalid-email")).required(),
    username: yup
      .string()
      .min(3, t("common.error.too-short", { length: 3 }))
      .required(t("common.error.field-required")),
    password: yup
      .string()
      .min(8, t("common.error.too-short", { length: 8 }))
      .required(t("common.error.field-required")),
  });

  const form = useForm({
    initialValues: {
      email: "",
      username: "",
      password: "",
    },
    validate: yupResolver(validationSchema),
  });

  const signUp = async (email: string, username: string, password: string) => {
    await authService
      .signUp(email.trim(), username.trim(), password.trim())
      .then(async () => {
        const user = await refreshUser();
        if (user?.isAdmin) {
          router.replace("/admin/intro");
        } else {
          router.replace("/upload");
        }
      })
      .catch(toast.axiosError);
  };

  return (
    <Container
      size={420}
      my={40}
      sx={{
        animation:
          "staggerFadeIn 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
      }}
    >
      <Title
        order={2}
        align="center"
        weight={900}
        sx={{
          fontFamily: "'Chakra Petch', sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        <FormattedMessage id="signup.title" />
      </Title>
      {config.get("share.allowRegistration") && (
        <Text
          color="dimmed"
          size="sm"
          align="center"
          mt={5}
          sx={{ fontFamily: "'Fira Code', monospace", fontSize: "0.8rem" }}
        >
          <FormattedMessage id="signup.description" />{" "}
          <Anchor component={Link} href={"signIn"} size="sm">
            <FormattedMessage id="signup.button.signin" />
          </Anchor>
        </Text>
      )}
      <Paper
        withBorder
        shadow="md"
        p={30}
        mt={30}
        sx={(theme) => ({
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
        })}
      >
        <form
          onSubmit={form.onSubmit((values) =>
            signUp(values.email, values.username, values.password),
          )}
        >
          <TextInput
            label={t("signup.input.username")}
            placeholder={t("signup.input.username.placeholder")}
            {...form.getInputProps("username")}
          />
          <TextInput
            label={t("signup.input.email")}
            placeholder={t("signup.input.email.placeholder")}
            mt="md"
            {...form.getInputProps("email")}
          />
          <PasswordInput
            label={t("signin.input.password")}
            placeholder={t("signin.input.password.placeholder")}
            mt="md"
            {...form.getInputProps("password")}
          />
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
                  theme.colorScheme === "dark"
                    ? "#a78bfa"
                    : theme.colors.gray[8],
              },
            })}
          >
            <FormattedMessage id="signup.button.submit" />
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default SignUpForm;
