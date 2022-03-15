import { Container, Link, Stack, Text } from "@chakra-ui/react";
import { useState, VFC } from "react";
import { useIsomorphicLayoutEffect } from "react-use";

export const Footer: VFC = () => {
  const [copyrightPeriod, setCopyrightPeriod] = useState("");

  useIsomorphicLayoutEffect(() => {
    const currentYear = new Date().getFullYear();
    setCopyrightPeriod(currentYear === 2020 ? "2020" : `2020 - ${currentYear}`);
  }, []);

  return (
    <Container maxW="container.lg">
      <Stack as="footer">
        <Text color="gray.200">
          このサイトは{" "}
          <Link
            href="https://policies.google.com/technologies/partner-sites?hl=ja"
            isExternal>
            {" "}
            Google Analytics
          </Link>{" "}
          を使用しています
        </Text>
        <Text color="gray.200">
          &copy; {copyrightPeriod}{" "}
          <Link isExternal href="https://twitter.com/stin_factory">
            stin_factory
          </Link>
        </Text>
      </Stack>
    </Container>
  );
};
