import { Box, Container, Heading } from "@chakra-ui/react";
import { VFC } from "react";
import { ArticleHeader, ZennArticleHeader } from "../models";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Articles } from "../components/Articles";

type Props = {
  articles: (ArticleHeader | ZennArticleHeader)[];
};

export const Root: VFC<Props> = ({ articles }) => {
  return (
    <Box>
      <Header />
      <Container as="main" maxW="container.lg" marginTop="4" marginBottom="16">
        <Heading as="h1" marginBottom="4">
          Articles
        </Heading>
        <Articles articles={articles} />
      </Container>
      <Footer />
    </Box>
  );
};
