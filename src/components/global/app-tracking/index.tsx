"use client";

import Script from "next/script";

export const AppTracking = () => {
  return (
    <>
      <Script src="https://tracker.302.ai/index.js" />
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-V62NZ36GMW"
      />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-V62NZ36GMW');
        `}
      </Script>
    </>
  );
};
