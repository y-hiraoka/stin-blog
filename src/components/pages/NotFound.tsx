import { Box, Center, Container, Heading, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { VFC } from "react";
import { pagesPath } from "../../lib/$path";
import { Footer } from "../shared/Footer";
import { Header } from "../shared/Header";

export const NotFound: VFC = () => {
  return (
    <Box>
      <Header />
      <Container maxW="container.lg">
        <Center py="16">
          <Heading as="h1" textAlign="center">
            <span style={{ display: "inline-block" }}>ページが</span>
            <span style={{ display: "inline-block" }}>見つかりません</span>
          </Heading>
        </Center>
        <Center marginTop="12">
          <NextLink href={pagesPath.$url()} passHref legacyBehavior>
            <Link
              display="flex"
              alignItems="center"
              gap="2"
              p="4"
              textDecoration="underline"
              _hover={{ color: "purple.300" }}>
              <span>ホームに戻る</span>
            </Link>
          </NextLink>
        </Center>
      </Container>
      <Footer />
    </Box>
  );
};
