import NextLink from "next/link";
import { FC } from "react";
import { pagesPath } from "../../lib/$path";
import { Footer } from "../shared/Footer";
import { Header } from "../shared/Header";
import { notFoundStyles } from "./NotFound.css";

export const NotFound: FC = () => {
  return (
    <div>
      <Header />
      <div className={notFoundStyles.container}>
        <h1 className={notFoundStyles.heading}>
          <span style={{ display: "inline-block" }}>ページが</span>
          <span style={{ display: "inline-block" }}>見つかりません</span>
        </h1>
        <NextLink href={pagesPath.$url()} className={notFoundStyles.homeLink}>
          ホームに戻る
        </NextLink>
      </div>
      <Footer />
    </div>
  );
};
