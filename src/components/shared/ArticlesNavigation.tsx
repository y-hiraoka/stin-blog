import { Flex, Link, useColorModeValue } from "@chakra-ui/react";
import { VFC } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { UrlObject } from "url";
import { pagesPath } from "../../lib/$path";

export const ArticlesNavigation: VFC = () => {
  return (
    <Flex
      as="nav"
      gap="4"
      alignItems="center"
      borderBottom="2px solid"
      borderColor={useColorModeValue("gray.300", "gray.600")}>
      <NavigationLink href={pagesPath.articles.$url()}>Blog</NavigationLink>
      <NavigationLink href={pagesPath.articles.zenn.$url()}>Zenn</NavigationLink>
    </Flex>
  );
};

const NavigationLink: VFC<{
  href: UrlObject;
  children: string;
}> = ({ href, children }) => {
  const router = useRouter();
  const isActive = href.pathname === router.pathname;

  const nonActiveFontColor = useColorModeValue("blackAlpha.500", "whiteAlpha.600");
  const activeBorderColor = useColorModeValue("gray.800", "gray.300");

  return (
    <NextLink href={href} passHref>
      <Link
        fontWeight="bold"
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="12"
        py="2"
        px="4"
        color={isActive ? undefined : nonActiveFontColor}
        marginBottom="-2px"
        borderBottomWidth="2px"
        borderBottomColor={isActive ? activeBorderColor : "transparent"}
        _hover={{ bgColor: useColorModeValue("blackAlpha.100", "whiteAlpha.200") }}>
        {children}
      </Link>
    </NextLink>
  );
};
