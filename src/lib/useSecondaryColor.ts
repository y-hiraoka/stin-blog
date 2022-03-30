import { useColorModeValue } from "@chakra-ui/react";

export function useSecondaryColor() {
  return useColorModeValue("blackAlpha.600", "whiteAlpha.700");
}
