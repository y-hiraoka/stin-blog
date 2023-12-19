"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { FC, Suspense, useEffect, useId } from "react";

export const GoogleAnalytics: FC<{ trackingId: string }> = ({ trackingId }) => {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsInner trackingId={trackingId} />
    </Suspense>
  );
};

const GoogleAnalyticsInner: FC<{ trackingId: string }> = ({ trackingId }) => {
  const scriptId = useId();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const path = pathname ?? "";
    const qs = searchParams?.toString();

    const url = qs ? `${path}?${qs}` : path;

    pageview(trackingId, url);
  }, [pathname, searchParams, trackingId]);

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`} />
      <Script id={scriptId + "google-analytics"}>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', '${trackingId}');
        `}
      </Script>
    </>
  );
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
const pageview = (trackingId: string, url: string) => {
  window.gtag("config", trackingId, {
    page_path: url,
  });
};
