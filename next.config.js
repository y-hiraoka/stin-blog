/* eslint-disable @typescript-eslint/no-var-requires */

const nextBundleAnalyzer = require("@next/bundle-analyzer");
const { withContentlayer } = require("next-contentlayer");

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(
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
