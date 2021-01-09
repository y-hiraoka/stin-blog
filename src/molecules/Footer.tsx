import React from "react";
import { AppContainer } from "../atoms/AppContainer";
import { ExternalLink } from "../atoms/ExternalLink";
import { ExternalLinkIcon } from "../atoms/ExternalLinkIcon";
import styles from "./Footer.module.css";

export const Footer: React.VFC = () => {
  const [copyrightPeriod, setCopyrightPeriod] = React.useState("");

  React.useEffect(() => {
    const currentYear = new Date().getFullYear();
    setCopyrightPeriod(currentYear === 2020 ? "2020" : `2020 - ${currentYear}`);
  }, []);

  return (
    <footer className={styles.footer}>
      <AppContainer>
        <p className={styles.text}>
          This site uses{" "}
          <ExternalLink href="https://policies.google.com/technologies/partner-sites?hl=ja">
            Google Analytics <ExternalLinkIcon className={styles.icon} />
          </ExternalLink>
        </p>
        <p className={styles.text}>
          &copy; {copyrightPeriod}{" "}
          <ExternalLink href="https://twitter.com/stin_factory">
            stin_factory <ExternalLinkIcon className={styles.icon} />
          </ExternalLink>
        </p>
      </AppContainer>
    </footer>
  );
};
