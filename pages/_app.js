import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/globals.css';
import '../styles/calendar.css';

function MyApp({ Component, pageProps }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Charger le thème depuis localStorage ou par défaut dark
    const savedTheme = localStorage.getItem('replyfast_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    loadTheme();
    initializeFacebookSDK();
  }, []);

  const loadTheme = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.warn('⚠️ Erreur session:', sessionError);
        // Utiliser le thème local en cas d'erreur
        const savedTheme = localStorage.getItem('replyfast_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        setTheme(savedTheme);
        return;
      }

      if (session) {
        const { data: prefs, error: prefsError } = await supabase
          .from('user_preferences')
          .select('theme')
          .eq('user_email', session.user.email)
          .limit(1)
          .maybeSingle();

        if (prefsError) {
          console.warn('⚠️ Erreur user_preferences:', prefsError);
        }

        if (prefs?.theme) {
          setTheme(prefs.theme);
          document.documentElement.setAttribute('data-theme', prefs.theme);
          localStorage.setItem('replyfast_theme', prefs.theme);
        } else {
          // Par défaut, forcer le thème dark et le sauvegarder
          const defaultTheme = 'dark';
          document.documentElement.setAttribute('data-theme', defaultTheme);
          localStorage.setItem('replyfast_theme', defaultTheme);
        }
      } else {
        // Si pas de session, utiliser le thème sauvegardé ou dark par défaut
        const savedTheme = localStorage.getItem('replyfast_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('❌ Erreur loadTheme:', error);
      // Fallback en cas d'erreur inattendue
      const savedTheme = localStorage.getItem('replyfast_theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
      setTheme(savedTheme);
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

  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default MyApp;