import nextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const config = withBundleAnalyzer({
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
    staleTimes: {
      dynamic: 30,
    },
  },
});

export default config;
