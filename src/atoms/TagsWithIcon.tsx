import React from "react";
import Link from "next/link";
import { TagsIcon } from "./TagsIcon";
import styles from "./TagsWithIcon.module.css";

type Props = { tags: string[] };

export const TagsWithIcon: React.VFC<Props> = ({ tags }) => {
  return (
    <div className={styles.root}>
      <TagsIcon className={styles.icon} />
      <p className={styles.tags}>
        {tags.map((tag, index) => (
          <React.Fragment key={index}>
            <Link href={`/tags/${tag}`}>
              <a className={styles.tag}>{tag}</a>
            </Link>
            {index !== tags.length - 1 && <span>, </span>}
          </React.Fragment>
        ))}
      </p>
    </div>
  );
};
