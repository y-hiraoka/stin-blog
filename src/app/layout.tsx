import { GoogleAnalytics } from "@next/third-parties/google";
import { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import { FC, ReactNode } from "react";
import "modern-normalize/modern-normalize.css";
import "@/styles/tokens.scss";
import "@/styles/global.scss";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { Layout } from "@/components/shared/Layout";
import { Main } from "@/components/shared/Main";
import { SITE_DESCRIPTION, SITE_TITLE, metadataBase } from "@/constants";
import { ColorModeProvider } from "@/lib/colorMode";
import { GA_TRACKING_ID } from "@/lib/contant";

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
    <html suppressHydrationWarning lang="ja">
      <head>
        {/*
          TypeScript Playground: https://www.typescriptlang.org/play/?target=2#code/BQMwrgdgxgLglgewgAmASmQbwFDOVJAZxmQAcAnAUxEvMOQF5kB3OCAEwWYDoBbAQxhQAFgFlK7OP2AAiYBWq1CAWgIAbBOWWERlXpQBcydv3IBrNDLR9BuwrjzIA-MhknzMh3iMy1cAObCMDIA3A4EEMTIIOQIvADKMJr8-pSMyBpQ-GqJyancqTAAkjB6ssRsygBGGv6qCBpavAjslFZheBFR6pqiLYaufoHByAA+ru5mMoxeqDFxueQpaQyrroQAnsR606Pj8wlJS6mMTBBgamoYLgo0dMhGB4vLp0y+AUHTLu-D0z6ToQcrA4XG4nCgYH0EBgYIQEKhMAAomo9JRoWDBPxCJQYT1yH1Wuk8QTKGEAL5odAhIA
          Terser REPL: https://try.terser.org/
       */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){const e=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light",o=localStorage.getItem("stin-blog-color-mode"),t="system"===o||null==o?e:"light"===o?"light":"dark";window.document.documentElement.dataset.colorMode=t}();`,
          }}
        />
        <Script
          id="twitter-embed-script"
          src="https://platform.twitter.com/widgets.js"
          strategy="lazyOnload"
        />
        {GA_TRACKING_ID && <GoogleAnalytics gaId={GA_TRACKING_ID} />}
      </head>
      <body className={`${inter.variable} ${notosansjp.variable}`}>
        <ColorModeProvider>
          <Layout>
            <Header />
            <Main>{children}</Main>
            <Footer />
          </Layout>
        </ColorModeProvider>
      </body>
    </html>
  );
};

export default RootLayout;

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_TITLE}`,
    default: `Home | ${SITE_TITLE}`,
  },
  description: SITE_DESCRIPTION,
  twitter: {
    card: "summary",
    creator: `@stin_factory`,
  },
  openGraph: {
    type: "website",
    url: "/",
    title: {
      template: `%s | ${SITE_TITLE}`,
      default: `Home | ${SITE_TITLE}`,
    },
    description: SITE_DESCRIPTION,
    siteName: SITE_TITLE,
  },
  metadataBase: metadataBase,
};
