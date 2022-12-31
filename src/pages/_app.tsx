import { ChakraProvider, extendTheme, ThemeComponentProps } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { AppProps } from "next/app";
import Script from "next/script";
import { useGoogleAnalytics } from "../lib/gtag";
import { ColorModeProvider } from "../lib/useColorMode";

const theme = extendTheme({
  styles: {
    global: (props: ThemeComponentProps) => ({
      body: {
        bgColor: mode("white", "#1C1C1C")(props),
        color: mode("#474B4B", "#E8EAEA")(props),
      },
    }),
  },
});

export default function App({ Component, pageProps }: AppProps) {
  useGoogleAnalytics();

  return (
    <>
      <Script
        id="twitter-embed-script"
        src="https://platform.twitter.com/widgets.js"
        strategy="beforeInteractive"
      />
      <ChakraProvider theme={theme}>
        <ColorModeProvider>
          <Component {...pageProps} />
        </ColorModeProvider>
      </ChakraProvider>
    </>
  );
}
