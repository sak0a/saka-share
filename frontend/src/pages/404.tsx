import { Button, Container, createStyles, Group, Text, Title } from "@mantine/core";
import Link from "next/link";
import { FormattedMessage } from "react-intl";
import Meta from "../components/Meta";

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: 80,
    paddingBottom: 80,
    animation: "staggerFadeIn 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
  },

  label: {
    textAlign: "center",
    fontFamily: "'Chakra Petch', sans-serif",
    fontWeight: 900,
    fontSize: 200,
    lineHeight: 1,
    marginBottom: 20,
    letterSpacing: "-0.05em",
    color: theme.colorScheme === "dark" ? "#1a1a1a" : theme.colors.gray[2],
    position: "relative",
    userSelect: "none",
    animation: "glitchColor 4s ease-in-out infinite",

    "&::before": {
      content: "'404'",
      position: "absolute",
      left: 2,
      top: 0,
      width: "100%",
      color:
        theme.colorScheme === "dark"
          ? "rgba(139, 92, 246, 0.15)"
          : "rgba(0, 0, 0, 0.05)",
      animation: "glitchShift 3s ease-in-out infinite",
    },

    [theme.fn.smallerThan("sm")]: {
      fontSize: 120,
    },
  },

  description: {
    fontFamily: "'Chakra Petch', sans-serif",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },

  button: {
    fontFamily: "'Chakra Petch', sans-serif",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    border: `1px solid ${
      theme.colorScheme === "dark" ? "#2a2a2a" : theme.colors.gray[3]
    }`,
    transition: "all 200ms ease",
    "&:hover": {
      borderColor: theme.colorScheme === "dark" ? "#8b5cf6" : theme.colors.gray[5],
      transform: "translateY(-2px)",
    },
  },
}));

const ErrorNotFound = () => {
  const { classes } = useStyles();

  return (
    <>
      <Meta title="Not found" />
      <Container className={classes.root}>
        <div className={classes.label}>404</div>
        <Title align="center" order={3} className={classes.description}>
          <FormattedMessage id="404.description" />
        </Title>
        <Group position="center" mt={50}>
          <Button
            component={Link}
            href="/"
            variant="default"
            className={classes.button}
          >
            <FormattedMessage id="404.button.home" />
          </Button>
        </Group>
      </Container>
    </>
  );
};
export default ErrorNotFound;
