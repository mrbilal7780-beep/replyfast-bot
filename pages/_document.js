import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr" data-theme="dark">
      <Head>
        {/* Force le thème IMMÉDIATEMENT avant React - BLOQUE flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('replyfast_theme') || 'dark';
                  var html = document.documentElement;

                  // Appliquer le thème sur html ET body
                  html.setAttribute('data-theme', theme);
                  html.classList.remove('dark', 'light');
                  html.classList.add(theme);

                  // Appliquer background-color immédiatement pour éviter le flash blanc
                  html.style.backgroundColor = theme === 'dark' ? '#0a0a0a' : '#ffffff';
                  html.style.color = theme === 'dark' ? '#ffffff' : '#000000';
                } catch (e) {
                  // Fallback sécurisé
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.backgroundColor = '#0a0a0a';
                  document.documentElement.style.color = '#ffffff';
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
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
