import { Tag } from "../models";
import { SidemenuTitle } from "./SidemenuTitle";
import { TagsIcon } from "./TagsIcon";
import { ChevronRight } from "./ChevronRightIcon";
import styles from "./TagLinks.module.css";
import Link from "next/link";

type Props = {
  tags: Tag[];
};

export const TagLinks: React.VFC<Props> = props => {
  return (
    <div>
      <div className={styles.title}>
        <SidemenuTitle icon={<TagsIcon className={styles.tagsIcon} />}>
          Tags
        </SidemenuTitle>
      </div>
      <div className={styles.links}>
        {props.tags.map((tag, index) => (
          <Link key={index} href={`/tags/${tag.name}`}>
            <a className={styles.tagLink}>
              <p>
                <span className={styles.tagName}>{encodeURI(tag.name)}</span>
                <span className={styles.count}>{`(${tag.itemCount})`}</span>
              </p>
              <span>
                <ChevronRight className={styles.chevronIcon} />
              </span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};
