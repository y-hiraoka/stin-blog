import { useState, FC } from "react";
import { useIsomorphicLayoutEffect } from "react-use";
import { footerStyles } from "./Footer.css";

export const Footer: FC = () => {
  const [copyrightPeriod, setCopyrightPeriod] = useState("");

  useIsomorphicLayoutEffect(() => {
    const currentYear = new Date().getFullYear();
    setCopyrightPeriod(`${currentYear}`);
  }, []);

  return (
    <div>
      <footer className={footerStyles.footer}>
        <p className={footerStyles.description}>
          このサイトは{" "}
          <a
            className={footerStyles.textLink}
            href="https://policies.google.com/technologies/partner-sites?hl=ja"
            target="_blank"
            rel="noreferrer">
            {" "}
            Google Analytics
          </a>{" "}
          を使用しています
        </p>
        <small>
          &copy;{copyrightPeriod}{" "}
          <a
            className={footerStyles.textLink}
            href="https://twitter.com/stin_factory"
            target="_blank"
            rel="noreferrer">
            stin_factory
          </a>
        </small>
      </footer>
    </div>
  );
};
