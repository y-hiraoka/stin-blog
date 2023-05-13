import Image from "next/image";
import { useEffect, useState, FC } from "react";
import { getFaviconUrl } from "../../lib/getFaviconUrl";
import { SiteMetadata } from "../../pages/api/site-metadata";
import classes from "./RichLinkCard.module.scss";

type MetadataState =
  | {
      metadata?: undefined;
      isLoading: true;
    }
  | {
      metadata: SiteMetadata;
      isLoading: false;
      isError: false;
    }
  | {
      isLoading: false;
      isError: true;
    };
const useMetadataState = (href: string) => {
  const [state, setState] = useState<MetadataState>({
    metadata: undefined,
    isLoading: true,
  });

  useEffect(() => {
    // 相対パスの場合はURLに変換する
    const url = /https?/.test(href) ? href : new URL(href, window.location.href).href;

    fetch(`/api/site-metadata?url=${encodeURIComponent(url)}`)
      .then(r => {
        if (r.ok) return r.json();
        else throw new Error("error");
      })
      .then(data => {
        setState({
          metadata: data,
          isLoading: false,
          isError: false,
        });
      })
      .catch(error => {
        setState({
          isLoading: false,
          isError: true,
        });
      });
  }, [href]);

  return state;
};

type Props = {
  href: string;
  isExternal: boolean;
};

export const RichLinkCard: FC<Props> = ({ href, isExternal }) => {
  const metadataState = useMetadataState(href);

  return metadataState.isLoading ? (
    <RichLinkCardSkeleton />
  ) : metadataState.isError ? (
    <RichLinkCardError href={href} />
  ) : (
    <RichLinkCardLoaded metadata={metadataState.metadata} />
  );
};

const RichLinkCardLoaded: FC<{ metadata: SiteMetadata }> = ({ metadata }) => {
  const hostname = new URL(metadata.url).hostname;

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
          <Image src={getFaviconUrl(hostname)} alt="" width={16} height={16} />
          <span className={classes.loadedMetadataSiteName}>{hostname}</span>
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

const RichLinkCardError: FC<{ href: string }> = ({ href }) => {
  return (
    <a className={classes.error} href={href} target="_blank" rel="noreferrer">
      <p className={classes.errorTitle}>ページを読み込めませんでした</p>
      <div className={classes.errorDescription}>{href}</div>
    </a>
  );
};

const RichLinkCardSkeleton: FC = () => {
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
