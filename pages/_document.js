import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Force le thème dark IMMÉDIATEMENT avant React */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('replyfast_theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />

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
      <body className="dark">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
