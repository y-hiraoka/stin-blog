import "ress";
import "../styles/global.css";
import { AppProps } from "next/app";
import { useGoogleAnalytics } from "../lib/gtag";
import { ColorModeProvider } from "../lib/colorMode";

export default function App({ Component, pageProps }: AppProps) {
  useGoogleAnalytics();

  return (
    <ColorModeProvider>
      <Component {...pageProps} />
    </ColorModeProvider>
  );
}
