import {
  Box,
  Container,
  Divider,
  Heading,
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
        <Divider marginY="8" />
        <Box as="section">
          <MarkdownRenderer>{article.bodyMdText}</MarkdownRenderer>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};
