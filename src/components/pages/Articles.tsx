import {
  Box,
  Container,
  Heading,
  HStack,
  Icon,
  IconButton,
  Link,
} from "@chakra-ui/react";
import { VFC } from "react";
import { ArticleList } from "../shared/ArticleList";
import { ArticlesNavigation } from "../shared/ArticlesNavigation";
import { Footer } from "../shared/Footer";
import { Header } from "../shared/Header";
import { ArticleHeader } from "../../models";
import { MdRssFeed } from "react-icons/md";
import { pagesPath } from "../../lib/$path";

type Props = {
  articles: ArticleHeader[];
};

export const Articles: VFC<Props> = ({ articles }) => {
  return (
    <Box>
      <Header />
      <Container as="main" maxW="container.lg" marginTop="4" marginBottom="16">
        <HStack marginBottom="4">
          <Heading as="h1" fontSize="2xl">
            Articles
          </Heading>
          <IconButton
            aria-label="RSS Feed を表示"
            title="RSS Feed を表示"
            variant="ghost"
            as={Link}
            icon={<Icon fontSize="2xl" as={MdRssFeed} />}
            isExternal
            href={pagesPath.feed.$url().pathname}
          />
        </HStack>
        <ArticlesNavigation />
        <Box marginTop="8">
          <ArticleList articles={articles} />
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};
