import { Link, Tag } from "@chakra-ui/react";
import NextLink from "next/link";
import { VFC } from "react";
import { pagesPath } from "../../lib/$path";

export const TagLink: VFC<{ tag: string }> = ({ tag }) => {
  return (
    <NextLink
      key={tag}
      href={pagesPath.tags._tagName(tag).$url()}
      passHref
      legacyBehavior>
      <Link>
        <Tag colorScheme="purple">{tag}</Tag>
      </Link>
    </NextLink>
  );
};
