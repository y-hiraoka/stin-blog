import React from "react";
import { Article as IArticle } from "../models";
import { ContentsLayout } from "../molecules/ContentsLayout";
import { Toc } from "../atoms/Toc";
import { ArticleHeader } from "../atoms/ArticleHeader";
import styles from "./Article.module.css";
import { ExternalLink } from "../atoms/ExternalLink";
import { GitHubIcon } from "../atoms/GitHubIcon";
import { Box, Container, Heading } from "@chakra-ui/react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

type Props = {
  article: IArticle;
};

export const Article: React.VFC<Props> = ({ article }) => {
  return (
    <Box>
      <Header />
      <Container as="main" maxW="container.lg" marginTop="4" marginBottom="16">
        <Heading as="h1" marginBottom="4" fontSize="2xl" lineHeight={1.6}>
          {article.header.matterData.title}
        </Heading>
        <MarkdownRenderer>{article.bodyMdText}</MarkdownRenderer>
      </Container>
      <Footer />
    </Box>
  );
};
