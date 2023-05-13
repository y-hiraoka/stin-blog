import NextLink from "next/link";
import { FC } from "react";
import { Footer } from "../shared/Footer";
import { Header } from "../shared/Header";
import classes from "./NotFound.module.scss";

export const NotFound: FC = () => {
  return (
    <div>
      <Header />
      <div className={classes.container}>
        <h1 className={classes.heading}>
          <span style={{ display: "inline-block" }}>ページが</span>
          <span style={{ display: "inline-block" }}>見つかりません</span>
        </h1>
        <NextLink href="/" className={classes.homeLink}>
          ホームに戻る
        </NextLink>
      </div>
      <Footer />
    </div>
  );
};
