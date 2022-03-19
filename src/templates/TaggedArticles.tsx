import { Box, Container, Heading, Tag } from "@chakra-ui/react";
import { VFC } from "react";
import { ArticleHeader } from "../models";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Articles } from "../components/Articles";

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
          marginBottom="4"
          display="flex"
          alignItems="center"
          gap="4"
          fontSize="2xl">
          Tagged with <Tag size="lg">{tagName}</Tag>
        </Heading>
        <Articles articles={articles} />
      </Container>
      <Footer />
    </Box>
  );
};
