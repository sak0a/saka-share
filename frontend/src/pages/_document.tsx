import { createGetInitialProps } from "@mantine/next";
import Document, { Head, Html, Main, NextScript } from "next/document";

const getInitialProps = createGetInitialProps();

export default class _Document extends Document {
  static getInitialProps = getInitialProps;

  render() {
    return (
      <Html>
        <Head>
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" type="image/x-icon" href="/img/favicon.ico" />
          <link rel="apple-touch-icon" href="/img/icons/icon-128x128.png" />

          {/* Brutalist typography: Chakra Petch (display) + Fira Code (mono) */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Fira+Code:wght@300;400;500;600&display=swap"
            rel="stylesheet"
          />

          <meta name="robots" content="noindex" />
          <meta name="theme-color" content="#0a0a0a" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
