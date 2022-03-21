import {
  Flex,
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
import { ArticleHeader } from "../models";
import { pagesPath } from "../lib/$path";
import { Datetime } from "./Datetime";
import { TagLink } from "./TagLink";
import { getFaviconUrl } from "../lib/getFaviconUrl";
import { config } from "../config";

type Props = { article: ArticleHeader };

export const ArticleCard: VFC<Props> = ({ article }) => {
  return (
    <Flex
      as="article"
      borderRadius="md"
      flexDirection="column"
      py="4"
      px="6"
      bgColor={useColorModeValue("gray.100", "gray.700")}
      boxShadow="md">
      <Datetime
        datetime={article.createdAt}
        format="yyyy年MM月dd日 HH時mm分"
        color={useSecondaryColor()}
        fontSize={["sm"]}
        letterSpacing="wider"
      />
      <Heading
        as="h3"
        fontSize={["lg", "lg", "xl"]}
        lineHeight={1.6}
        marginTop="4"
        flex={1}>
        {article.type === "stin-blog" ? (
          <NextLink href={pagesPath.articles._slug(article.slug).$url()} passHref>
            <Link>{article.title}</Link>
          </NextLink>
        ) : (
          <Link isExternal href={article.url}>
            {article.title}
          </Link>
        )}
      </Heading>
      {article.type === "stin-blog" ? (
        <Wrap marginTop="8">
          {article.tags.map(tag => (
            <WrapItem key={tag}>
              <TagLink tag={tag} />
            </WrapItem>
          ))}
        </Wrap>
      ) : (
        <Link
          href={`https://zenn.dev/${config.social.zenn}`}
          isExternal
          w="fit-content"
          marginTop="8">
          <HStack>
            <Image src={getFaviconUrl("zenn.dev")} alt="" w="4" h="4" />
            <Text fontSize="md" as="div">
              Zenn
            </Text>
          </HStack>
        </Link>
      )}
    </Flex>
  );
};
