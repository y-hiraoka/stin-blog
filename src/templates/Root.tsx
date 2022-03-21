import { Box, Center, Container, Heading, Icon, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { VFC } from "react";
import { MdArrowForward } from "react-icons/md";
import { ArticleHeader, ZennArticleHeader } from "../models";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ArticleList } from "../components/ArticleList";
import { pagesPath } from "../lib/$path";

type Props = {
  articles: (ArticleHeader | ZennArticleHeader)[];
};

export const Root: VFC<Props> = ({ articles }) => {
  return (
    <Box>
      <Header />
      <Container as="main" maxW="container.lg" marginTop="4" marginBottom="16">
        <Heading as="h1" marginBottom="8" fontSize="2xl">
          Home
        </Heading>
        <ArticleList articles={articles} />
        <Center marginTop="12">
          <NextLink href={pagesPath.articles.$url()} passHref>
            <Link
              display="flex"
              alignItems="center"
              gap="2"
              p="4"
              textDecoration="underline"
              _hover={{ color: "purple.300" }}>
              <span>記事一覧へ</span>
              <Icon as={MdArrowForward} />
            </Link>
          </NextLink>
        </Center>
      </Container>
      <Footer />
    </Box>
  );
};
