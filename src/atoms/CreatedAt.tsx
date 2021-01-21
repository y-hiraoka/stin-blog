import { Date } from "./Date";
import { ClockIcon } from "./ClockIcon";
import styles from "./DatetimeWithIcon.module.css";

type Props = {
  createdAt: string;
};

export const CreatedAt: React.VFC<Props> = props => {
  return (
    <div className={styles.root}>
      <ClockIcon className={styles.icon} />
      <Date dateString={props.createdAt} className={styles.datetime} />
    </div>
  );
};
