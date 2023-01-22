import NextLink from "next/link";
import { FC } from "react";
import { pagesPath } from "../../lib/$path";
import { tagLinkstyle } from "./TagLink.css";

export const TagLink: FC<{ tag: string }> = ({ tag }) => {
  return (
    <NextLink
      className={tagLinkstyle}
      key={tag}
      href={pagesPath.tags._tagName(tag).$url()}>
      {tag}
    </NextLink>
  );
};
