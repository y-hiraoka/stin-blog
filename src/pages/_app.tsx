import "../styles/ress.css";
import "../styles/global.css";
import { AppProps } from "next/app";
import { ThemeProvider } from "../components/themes";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
