import Link from "next/link";
import { AppContainer } from "./AppContainer";
import styles from "./Header.module.css";

export const Header: React.VFC = props => {
  return (
    <header className={styles.header}>
      <AppContainer className={styles.container}>
        <Link href="/">
          <a>
            <img className={styles.logo} src="/images/logo.png" alt="logo" />
          </a>
        </Link>
      </AppContainer>
    </header>
  );
};
