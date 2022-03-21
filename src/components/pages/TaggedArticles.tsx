import { Box, Container, Heading, Tag } from "@chakra-ui/react";
import { VFC } from "react";
import { ArticleList } from "../shared/ArticleList";
import { Footer } from "../shared/Footer";
import { Header } from "../shared/Header";
import { ArticleHeader } from "../../models";

type Props = {
  tagName: string;
  articles: ArticleHeader[];
};

export const TaggedArticles: VFC<Props> = ({ tagName, articles }) => {
  return (
    <Box>
      <Header />
      <Container as="main" maxW="container.lg" marginTop="4" marginBottom="16">
        <Heading
          as="h1"
          marginBottom="8"
          display="flex"
          alignItems="center"
          gap="4"
          fontSize="2xl">
          Tagged with <Tag size="lg">{tagName}</Tag>
        </Heading>
        <ArticleList articles={articles} />
      </Container>
      <Footer />
    </Box>
  );
};
