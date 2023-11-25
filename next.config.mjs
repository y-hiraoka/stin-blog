// @ts-check

import nextBundleAnalyzer from "@next/bundle-analyzer";
import nextMDX from "@next/mdx";

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const withMDX = nextMDX();

export default withBundleAnalyzer(
  withMDX({
    pageExtensions: ["ts", "tsx", "md", "mdx"],
    images: {
      domains: ["www.google.com", "res.cloudinary.com"],
    },
    experimental: {
      typedRoutes: true,
    },
  }),
);
