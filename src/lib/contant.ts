export const GA_TRACKING_ID =
  process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
    ? process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
    : undefined;
