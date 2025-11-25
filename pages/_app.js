import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../styles/globals.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function MyApp({ Component, pageProps }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    loadTheme();
    initializeFacebookSDK();
  }, []);

  const loadTheme = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('theme')
        .eq('user_email', session.user.email)
        .single();

      if (prefs?.theme) {
        setTheme(prefs.theme);
        document.documentElement.setAttribute('data-theme', prefs.theme);
      }
    }
  };

  const initializeFacebookSDK = () => {
    // Initialiser le SDK Facebook pour WhatsApp Embedded Signup
    if (typeof window !== 'undefined') {
      window.fbAsyncInit = function() {
        if (window.FB) {
          window.FB.init({
            appId: process.env.NEXT_PUBLIC_META_APP_ID || 'YOUR_META_APP_ID',
            cookie: true,
            xfbml: true,
            version: 'v18.0'
          });
        }
      };
    }
  };

  return <Component {...pageProps} />;
}

export default MyApp;