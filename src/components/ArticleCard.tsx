import { Box, Heading, HStack, Link, Tag, useColorModeValue } from "@chakra-ui/react";
import NextLink from "next/link";
import { VFC } from "react";
import { useSecondaryColor } from "../lib/useSecondaryColor";
import { ArticleHeader } from "../models";
import { pagesPath } from "../utils/$path";
import { Datetime } from "./Datetime";

type Props = { article: ArticleHeader };

export const ArticleCard: VFC<Props> = ({ article }) => {
  return (
    <Box
      as="article"
      borderRadius="md"
      p="4"
      bgColor={useColorModeValue("gray.100", "gray.700")}
      boxShadow="md">
      <Datetime
        datetime={article.matterData.createdAt}
        format="yyyy年M月d日 H時m分"
        color={useSecondaryColor()}
        fontSize={["sm"]}
      />
      <Heading as="h3" fontSize={["lg", "lg", "xl"]} lineHeight={1.6} marginTop="4">
        <NextLink href={pagesPath.articles._slug(article.slug).$url()} passHref>
          <Link>{article.matterData.title}</Link>
        </NextLink>
      </Heading>
      <HStack marginTop="8">
        {article.matterData.tags.map(tag => (
          <NextLink key={tag} href={pagesPath.tags._tagName(tag).$url()} passHref>
            <Link>
              <Tag colorScheme="purple">{tag}</Tag>
            </Link>
          </NextLink>
        ))}
      </HStack>
    </Box>
  );
};
