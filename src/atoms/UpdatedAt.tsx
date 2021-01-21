import { Date } from "./Date";
import { HistoryIcon } from "./HistoryIcon";
import styles from "./DatetimeWithIcon.module.css";

type Props = {
  updatedAt: string;
};

export const UpdatedAt: React.VFC<Props> = props => {
  return (
    <div className={styles.root}>
      <HistoryIcon className={styles.icon} />
      <Date dateString={props.updatedAt} className={styles.datetime} />
    </div>
  );
};
