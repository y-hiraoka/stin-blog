import {
  Box,
  Heading,
  HStack,
  Link,
  useColorModeValue,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { VFC } from "react";
import { useSecondaryColor } from "../lib/useSecondaryColor";
import { ArticleHeader } from "../models";
import { pagesPath } from "../lib/$path";
import { Datetime } from "./Datetime";
import { TagLink } from "./TagLink";

type Props = { article: ArticleHeader };

export const ArticleCard: VFC<Props> = ({ article }) => {
  return (
    <Box
      as="article"
      borderRadius="md"
      py="4"
      px="6"
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
        <Wrap>
          {article.matterData.tags.map(tag => (
            <WrapItem key={tag}>
              <TagLink tag={tag} />
            </WrapItem>
          ))}
        </Wrap>
      </HStack>
    </Box>
  );
};
