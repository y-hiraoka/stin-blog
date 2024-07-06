import NextLink from "next/link";
import { FC } from "react";
import classes from "./TagLink.module.scss";

export const TagLink: FC<{ tag: string }> = ({ tag }) => {
  return (
    <NextLink
      prefetch={false}
      className={classes.tagLink}
      key={tag}
      href={`/tags/${tag}`}>
      {tag}
    </NextLink>
  );
};
