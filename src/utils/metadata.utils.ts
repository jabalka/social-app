import { Metadata } from "next";
import { fullPath } from "./url.utils";


interface MetadataPayload {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  twitterHandle?: string;
  keywords?: string;
  canonical?: string;
}

export function generateMetadata({
  title = "STARCK - Join the Information Revolution.",
  description = "STARCK is an AI token based on the Binance Smart Chain/BEP20 blockchain that monitors and analyzes stock markets.",
  url = `https://${process.env.NEXT_PUBLIC_APP_URL}/`,
  image = `https://${process.env.NEXT_PUBLIC_APP_URL}/images/og-starck-logo.png`,
  twitterHandle = "@StarckCrypto",
  keywords = "AI Token, stock market, cryptocurrency, Binance Smart Chain, BEP20, real-time market data, fintech",
  canonical = fullPath("/"),
}: MetadataPayload = {}): Metadata {
  return {
    title,
    description,
    keywords,

    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: image,
          width: 373,
          height: 195,
          alt: "STARCK Logo",
        },
      ],
      siteName: "STARCK",
      locale: "en_US",
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      site: twitterHandle,
      creator: twitterHandle,
    },

    icons: {
      icon: [
        "/images/favicons/favicon-16x16.png",
        "/images/favicons/favicon-32x32.png",
        "/images/favicons/apple-touch-icon.png",
      ],
      shortcut: "/images/favicons/favicon.ico",
      apple: "/images/favicons/apple-touch-icon.png",
    },

    manifest: "/images/favicons/site.webmanifest",
    robots: "index, follow",
    alternates: {
      canonical,
    },

    metadataBase: new URL(`https://${process.env.NEXT_PUBLIC_APP_URL}/`),

    other: {
      "msapplication-TileColor": "#da532c",
      "msapplication-config": "/images/favicons/browserconfig.xml",
    },
  };
}
