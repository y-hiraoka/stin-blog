import {
  Box,
  Container,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useBreakpointValue,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { VFC } from "react";
import { MdDarkMode, MdLightMode, MdMenu } from "react-icons/md";
import NextLink from "next/link";
import { pagesPath, staticPath } from "../../lib/$path";
import { config } from "../../config";

export const Header: VFC = () => {
  const { toggleColorMode } = useColorMode();
  const screenIsWider = useBreakpointValue([false, false, true], "sm");

  return (
    <Box>
      <Container maxW="container.lg">
        <Flex as="header" py="4" justifyContent="space-between" alignItems="center">
          <NextLink href="/" passHref>
            <Link>
              <Image
                src={useColorModeValue(
                  staticPath.images.logo_black_png,
                  staticPath.images.logo_white_png,
                )}
                alt="stin's blog logo"
                title="stin's blog"
                h={["12", "14", "16"]}
                w="auto"
                htmlWidth={982}
                htmlHeight={298}
              />
            </Link>
          </NextLink>
          <HStack spacing="3">
            <IconButton
              aria-label="toggle theme"
              variant="ghost"
              icon={
                <Icon fontSize="2xl" as={useColorModeValue(MdDarkMode, MdLightMode)} />
              }
              onClick={toggleColorMode}
            />
            {screenIsWider ? <NavLinks /> : <CollapsedNavLinks />}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

const NavLinks: VFC = () => {
  return (
    <>
      <NextLink href={pagesPath.articles.$url()} passHref>
        <Link fontWeight="bold">Articles</Link>
      </NextLink>
      <Link href="https://stin.ink" fontWeight="bold">
        About
      </Link>
      <Link
        isExternal
        href={config.repository}
        display="flex"
        alignItems="center"
        gap="2"
        fontWeight="bold"
      >
        GitHub
      </Link>
    </>
  );
};

const CollapsedNavLinks: VFC = () => {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="ナビゲーションリンクを開閉する"
        icon={<Icon as={MdMenu} />}
        variant="outline"
      />
      <MenuList>
        <NextLink href={pagesPath.articles.$url()} passHref>
          <MenuItem as="a">Articles</MenuItem>
        </NextLink>
        <MenuItem as="a" href="https://stin.ink">
          About
        </MenuItem>
        <MenuItem as="a" target="_blank" rel="noreferer" href={config.repository}>
          GitHub
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
