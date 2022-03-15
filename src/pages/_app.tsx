import { ChakraProvider, extendTheme, ThemeComponentProps } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { AppProps } from "next/app";
import { useGoogleAnalytics } from "../lib/gtag";

const theme = extendTheme({
  styles: {
    global: (props: ThemeComponentProps) => ({
      "html, body": {
        bgColor: mode("white", "#1C1C1C")(props),
      },
    }),
  },
});

export default function App({ Component, pageProps }: AppProps) {
  useGoogleAnalytics();

  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
