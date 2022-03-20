import {
  Box,
  Flex,
  HStack,
  Image,
  Skeleton,
  SkeletonText,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState, VFC } from "react";
import { getFaviconUrl } from "../lib/getFaviconUrl";
import { useSecondaryColor } from "../lib/useSecondaryColor";
import { SiteMetadata } from "../pages/api/site-metadata";

type MetadataState =
  | {
      metadata?: undefined;
      isLoading: true;
    }
  | {
      metadata: SiteMetadata;
      url: string;
      isLoading: false;
    };
const useMetadataState = (href: string) => {
  const [state, setState] = useState<MetadataState>({
    metadata: undefined,
    isLoading: true,
  });

  useEffect(() => {
    // 相対パスの場合はURLに変換する
    const url = /https?/.test(href) ? href : new URL(href, window.location.href).href;

    fetch(`/api/site-metadata?url=${encodeURIComponent(url)}`)
      .then(r => r.json())
      .then(data => {
        setState({
          metadata: data,
          url: url,
          isLoading: false,
        });
      });
  }, [href]);

  return state;
};

type Props = {
  href: string;
  isExternal: boolean;
};

export const RichLinkCard: VFC<Props> = ({ href, isExternal }) => {
  const metadataState = useMetadataState(href);

  if (metadataState.isLoading) {
    return <RichLinkCardSkeleton />;
  } else {
    return (
      <RichLinkCardLoaded
        href={metadataState.url}
        isExternal={isExternal}
        metadata={metadataState.metadata}
      />
    );
  }
};

const RichLinkCardLoaded: VFC<Props & { metadata: SiteMetadata }> = ({
  href,
  isExternal,
  metadata,
}) => {
  const hostname = new URL(href).hostname;

  return (
    <HStack
      as="a"
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener" : undefined}
      w="full"
      h="36"
      borderRadius="lg"
      border="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      overflow="hidden"
      transition="background-color 0.3s"
      _hover={{ bgColor: useColorModeValue("blackAlpha.50", "whiteAlpha.100") }}>
      <Flex direction="column" flex={1} px="4" py="2" h="full">
        {metadata.title ? (
          <Text as="div" fontWeight="bold" noOfLines={2} wordBreak="break-all">
            {metadata.title}
          </Text>
        ) : (
          <Text as="div" noOfLines={2} wordBreak="break-all">
            {href}
          </Text>
        )}
        <Box flex={1} marginTop="2">
          <Text
            as="div"
            fontSize={["xs", "xs", "sm"]}
            color={useSecondaryColor()}
            noOfLines={2}
            wordBreak="break-all">
            {metadata.description}
          </Text>
        </Box>
        <HStack>
          <Image src={getFaviconUrl(href)} alt="" w="4" h="4" />
          <Text fontSize="sm" as="div" noOfLines={1}>
            {hostname}
          </Text>
        </HStack>
      </Flex>
      {metadata.image && (
        <Box maxW="40%" h="36">
          <Image
            src={metadata.image}
            alt={metadata.title}
            w="full"
            h="full"
            objectFit="cover"
          />
        </Box>
      )}
    </HStack>
  );
};

const RichLinkCardSkeleton: VFC = () => {
  return (
    <HStack
      w="full"
      h="36"
      borderRadius="lg"
      border="1px solid"
      borderColor={useColorModeValue("gray.300", "gray.700")}
      overflow="hidden">
      <Flex direction="column" flex={1} px="4" py="2" h="full">
        <SkeletonText noOfLines={2} />
        <Box flex={1} marginTop="6">
          <SkeletonText noOfLines={2} />
        </Box>
        <HStack>
          <Skeleton w="4" h="4" />
          <SkeletonText noOfLines={1} />
        </HStack>
      </Flex>
      <Box maxW="40%" h="full">
        <Skeleton w="64" h="36" />
      </Box>
    </HStack>
  );
};
