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

  return <Component {...pageProps} />;
}

export default MyApp;