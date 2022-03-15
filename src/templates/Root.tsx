import React from "react";
import { ArticleHeader, Tag } from "../models";
import { ContentsLayout } from "../molecules/ContentsLayout";
import { TagLinks } from "../atoms/TagLinks";
import { ArticleList } from "../atoms/ArticleList";
import { Container } from "@chakra-ui/react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

type Props = {
  articles: ArticleHeader[];
  tags: Tag[];
};

export const Root: React.VFC<Props> = ({ articles, tags }) => {
  return (
    <>
      <Header />
      <Container maxW="container.lg">
        <ArticleList articles={articles} />
      </Container>
      <Footer />
    </>
  );
};
