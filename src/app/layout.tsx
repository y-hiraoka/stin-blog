import { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import { FC, ReactNode, Suspense } from "react";
import "modern-normalize/modern-normalize.css";
import "@/styles/tokens.scss";
import "@/styles/global.scss";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { Layout } from "@/components/shared/Layout";
import { Main } from "@/components/shared/Main";
import { config } from "@/config";
import { ColorModeAppliedHtml } from "@/lib/colorMode";
import { GA_TRACKING_ID } from "@/lib/contant";
import { GoogleAnalyticsScript } from "@/lib/gtag";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
});

const notosansjp = Noto_Sans_JP({
  display: "swap",
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
        <Suspense fallback={null}>
          <Layout>
            <Header />
            <Main>{children}</Main>
            <Footer />
          </Layout>
        </Suspense>
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
    card: "summary",
    creator: `@${config.social.twitter}`,
  },
  openGraph: {
    type: "website",
    url: "/",
    title: {
      template: `%s | ${config.siteTitle}`,
      default: `Home | ${config.siteTitle}`,
    },
    description: "すてぃんの技術ブログ",
    siteName: config.siteTitle,
  },
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : process.env.VERCEL_URL
      ? new URL(`https://${process.env.VERCEL_URL}`)
      : new URL(`http://localhost:${process.env.PORT || 3000}`),
};
