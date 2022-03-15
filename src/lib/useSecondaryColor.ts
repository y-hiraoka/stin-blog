import { useColorModeValue } from "@chakra-ui/react";

export function useSecondaryColor() {
  return useColorModeValue("gray.600", "whiteAlpha.700");
}
