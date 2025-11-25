import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Meta SDK pour WhatsApp Embedded Signup */}
        <script
          async
          defer
          crossOrigin="anonymous"
          src="https://connect.facebook.net/fr_FR/sdk.js"
        />

        {/* Préconnexion aux domaines externes pour optimisation */}
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
