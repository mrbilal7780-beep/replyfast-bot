import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ErrorBoundary from '../components/ErrorBoundary';
import { LanguageProvider } from '../contexts/LanguageContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import NotificationToast from '../components/NotificationToast';
import '../styles/globals.css';
import '../styles/calendar.css';

function MyApp({ Component, pageProps }) {
  // Charger le thème IMMÉDIATEMENT depuis localStorage (avant tout render)
  const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('replyfast_theme') || 'dark';
    }
    return 'dark';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Appliquer le thème IMMÉDIATEMENT au montage (synchrone)
  useEffect(() => {
    const savedTheme = localStorage.getItem('replyfast_theme') || 'dark';

    // Appliquer TOUS les attributs pour garantir la cohérence
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.classList.remove('dark', 'light', 'cyber');
    document.documentElement.classList.add(savedTheme);
    document.body.classList.remove('dark', 'light', 'cyber');
    document.body.classList.add(savedTheme);

    setTheme(savedTheme);

    // Charger les préférences utilisateur depuis la DB (asynchrone)
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
      <LanguageProvider>
        <NotificationProvider>
          <NotificationToast />
          <Component {...pageProps} />
        </NotificationProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default MyApp;