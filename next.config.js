/* eslint-disable @typescript-eslint/no-var-requires */

const nextBundleAnalyzer = require("@next/bundle-analyzer")
const  { withContentlayer } = require("next-contentlayer")



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
          hostname: "www.google.com",
        },
        {
          protocol: "https",
          hostname: "res.cloudinary.com",
        },
      ],
    },
    experimental: {
      typedRoutes: true,
    },
  }),
);
