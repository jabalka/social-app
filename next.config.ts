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
    ],
  },
  outputFileTracingExcludes: {
    "*": ["./.prisma/client/libquery_engine-debian*"],
  },
};

export default nextConfig;
