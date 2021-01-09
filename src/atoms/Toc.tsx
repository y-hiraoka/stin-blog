import ReactMarkdown from "react-markdown";
import styles from "./Toc.module.css";
import { ListIcon } from "./ListIcon";
import { SidemenuTitle } from "./SidemenuTitle";

type Props = { tocMdText: string };

export const Toc: React.VFC<Props> = props => {
  return (
    <div>
      <div className={styles.title}>
        <SidemenuTitle icon={<ListIcon className={styles.icon} />}>
          Table of Contents
        </SidemenuTitle>
      </div>
      <div className={styles.toc}>
        <ReactMarkdown
          renderers={{
            list: List,
            listItem: ListItem,
            link: Link,
          }}>
          {props.tocMdText}
        </ReactMarkdown>
      </div>
    </div>
  );
};

const Link: React.FC = props => {
  return <a {...props} className={styles.link} />;
};

const List: React.FC = props => {
  return <ul className={styles.list}>{props.children}</ul>;
};

const ListItem: React.FC = props => {
  return <li className={styles.listItem}>{props.children}</li>;
};
