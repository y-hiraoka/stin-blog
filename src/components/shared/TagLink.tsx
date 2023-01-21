import NextLink from "next/link";
import { FC } from "react";
import { pagesPath } from "../../lib/$path";
import { tagLinkstyle } from "./TagLink.css";

export const TagLink: FC<{ tag: string }> = ({ tag }) => {
  return (
    <NextLink key={tag} href={pagesPath.tags._tagName(tag).$url()}>
      <span className={tagLinkstyle}>{tag}</span>
    </NextLink>
  );
};
