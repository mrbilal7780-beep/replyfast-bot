import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr" data-theme="dark">
      <Head>
        {/* Force le thème dark IMMÉDIATEMENT avant React - BLOQUE flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('replyfast_theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.classList.add(theme);
                  document.body.classList.add(theme);
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.classList.add('dark');
                }
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
      <body className="dark bg-dark">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
