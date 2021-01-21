import "../styles/ress.css";
import "../styles/global.css";
import { AppProps } from "next/app";
import { ThemeProvider } from "../organisms/themes";
import { Layout } from "../organisms/Layout";
import { useGoogleAnalytics } from "../lib/gtag";

export default function App({ Component, pageProps }: AppProps) {
  useGoogleAnalytics();

  return (
    <ThemeProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}
