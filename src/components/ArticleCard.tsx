import {
  Box,
  Heading,
  HStack,
  Image,
  Link,
  Text,
  useColorModeValue,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { VFC } from "react";
import { useSecondaryColor } from "../lib/useSecondaryColor";
import { ArticleHeader, ZennArticleHeader } from "../models";
import { pagesPath } from "../lib/$path";
import { Datetime } from "./Datetime";
import { TagLink } from "./TagLink";
import { getFaviconUrl } from "../lib/getFaviconUrl";

type Props = { article: ArticleHeader | ZennArticleHeader };

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
        datetime={
          article.type === "stin-blog" ? article.matterData.createdAt : article.pubDate
        }
        format="yyyy年M月d日 H時m分"
        color={useSecondaryColor()}
        fontSize={["sm"]}
      />
      <Heading as="h3" fontSize={["lg", "lg", "xl"]} lineHeight={1.6} marginTop="4">
        {article.type === "stin-blog" ? (
          <NextLink href={pagesPath.articles._slug(article.slug).$url()} passHref>
            <Link>{article.matterData.title}</Link>
          </NextLink>
        ) : (
          <Link isExternal href={article.url}>
            {article.title}
          </Link>
        )}
      </Heading>
      {article.type === "stin-blog" ? (
        <Wrap marginTop="8">
          {article.matterData.tags.map(tag => (
            <WrapItem key={tag}>
              <TagLink tag={tag} />
            </WrapItem>
          ))}
        </Wrap>
      ) : (
        <HStack>
          <Image src={getFaviconUrl("zenn.dev")} alt="" w="4" h="4" />
          <Text fontSize="sm" as="div">
            Zenn
          </Text>
        </HStack>
      )}
    </Box>
  );
};
