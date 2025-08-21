import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "yypaxndddrycnlixcoey.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/projects-images/**",
      },
      {
        protocol: "https",
        hostname: "yypaxndddrycnlixcoey.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/profile-pictures/**",
      },
      {
        protocol: "https",
        hostname: "yypaxndddrycnlixcoey.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/report-images/**",
      },
    ],
  },
  outputFileTracingExcludes: {
    "*": ["./.prisma/client/libquery_engine-debian*"],
  },
};

export default nextConfig;
