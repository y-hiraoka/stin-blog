const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  reactStrictMode: true,
  images: {
    domains: ["www.google.com"],
  },
  experimental: {
    appDir: false,
    typedRoutes: true,
  },
};

module.exports = withMDX(nextConfig);
