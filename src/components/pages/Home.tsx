import { Box, Center, Container, Heading, Icon, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { VFC } from "react";
import { MdArrowForward } from "react-icons/md";
import { ArticleList } from "../shared/ArticleList";
import { Footer } from "../shared/Footer";
import { Header } from "../shared/Header";
import { pagesPath } from "../../lib/$path";
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
          <NextLink href={pagesPath.articles.$url()} passHref>
            <Link
              display="flex"
              alignItems="center"
              gap="2"
              p="4"
              textDecoration="underline"
              _hover={{ color: "purple.300" }}>
              <span>すべての記事一覧へ</span>
              <Icon as={MdArrowForward} />
            </Link>
          </NextLink>
        </Center>
      </Container>
      <Footer />
    </Box>
  );
};
