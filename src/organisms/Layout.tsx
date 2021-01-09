import { useRouter } from "next/router";
import styles from "./Layout.module.css";
import { Header } from "../atoms/Header";
import { Footer } from "../molecules/Footer";
import { AppContainer } from "../atoms/AppContainer";

export const Layout: React.FC = props => {
  const isHome = useRouter().pathname === "/";

  return (
    <div className={styles.root}>
      {isHome && (
        <>
          <div className={styles.eyeCatchContainer}>
            <img className={styles.eyeCatch} src="/images/main.svg" alt="eye catch" />
          </div>
          <div className={styles.eyeCatchWrapper}>
            <div className={styles.scrollDownContainer}>
              <div className={styles.scrollDown}>Scroll down</div>
            </div>
          </div>
        </>
      )}
      <div className={styles.mainContent}>
        <Header />
        <div className={styles.main}>
          <AppContainer>{props.children}</AppContainer>
        </div>
        <Footer />
      </div>
    </div>
  );
};
