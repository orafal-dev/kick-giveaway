import type { ReactNode } from "react";
import { OpenPanelComponent } from "@openpanel/nextjs";
import Script from "next/script";
import { siteMetadata, siteViewport } from "@/app/metadata";
import { ThemeProvider } from "@/components/theme-provider";
import { openpanelConfig } from "@/config/openpanel";
import { SITE_NAME, SITE_URL } from "@/config/site";
import "./globals.css";

export const metadata = siteMetadata;
export const viewport = siteViewport;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description:
        "Free Kick.com giveaway tool for streamers — connect your channel, collect chat entrants, and draw winners live.",
      inLanguage: "en",
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "Run live chat giveaways on Kick.com. Connect a Kick channel, collect entrants from chat, draw winners with wheel or slot animations, and support multiple winners.",
      featureList: [
        "Kick.com channel connection",
        "Live chat entrant collection",
        "Wheel and slot draw animations",
        "Multiple winner support",
        "Winner confirmation countdown",
        "No account signup required",
      ],
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
  ],
};

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <noscript>
          <main
            style={{
              maxWidth: "36rem",
              margin: "2rem auto",
              padding: "1rem",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            <h1>kickaway.win — Free Kick.com Giveaway Tool</h1>
            <p>
              Run live chat giveaways on Kick.com for free. Connect your channel,
              collect entrants from chat, and draw winners with a wheel or slot
              animation. JavaScript is required to use the app.
            </p>
          </main>
        </noscript>
        {openpanelConfig.enabled ? (
          <OpenPanelComponent
            clientId={openpanelConfig.clientId}
            apiUrl={openpanelConfig.proxyPath}
            scriptUrl={openpanelConfig.scriptUrl}
            trackScreenViews
          />
        ) : null}
        <ThemeProvider>{children}</ThemeProvider>
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </body>
    </html>
  );
};

export default RootLayout;
