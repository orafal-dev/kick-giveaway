import type { Metadata, Viewport } from "next";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_TITLE,
  SITE_URL,
} from "@/config/site";

export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: SITE_TITLE,
    description:
      "Run live chat giveaways on Kick.com for free. Connect your channel, collect entrants from chat, and draw winners live — no signup required.",
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "kickaway.win — Free Kick.com Giveaway Tool",
    description:
      "Free Kick.com chat giveaway tool for streamers. Connect your channel and draw winners live.",
    images: [SITE_OG_IMAGE],
  },
};

export const siteViewport: Viewport = {
  themeColor: "#54FC17",
};
