import { Icon, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { FC } from "react";
import { MdArrowForward } from "react-icons/md";
import { pagesPath } from "../../lib/$path";

export const LinkToArticles: FC = () => {
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
