/* eslint-disable @typescript-eslint/no-var-requires */

import nextBundleAnalyzer from "@next/bundle-analyzer";
import { withContentlayer } from "./next-contentlayer.cjs";

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const config = withBundleAnalyzer(
  withContentlayer({
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "res.cloudinary.com",
          pathname: "/zenn/image/upload/**",
        },
      ],
    },
    experimental: {
      typedRoutes: true,
      staleTimes: {
        dynamic: 30,
      },
    },
  }),
);

export default config;
