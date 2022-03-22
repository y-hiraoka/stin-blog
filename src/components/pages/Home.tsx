import { Box, Center, Container, Heading } from "@chakra-ui/react";
import { VFC } from "react";
import { ArticleList } from "../shared/ArticleList";
import { Footer } from "../shared/Footer";
import { Header } from "../shared/Header";
import { LinkToArticles } from "../shared/LinkToArticles";
import { ArticleHeader } from "../../models";

type Props = {
  articles: ArticleHeader[];
};

export const Home: VFC<Props> = ({ articles }) => {
  return (
    <Box>
      <Header />
      <Container as="main" maxW="container.lg" marginTop="4" marginBottom="16">
        <Heading as="h1" marginBottom="8" fontSize="2xl">
          Home
        </Heading>
        <ArticleList articles={articles} />
        <Center marginTop="12">
          <LinkToArticles />
        </Center>
      </Container>
      <Footer />
    </Box>
  );
};
