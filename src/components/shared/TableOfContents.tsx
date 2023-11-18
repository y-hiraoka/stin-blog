"use client";

import classes from "./TableOfContents.module.scss";
import { FC, useEffect } from "react";
import tocbot from "tocbot";

export const TableOfContents: FC = () => {
  useEffect(() => {
    tocbot.init({
      tocSelector: `.${classes.toc}`,
      contentSelector: "#markdown-renderer",
      activeLinkClass: classes.tocLinkActive,
      listClass: classes.tocList,
      linkClass: classes.tocLink,
      scrollSmoothDuration: 200,
      scrollSmoothOffset: -92,
    });

    return () => tocbot.destroy();
  }, []);

  return (
    <nav className={classes.root}>
      <h2 className={classes.tocTitle}>Table of Contents</h2>
      <div className={classes.toc} />
    </nav>
  );
};
