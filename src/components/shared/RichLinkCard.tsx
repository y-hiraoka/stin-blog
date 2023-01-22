import Image from "next/image";
import { useEffect, useState, FC } from "react";
import { getFaviconUrl } from "../../lib/getFaviconUrl";
import { SiteMetadata } from "../../pages/api/site-metadata";
import { richLinkCardStyles } from "./RichLinkCard.css";

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
    <a
      className={richLinkCardStyles.cardRoot}
      href={metadata.url}
      target="_blank"
      rel="noreferrer">
      <div className={richLinkCardStyles.loadedMetadata}>
        <div className={richLinkCardStyles.loadedMetadataTitle}>
          {metadata.title ? metadata.title : metadata.url}
        </div>
        <div className={richLinkCardStyles.loadedMetadataDescriptionContainer}>
          <div className={richLinkCardStyles.loadedMetadataDescription}>
            {metadata.description}
          </div>
        </div>
        <div className={richLinkCardStyles.loadedMetadataSite}>
          <Image src={getFaviconUrl(hostname)} alt="" width={16} height={16} />
          <span className={richLinkCardStyles.loadedMetadataSiteName}>{hostname}</span>
        </div>
      </div>
      {metadata.image && (
        <div className={richLinkCardStyles.loadedMetadataImageContainer}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={richLinkCardStyles.loadedMetadataImage}
            src={metadata.image}
            alt=""
          />
        </div>
      )}
    </a>
  );
};

const RichLinkCardError: FC<{ href: string }> = ({ href }) => {
  return (
    <a className={richLinkCardStyles.error} href={href} target="_blank" rel="noreferrer">
      <p className={richLinkCardStyles.errorTitle}>ページを読み込めませんでした</p>
      <div className={richLinkCardStyles.errorDescription}>{href}</div>
    </a>
  );
};

const RichLinkCardSkeleton: FC = () => {
  return (
    <div className={richLinkCardStyles.cardRoot}>
      <div className={richLinkCardStyles.skeletonMetadata}>
        <div className={richLinkCardStyles.skeletonTextContainer}>
          <div className={richLinkCardStyles.skeletonText} />
          <div className={richLinkCardStyles.skeletonTextShorter} />
        </div>
        <div className={richLinkCardStyles.skeletonTextContainer}>
          <div className={richLinkCardStyles.skeletonText} />
          <div className={richLinkCardStyles.skeletonTextShorter} />
        </div>
        <div className={richLinkCardStyles.skeletonSiteIcon} />
      </div>
      <div className={richLinkCardStyles.skeletonImage} />
    </div>
  );
};
