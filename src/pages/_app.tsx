import "ress";
import "../styles/global.css";
import { AppProps } from "next/app";
import { GA_TRACKING_ID, useGoogleAnalytics } from "../lib/gtag";
import { ColorModeProvider } from "../lib/colorMode";
import Script from "next/script";

export default function App({ Component, pageProps }: AppProps) {
  useGoogleAnalytics();

  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', {
            page_path: window.location.pathname,
          });
        `,
        }}
      />
      <ColorModeProvider>
        <Component {...pageProps} />
      </ColorModeProvider>
    </>
  );
}
