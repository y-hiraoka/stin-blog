import {
  Box,
  Container,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Link,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { VFC } from "react";
import { FaGithub } from "react-icons/fa";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import NextLink from "next/link";
import { staticPath } from "../../lib/$path";

export const Header: VFC = () => {
  const { toggleColorMode } = useColorMode();
  return (
    <Box>
      <Container maxW="container.lg">
        <Flex as="header" py="4" justifyContent="space-between" alignItems="center">
          <NextLink href="/">
            <a>
              <Image
                src={useColorModeValue(
                  staticPath.images.logo_black_png,
                  staticPath.images.logo_white_png,
                )}
                alt="stin's blog logo"
                title="stin's blog"
                h={["12", "14", "16"]}
              />
            </a>
          </NextLink>
          <HStack spacing="4">
            <IconButton
              aria-label="toggle theme"
              variant="ghost"
              icon={
                <Icon fontSize="2xl" as={useColorModeValue(MdDarkMode, MdLightMode)} />
              }
              onClick={toggleColorMode}
            />
            <IconButton
              aria-label="GitHub へ"
              title="GitHub へ"
              variant="ghost"
              as={Link}
              icon={<Icon fontSize="2xl" as={FaGithub} />}
              isExternal
              href="https://github.com/y-hiraoka/stin-blog"
            />
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};
