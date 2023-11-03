import { FC, ReactNode, Suspense } from "react";
import Script from "next/script";
import { GoogleAnalyticsScript } from "../lib/gtag";
import "modern-normalize/modern-normalize.css";
import "../styles/tokens.scss";
import "../styles/global.scss";
import { ColorModeAppliedHtml } from "../lib/colorMode";
import { Header } from "../components/shared/Header";
import { Footer } from "../components/shared/Footer";
import { GA_TRACKING_ID } from "../lib/contant";
import { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { config } from "../config";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "700"],
});

const notosansjp = Noto_Sans_JP({
  display: "swap",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto",
});

const RootLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ColorModeAppliedHtml>
      <head>
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
      <body className={`${inter.variable} ${notosansjp.variable}`}>
        <Header />
        <Suspense fallback={null}>{children}</Suspense>
        <Footer />
      </body>
    </ColorModeAppliedHtml>
  );
};

export default RootLayout;

export const metadata: Metadata = {
  title: {
    template: `%s | ${config.siteTitle}`,
    default: `Home | ${config.siteTitle}`,
  },
  description: "すてぃんの技術ブログ",
  twitter: {
    card: "summary_large_image",
    creator: `@${config.social.twitter}`,
  },
  openGraph: {
    type: "website",
    url: config.siteUrl,
    title: {
      template: `%s | ${config.siteTitle}`,
      default: `Home | ${config.siteTitle}`,
    },
    description: "すてぃんの技術ブログ",
    siteName: config.siteTitle,
  },
  metadataBase: new URL(config.siteUrl),
};
