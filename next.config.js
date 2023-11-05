const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  reactStrictMode: true,
  images: {
    domains: ["www.google.com", "res.cloudinary.com"],
  },
  experimental: {
    typedRoutes: true,
  },
};

module.exports = withBundleAnalyzer(nextConfig);
