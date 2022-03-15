import {
  Container,
  Flex,
  Icon,
  IconButton,
  Image,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { VFC } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import NextLink from "next/link";
import { staticPath } from "../utils/$path";

export const Header: VFC = () => {
  const { toggleColorMode } = useColorMode();
  return (
    <Container maxW="container.lg">
      <Flex as="header" py="2" justifyContent="space-between" alignItems="center">
        <NextLink href="/">
          <a>
            <Image
              src={useColorModeValue(
                staticPath.images.logo_black_png,
                staticPath.images.logo_white_png,
              )}
              alt="stin's blog logo"
              title="stin's blog"
              h="12"
            />
          </a>
        </NextLink>
        <IconButton
          aria-label="toggle theme"
          variant="ghost"
          icon={<Icon fontSize="2xl" as={useColorModeValue(MdDarkMode, MdLightMode)} />}
          onClick={toggleColorMode}
        />
      </Flex>
    </Container>
  );
};
