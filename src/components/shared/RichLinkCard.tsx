import Image from "next/image";
import { Suspense } from "react";
import { getFaviconUrl } from "../../lib/getFaviconUrl";
import classes from "./RichLinkCard.module.scss";
import { fetchSiteMetadata } from "../../lib/fetchSiteMetadata";
import { config } from "../../config";

type Props = {
  href: string;
  isExternal: boolean;
};

export const RichLinkCard: React.FC<Props> = ({ href, isExternal }) => {
  return (
    <Suspense fallback={<RichLinkCardSkeleton />}>
      <RichLinkCardInner href={href} isExternal={isExternal} />
    </Suspense>
  );
};

const RichLinkCardInner: React.FC<Props> = async ({ href }) => {
  const url = new URL(href, config.siteUrl);
  const metadata = await fetchSiteMetadata(url.href);

  if (!metadata) {
    return <RichLinkCardError href={href} />;
  }

  return (
    <a className={classes.cardRoot} href={metadata.url} target="_blank" rel="noreferrer">
      <div className={classes.loadedMetadata}>
        <div className={classes.loadedMetadataTitle}>
          {metadata.title ? metadata.title : metadata.url}
        </div>
        <div className={classes.loadedMetadataDescriptionContainer}>
          <div className={classes.loadedMetadataDescription}>{metadata.description}</div>
        </div>
        <div className={classes.loadedMetadataSite}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getFaviconUrl(url.hostname)} alt="" width={16} height={16} />
          <span className={classes.loadedMetadataSiteName}>{url.hostname}</span>
        </div>
      </div>
      {metadata.image && (
        <div className={classes.loadedMetadataImageContainer}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={classes.loadedMetadataImage} src={metadata.image} alt="" />
        </div>
      )}
    </a>
  );
};

const RichLinkCardError: React.FC<{ href: string }> = ({ href }) => {
  return (
    <a className={classes.error} href={href} target="_blank" rel="noreferrer">
      <p className={classes.errorTitle}>ページを読み込めませんでした</p>
      <div className={classes.errorDescription}>{href}</div>
    </a>
  );
};

const RichLinkCardSkeleton: React.FC = () => {
  return (
    <div className={classes.cardRoot}>
      <div className={classes.skeletonMetadata}>
        <div className={classes.skeletonTextContainer}>
          <div className={classes.skeletonText} />
          <div className={classes.skeletonTextShorter} />
        </div>
        <div className={classes.skeletonTextContainer}>
          <div className={classes.skeletonText} />
          <div className={classes.skeletonTextShorter} />
        </div>
        <div className={classes.skeletonSiteIcon} />
      </div>
      <div className={classes.skeletonImage} />
    </div>
  );
};
