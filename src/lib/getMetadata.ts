import { Metadata } from "next";
import { config } from "../config";

type BaseProps = {
  pagePath: string;
  title?: string;
  description?: string;
  noindex?: boolean;
};

type ForWebsiteProps = {
  type: "website";
  publishedTime?: undefined;
  modifiedTime?: undefined;
  tags?: undefined;
};

type ForArticleProps = {
  type: "article";
  publishedTime: string;
  modifiedTime: string | undefined;
  tags: string[];
};

export function getMetadata(
  props: BaseProps & (ForWebsiteProps | ForArticleProps),
): Metadata {
  const commonOpenGraph: Metadata["openGraph"] = {
    url: config.siteUrl + props.pagePath,
    title: props.title,
    description: props.description,
    siteName: config.siteTitle,
    images: {
      url:
        props.type === "article"
          ? config.siteUrl +
            `/api/og-image?title=${encodeURIComponent(props.title ?? "")}`
          : config.siteUrl + "/images/ogimage.png",
      width: 1200,
      height: 630,
    },
  };
  const openGraph: Metadata["openGraph"] =
    props.type === "article"
      ? {
          type: "article",
          authors: [`https://twitter.com/${config.social.twitter}`],
          publishedTime: props.publishedTime,
          modifiedTime: props.modifiedTime,
          tags: props.tags,
          ...commonOpenGraph,
        }
      : {
          type: "website",
          ...commonOpenGraph,
        };

  return {
    title: props.title ? `${props.title} | ${config.siteTitle}` : config.siteTitle,
    robots: props.noindex ? "noindex" : undefined,
    description: props.description,
    twitter: {
      card: "summary_large_image",
      creator: `@${config.social.twitter}`,
    },
    openGraph: openGraph,
  };
}
