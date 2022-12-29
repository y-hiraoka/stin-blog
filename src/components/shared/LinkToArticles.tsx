import { Icon, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { VFC } from "react";
import { MdArrowForward } from "react-icons/md";
import { pagesPath } from "../../lib/$path";

export const LinkToArticles: VFC = () => {
  return (
    <NextLink href={pagesPath.articles.$url()} passHref legacyBehavior>
      <Link
        display="flex"
        alignItems="center"
        gap="2"
        p="4"
        textDecoration="underline"
        _hover={{ color: "purple.300" }}>
        <span>すべての記事一覧へ</span>
        <Icon as={MdArrowForward} />
      </Link>
    </NextLink>
  );
};
