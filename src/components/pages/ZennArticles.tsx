import { Box, Container, Heading } from "@chakra-ui/react";
import { FC } from "react";
import { ArticleList } from "../shared/ArticleList";
import { ArticlesNavigation } from "../shared/ArticlesNavigation";
import { Footer } from "../shared/Footer";
import { Header } from "../shared/Header";
import { ArticleHeader } from "../../models";

type Props = {
  articles: ArticleHeader[];
};

export const ZennArticles: FC<Props> = ({ articles }) => {
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
