"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

const FROM_ENV = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

export const GA_TRACKING_ID =
  process.env.NODE_ENV === "production" && FROM_ENV ? FROM_ENV : undefined;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
const pageview = (url: string) => {
  if (!GA_TRACKING_ID) return;
  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

type GTagEvent = {
  action: string;
  category: string;
  label: string;
  value: number;
};

export const useGoogleAnalytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    const path = pathname ?? "";
    const qs = searchParams?.toString();

    const url = qs ? `${path}?${qs}` : path;

    pageview(url);
  }, [pathname, searchParams]);
};

export const GoogleAnalyticsScript: React.FC = () => {
  useGoogleAnalytics();

  if (!GA_TRACKING_ID) return null;

  return (
    <>
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
    </>
  );
};
