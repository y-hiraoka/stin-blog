import {
  Box,
  Heading,
  Link,
  Text,
  chakra,
  Code as ChakraCode,
  useColorModeValue,
  Table as ChakraTable,
  Thead as ChakraThead,
  Tbody as ChakraTbody,
  Tfoot as ChakraTfoot,
  Tr as ChakraTr,
  Th as ChakraTh,
  Td as ChakraTd,
  TableCaption as ChakraTableCaption,
} from "@chakra-ui/react";
import React from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkSlug from "remark-slug";
import remarkGfm from "remark-gfm";
import { Prism } from "react-syntax-highlighter";
import { a11yDark as prismStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { RichLinkCard } from "./RichLinkCard";
import styles from "./MarkdownRenderer.module.css";
import { useSecondaryColor } from "../../lib/useSecondaryColor";

type Props = { children: string };

export const MarkdownRenderer: React.VFC<Props> = ({ children }) => {
  return (
    <div className={styles.markdownRoot}>
      <ReactMarkdown
        remarkPlugins={[remarkSlug, remarkGfm]}
        components={{
          a: MDLink,
          h1: Heading1,
          h2: Heading2,
          h3: Heading3,
          h4: Heading4,
          h5: Heading5,
          h6: Heading6,
          code: Code,
          p: Paragraph,
          ul: UnorderedList,
          ol: OrderedList,
          li: ListItem,
          blockquote: Blockquote,
          table: Table,
          thead: Thead,
          tbody: Tbody,
          tr: Tr,
          th: Th,
          td: Td,
        }}>
        {children}
      </ReactMarkdown>
    </div>
  );
};

const MDLink: Components["a"] = ({ node, href, ...props }) => {
  const color = useColorModeValue("blue.500", "blue.400");
  const visitedColor = useColorModeValue("purple.500", "purple.300");

  // a link to same domain
  if (href?.startsWith("#") || href?.startsWith("/") || href?.includes("stin.ink")) {
    return (
      <Link {...props} href={href} color={color} _visited={{ color: visitedColor }} />
    );
  }

  return (
    <Link
      {...props}
      href={href}
      isExternal
      color={color}
      _visited={{ color: visitedColor }}
    />
  );
};

const Heading1: Components["h1"] = ({ level, node, ...props }) => {
  return <Heading {...props} as="h1" fontSize="2xl" mb="8" mt="24" />;
};

const Heading2: Components["h2"] = ({ level, node, ...props }) => {
  return <Heading {...props} as="h2" fontSize="xl" mb="6" mt="16" />;
};

const Heading3: Components["h3"] = ({ level, node, ...props }) => {
  return <Heading {...props} as="h3" fontSize="lg" mb="4" mt="12" />;
};

const Heading4: Components["h4"] = ({ level, node, ...props }) => {
  return <Heading {...props} as="h4" fontSize="md" mb="3" mt="8" />;
};

const Heading5: Components["h5"] = ({ level, node, ...props }) => {
  return <Heading {...props} as="h5" fontSize="sm" mb="3" mt="6" />;
};

const Heading6: Components["h6"] = ({ level, node, ...props }) => {
  return <Heading {...props} as="h6" fontSize="xs" mb="3" mt="4" />;
};

const Code: Components["code"] = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || "");
  return !inline ? (
    <Box my="4">
      <Prism style={prismStyle} language={match?.[1]} PreTag="div" {...props}>
        {String(children).replace(/\n$/, "")}
      </Prism>
    </Box>
  ) : (
    <ChakraCode className={className} {...props} px="1">
      {children}
    </ChakraCode>
  );
};

const ChakraLi = chakra.li;
const ChakraUl = chakra.ul;
const ChakraOl = chakra.ol;

const UnorderedList: Components["ul"] = ({ node, depth, ordered, ...props }) => {
  return <ChakraUl {...props} paddingLeft="7" my="4" />;
};

const OrderedList: Components["ol"] = ({ node, depth, ordered, ...props }) => {
  return <ChakraOl {...props} paddingLeft="7" my="4" />;
};

const ListItem: Components["li"] = ({ node, checked, index, ordered, ...props }) => {
  return <ChakraLi {...props} lineHeight="1.8" my="2" />;
};

const Paragraph: Components["p"] = ({ node, ...props }) => {
  const child = node.children[0];
  if (
    node.children.length === 1 &&
    child.type === "element" &&
    child.tagName === "a" &&
    typeof child.properties?.href === "string" &&
    child.children[0].type === "text" &&
    child.properties.href === child.children[0].value
  ) {
    return (
      <Box my="4">
        <RichLinkCard href={child.properties.href} isExternal />
      </Box>
    );
  }

  return <Text {...props} lineHeight="1.8" />;
};

const Blockquote: Components["blockquote"] = ({ node, ...props }) => {
  return (
    <Text
      as="blockquote"
      {...props}
      color={useSecondaryColor()}
      my="4"
      paddingLeft="4"
      paddingY="1"
      borderLeft="4px solid"
      borderColor={useColorModeValue("gray.300", "gray.600")}
    />
  );
};

const Table: Components["table"] = ({ node, ...props }) => {
  return <ChakraTable {...props} my="6" />;
};

const Thead: Components["thead"] = ({ node, ...props }) => {
  return <ChakraThead {...props} />;
};

const Tbody: Components["tbody"] = ({ node, ...props }) => {
  return <ChakraTbody {...props} />;
};

const Tr: Components["tr"] = ({ node, isHeader, ...props }) => {
  return <ChakraTr {...props} />;
};

const Th: Components["th"] = ({ node, isHeader, ...props }) => {
  // @ts-expect-error
  return <ChakraTh {...props} />;
};

const Td: Components["td"] = ({ node, isHeader, ...props }) => {
  // @ts-expect-error
  return <ChakraTd {...props} />;
};
