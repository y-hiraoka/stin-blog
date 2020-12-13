import classnames from "classnames";
import styles from "./AppContainer.module.css";

export const AppContainer: React.FCX = props => {
  return (
    <div className={classnames(styles.container, props.className)}>{props.children}</div>
  );
};
