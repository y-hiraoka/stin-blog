/* eslint-disable @typescript-eslint/no-var-requires */

import nextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const config = async () => {
  const { withContentlayer } = await import("./next-contentlayer.cjs");

  return withBundleAnalyzer(
    withContentlayer({
      pageExtensions: ["ts", "tsx", "md", "mdx"],
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
      },
    }),
  );
};

export default config;
