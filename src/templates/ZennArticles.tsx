import { Box, Container, Heading } from "@chakra-ui/react";
import { VFC } from "react";
import { ArticleHeader, ZennArticleHeader } from "../models";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ArticleList } from "../components/ArticleList";
import { ArticlesNavigation } from "../components/ArticlesNavigation";

type Props = {
  articles: (ArticleHeader | ZennArticleHeader)[];
};

export const ZennArticles: VFC<Props> = ({ articles }) => {
  return (
    <Box>
      <Header />
      <Container as="main" maxW="container.lg" marginTop="4" marginBottom="16">
        <Heading as="h1" marginBottom="4" fontSize="2xl">
          Zenn Articles
        </Heading>
        <ArticlesNavigation />
        <Box marginTop="8">
          <ArticleList articles={articles} />
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};
