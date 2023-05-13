import NextLink from "next/link";
import { FC } from "react";
import { pagesPath } from "../../lib/$path";
import classes from "./TagLink.module.scss";

export const TagLink: FC<{ tag: string }> = ({ tag }) => {
  return (
    <NextLink
      className={classes.tagLink}
      key={tag}
      href={pagesPath.tags._tagName(tag).$url()}>
      {tag}
    </NextLink>
  );
};
