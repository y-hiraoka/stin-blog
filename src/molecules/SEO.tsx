import Head from "next/head";
import { config } from "../config";

type Props = {
  title: string;
  description?: string;
};

export const SEO: React.VFC<Props> = ({ title, description }) => {
  const siteTitle = config.siteTitle;

  return (
    <Head>
      <title>{`${title} | ${siteTitle}`}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:site_name" content={siteTitle} />
      <meta property="twitter:card" content="summary" />
      <meta property="twitter:creator" content={config.social.twitter} />
      <meta property="twitter:title" content={title} />
      {description && <meta property="twitter:description" content={description} />}
    </Head>
  );
};
