import { ReactNode } from "react";
import { ArticlesNavigation } from "../../../components/shared/ArticlesNavigation";
import styles from "./layout.module.scss";

const ArticlesLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className={styles.container}>
      <ArticlesNavigation />
      <div>{children}</div>
    </div>
  );
};

export default ArticlesLayout;
