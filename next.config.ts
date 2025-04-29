/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  outputFileTracingExcludes: {
    "*": ["./.prisma/client/libquery_engine-debian*"],
  },
};

export default nextConfig;
