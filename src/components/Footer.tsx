import { Box, Container, Flex, Link, Text } from "@chakra-ui/react";
import { useState, VFC } from "react";
import { useIsomorphicLayoutEffect } from "react-use";
import { useSecondaryColor } from "../lib/useSecondaryColor";

export const Footer: VFC = () => {
  const [copyrightPeriod, setCopyrightPeriod] = useState("");

  useIsomorphicLayoutEffect(() => {
    const currentYear = new Date().getFullYear();
    setCopyrightPeriod(`${currentYear}`);
  }, []);

  return (
    <Box>
      <Container maxW="container.lg">
        <Flex
          as="footer"
          py="8"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap="4">
          <Text color={useSecondaryColor()} fontSize="sm">
            このサイトは{" "}
            <Link
              href="https://policies.google.com/technologies/partner-sites?hl=ja"
              isExternal>
              {" "}
              Google Analytics
            </Link>{" "}
            を使用しています
          </Text>
          <Text color={useSecondaryColor()} as="small">
            &copy;{copyrightPeriod}{" "}
            <Link isExternal href="https://twitter.com/stin_factory">
              stin_factory
            </Link>
          </Text>
        </Flex>
      </Container>
    </Box>
  );
};
