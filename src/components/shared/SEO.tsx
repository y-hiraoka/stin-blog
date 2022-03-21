import Head from "next/head";
import { config } from "../../config";
import { staticPath } from "../../lib/$path";

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
      <meta property="og:image" content={staticPath.images.ogimage_png} />
    </Head>
  );
};
