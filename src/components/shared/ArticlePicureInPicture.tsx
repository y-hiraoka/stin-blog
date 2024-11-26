"use client";

import { useSyncExternalStore } from "react";
import { MdPictureInPictureAlt } from "react-icons/md";
import classes from "./ArticlePicureInPicture.module.scss";

declare global {
  interface DocumentPictureInPictureOptions {
    width?: number;
    height?: number;
    disallowReturnToOpener?: boolean;
    preferInitialWindowPlacement?: boolean;
  }
  interface DocumentPictureInPicture {
    requestWindow: (options?: DocumentPictureInPictureOptions) => Promise<Window>;
  }

  // eslint-disable-next-line no-var
  var documentPictureInPicture: DocumentPictureInPicture;
}

const noop = () => () => {};

export const ArticlePicureInPicture: React.FC = () => {
  const isDocumentPipSupported = useSyncExternalStore(
    noop,
    () => "documentPictureInPicture" in window,
    () => false,
  );

  const openPip = async () => {
    if (!isDocumentPipSupported) return;

    const pipWindow = await documentPictureInPicture.requestWindow({
      width: 320,
      height: 480,
    });

    // stylesheetのコピー
    const styleElements = document.querySelectorAll(`link[rel="stylesheet"], style`);
    const clonedStyleElements = Array.from(styleElements).map((s) => s.cloneNode(true));
    pipWindow.document.head.append(...clonedStyleElements);
    pipWindow.document.documentElement.dataset.colorMode =
      document.documentElement.dataset.colorMode;

    // article elementのコピー
    const articleElement = document.querySelector("#markdown-renderer")?.cloneNode(true);
    if (!articleElement) return;
    pipWindow.document.body.appendChild(articleElement);

    // スタイルの調整
    pipWindow.document.documentElement.style.fontSize = "0.85rem";
    pipWindow.document.documentElement.style.padding = "0.8rem";
  };

  return (
    <button
      suppressHydrationWarning
      hidden={!isDocumentPipSupported}
      onClick={openPip}
      type="button"
      className={classes.pipButton}
      aria-label="Picture in Pictureで記事を表示する"
    >
      <MdPictureInPictureAlt />
    </button>
  );
};
