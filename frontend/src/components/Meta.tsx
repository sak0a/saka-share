import Head from "next/head";
import useConfig from "../hooks/config.hook";

const Meta = ({
  title,
  description,
  ogImage,
  ogVideo,
  ogType,
}: {
  title: string;
  description?: string;
  ogImage?: string;
  ogVideo?: string;
  ogType?: string;
}) => {
  const config = useConfig();

  const metaTitle = `${title} - ${config.get("general.appName")}`;

  return (
    <Head>
      <title>{metaTitle}</title>
      <meta property="og:title" content={metaTitle} />
      <meta
        property="og:description"
        content={
          description ?? "An open-source and self-hosted sharing platform."
        }
      />
      {ogType && <meta property="og:type" content={ogType} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogVideo && <meta property="og:video" content={ogVideo} />}
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:card" content="summary_large_image" />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Head>
  );
};

export default Meta;
