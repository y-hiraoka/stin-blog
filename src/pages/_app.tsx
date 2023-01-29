import "ress";
import "../styles/global.css";
import { AppProps } from "next/app";
import Script from "next/script";
import { useGoogleAnalytics } from "../lib/gtag";
import { ColorModeProvider } from "../lib/colorMode";

export default function App({ Component, pageProps }: AppProps) {
  useGoogleAnalytics();

  return (
    <>
      <Script
        id="twitter-embed-script"
        src="https://platform.twitter.com/widgets.js"
        strategy="beforeInteractive"
      />
      <ColorModeProvider>
        <Component {...pageProps} />
      </ColorModeProvider>
    </>
  );
}
