import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  Heading,
  Icon,
  Image,
  Link,
  Stack,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import React from "react";
import { Datetime } from "../shared/Datetime";
import { Footer } from "../shared/Footer";
import { Header } from "../shared/Header";
import { MarkdownRenderer } from "../shared/MarkdownRenderer";
import { TagLink } from "../shared/TagLink";
import { useSecondaryColor } from "../../lib/useSecondaryColor";
import { Article as IArticle } from "../../models";
import { LinkToArticles } from "../shared/LinkToArticles";
import { TwitterIntentTweet } from "../shared/TwitterIntentTweet";
import { config } from "../../config";
import { FaGithub, FaTwitter } from "react-icons/fa";
import { AdSense } from "../shared/AdSense";

type Props = {
  article: IArticle;
};

export const Article: React.VFC<Props> = ({ article }) => {
  const secondaryColor = useSecondaryColor();
  return (
    <Box>
      <Header />
      <Container as="main" maxW="container.lg" marginTop="4" marginBottom="16">
        <Stack spacing="8">
          <Heading as="h1" fontSize="2xl" lineHeight={1.6}>
            {article.header.title}
          </Heading>
          <Stack spacing="1">
            <Text fontSize="sm" color={secondaryColor}>
              公開:{" "}
              <Datetime
                format="yyyy年MM月dd日 HH時mm分"
                datetime={article.header.createdAt}
              />
            </Text>
            {article.header.updatedAt && (
              <Text fontSize="sm" color={secondaryColor}>
                更新:{" "}
                <Datetime
                  format="yyyy年MM月dd日 HH時mm分"
                  datetime={article.header.updatedAt}
                />
              </Text>
            )}
          </Stack>
          <Wrap>
            {article.header.tags.map(tag => (
              <WrapItem key={tag}>
                <TagLink tag={tag} />
              </WrapItem>
            ))}
          </Wrap>
        </Stack>
        <Box as="section" marginY="8">
          <AdSense />
        </Box>
        <Divider marginY="8" />
        <Box as="section" marginBottom="16">
          <MarkdownRenderer>{article.bodyMdText}</MarkdownRenderer>
        </Box>
        <Box as="section" marginBottom="16">
          <AdSense />
        </Box>
        <Box as="section" marginBottom="16">
          <Flex wrap="wrap" gap="2">
            <Button
              as={TwitterIntentTweet}
              text={article.header.title}
              url={`${config.siteUrl}/articles/${article.header.slug}`}
              hashtags={article.header.tags}
              via={config.social.twitter}
              colorScheme="twitter"
              leftIcon={<Icon as={FaTwitter} />}
            >
              記事をシェア
            </Button>
            <a
              href="https://www.buymeacoffee.com/stin"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                alt="Buy Me A Coffee"
                h="10"
                htmlHeight="40"
              />
            </a>
          </Flex>
          <Link
            href={`${config.repository}/tree/main/contents/${article.header.slug}.md`}
            isExternal
            mt="6"
            display="inline-flex"
            alignItems="center"
            gap="2"
            color={useSecondaryColor()}
          >
            <Icon as={FaGithub} fontSize="2xl" />
            GitHub で修正をリクエストする
          </Link>
        </Box>
        <Center>
          <LinkToArticles />
        </Center>
      </Container>
      <Footer />
    </Box>
  );
};
