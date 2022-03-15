import { Container } from "@chakra-ui/react";
import { VFC } from "react";
import { ArticleHeader, Tag } from "../models";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Articles } from "../components/Articles";

type Props = {
  articles: ArticleHeader[];
  tags: Tag[];
};

export const Root: VFC<Props> = ({ articles, tags }) => {
  return (
    <>
      <Header />
      <Container maxW="container.lg" marginTop="4">
        <Articles articles={articles} />
      </Container>
      <Footer />
    </>
  );
};
