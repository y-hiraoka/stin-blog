import { Date } from "./Date";
import { ClockIcon } from "./ClockIcon";
import styles from "./DatetimeWithIcon.module.css";

type Props = { dateString: string };

export const DatetimeWithIcon: React.VFC<Props> = props => {
  return (
    <div className={styles.root}>
      <ClockIcon className={styles.icon} />
      <Date dateString={props.dateString} className={styles.datetime} />
    </div>
  );
};
