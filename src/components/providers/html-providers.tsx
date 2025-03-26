import { Poppins } from "next/font/google";
import React, { PropsWithChildren } from "react";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const HtmlProviders: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="mask-icon" href="/images/favicons/safari-pinned-tab.svg" color="#5bbad5" />
      </head>
      <body className={`${poppins.className} antialiased`}>{children}</body>
    </html>
  );
};

export default HtmlProviders;
