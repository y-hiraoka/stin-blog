import "ress";
import "../styles/tokens.scss";
import "../styles/global.scss";
import { AppProps } from "next/app";
import { Header } from "../components/shared/Header";
import { Footer } from "../components/shared/Footer";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </div>
  );
}
