import { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import { FC, ReactNode } from "react";
import "modern-normalize/modern-normalize.css";
import "@/styles/tokens.scss";
import "@/styles/global.scss";
import { Footer } from "@/components/shared/Footer";
import { GoogleAnalytics } from "@/components/shared/GoogleAnalytics";
import { Header } from "@/components/shared/Header";
import { Layout } from "@/components/shared/Layout";
import { Main } from "@/components/shared/Main";
import { SITE_DESCRIPTION, SITE_TITLE, metadataBase } from "@/constants";
import { ColorModeAppliedHtml } from "@/lib/colorMode";
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
    <ColorModeAppliedHtml>
      <head>
        <Script
          id="twitter-embed-script"
          src="https://platform.twitter.com/widgets.js"
          strategy="lazyOnload"
        />
        {GA_TRACKING_ID && <GoogleAnalytics trackingId={GA_TRACKING_ID} />}
      </head>
      <body className={`${inter.variable} ${notosansjp.variable}`}>
        <Layout>
          <Header />
          <Main>{children}</Main>
          <Footer />
        </Layout>
      </body>
    </ColorModeAppliedHtml>
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
