"use client";

import { NextSeo } from "next-seo";
import { config } from "../../config";

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

export const SEO: React.FC<BaseProps & (ForWebsiteProps | ForArticleProps)> = ({
  type,
  pagePath,
  title,
  description,
  noindex,
  publishedTime,
  modifiedTime,
  tags,
}) => {
  const siteTitle = config.siteTitle;

  return (
    <NextSeo
      title={title}
      titleTemplate={`%s | ${siteTitle}`}
      defaultTitle={siteTitle}
      noindex={noindex}
      twitter={{
        cardType: "summary_large_image",
        handle: `@${config.social.twitter}`,
      }}
      openGraph={{
        type: type,
        url: config.siteUrl + pagePath,
        title: title,
        description: description,
        site_name: siteTitle,
        images: [
          {
            url:
              type === "article"
                ? config.siteUrl +
                  `/api/og-image?title=${encodeURIComponent(title ?? "")}`
                : config.siteUrl + "/images/ogimage.png",
            width: 1200,
            height: 630,
          },
        ],
        article:
          type === "article"
            ? {
                authors: [`https://twitter.com/${config.social.twitter}`],
                publishedTime: publishedTime,
                modifiedTime: modifiedTime,
                tags: tags,
              }
            : undefined,
      }}
    />
  );
};
