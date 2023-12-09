export const SITE_TITLE = "stin's Blog";

export const SITE_DESCRIPTION =
  "すてぃんの個人ブログです。技術的なこと、日常のこと、雑記など色々書きます。";

export const metadataBase = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : process.env.VERCEL_URL
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : new URL(`http://localhost:${process.env.PORT || 3000}`);
