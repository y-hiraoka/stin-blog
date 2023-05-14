import { FC, ReactNode, Suspense } from "react";
import Script from "next/script";
import { GoogleAnalyticsScript } from "../lib/gtag";
import "ress";
import "../styles/tokens.scss";
import "../styles/global.scss";
import { ColorModeAppliedHtml } from "../lib/colorMode";
import { Header } from "../components/shared/Header";
import { Footer } from "../components/shared/Footer";
import { GA_TRACKING_ID } from "../lib/contant";

const RootLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ColorModeAppliedHtml>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <Script
          id="twitter-embed-script"
          src="https://platform.twitter.com/widgets.js"
          strategy="lazyOnload"
        />
        <Script
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4010956213409647"
          crossOrigin="anonymous"
        />
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        />
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <Script
          id="gtag-init"
          strategy="beforeInteractive"
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
        <Suspense fallback={null}>
          <GoogleAnalyticsScript />
        </Suspense>
      </head>
      <body>
        <Header />
        <Suspense fallback={null}>{children}</Suspense>
        <Footer />
      </body>
    </ColorModeAppliedHtml>
  );
};

export default RootLayout;
