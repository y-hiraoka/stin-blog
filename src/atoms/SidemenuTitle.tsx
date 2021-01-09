import styles from "./SidemenuTitle.module.css";

type Props = {
  icon: React.ReactNode;
};

export const SidemenuTitle: React.FC<Props> = props => {
  return (
    <div className={styles.root}>
      <div className={styles.icon}>{props.icon}</div>
      <div className={styles.children}>{props.children}</div>
    </div>
  );
};
