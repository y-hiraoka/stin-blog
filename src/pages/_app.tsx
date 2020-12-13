import "../styles/ress.css";
import "../styles/global.css";
import { AppProps } from "next/app";
import { ThemeProvider } from "../components/themes";
import { Layout } from "../components/Layout";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}
