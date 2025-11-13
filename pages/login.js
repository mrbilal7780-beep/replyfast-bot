import React, { useState } from 'react';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    phone: '',
    sector: 'horeca'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    if (mode === 'login') {
      alert('✅ Connexion réussie! Redirection vers dashboard...');
      window.location.href = '/dashboard';
    } else {
      alert(`✅ Inscription réussie ${formData.businessName}! Essai 14j activé!`);
      window.location.href = '/dashboard';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #0A1128 50%, #1a2744 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: 'rgba(10,17,40,0.8)',
        borderRadius: '20px',
        padding: '40px',
        border: '2px solid rgba(0,255,136,0.3)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '42px',
            margin: '0 0 10px 0',
            background: 'linear-gradient(90deg, #00FF88 0%, #FFD700 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            🌙☀️ ReplyFast
          </h1>
          <p style={{ color: '#00FF88', margin: 0 }}>Votre commerce ouvert 24/7</p>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          background: 'rgba(0,0,0,0.3)',
          padding: '5px',
          borderRadius: '10px'
        }}>
          <button
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '12px',
              background: mode === 'login' ? 'linear-gradient(90deg, #00FF88 0%, #FFD700 100%)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: mode === 'login' ? '#000' : '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Connexion
          </button>
          <button
            onClick={() => setMode('signup')}
            style={{
              flex: 1,
              padding: '12px',
              background: mode === 'signup' ? 'linear-gradient(90deg, #00FF88 0%, #FFD700 100%)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: mode === 'signup' ? '#000' : '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Inscription
          </button>
        </div>

        <div>
          {mode === 'signup' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>
                  Nom du commerce *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Ex: Garage Dubois"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>
                  Secteur *
                </label>
                <select
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="horeca">🍽️ Horeca</option>
                  <option value="beaute">💇 Beauté</option>
                  <option value="garage">🔧 Garage</option>
                  <option value="medical">🏥 Médical</option>
                  <option value="retail">🏪 Retail</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>
                  Téléphone WhatsApp *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+32 477 12 34 56"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              style={{
                width: '100%',
                padding: '12px 15px',
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>
              Mot de passe *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 15px',
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px'
              }}
            />
          </div>

          {mode === 'signup' && (
            <div style={{
              padding: '15px',
              background: 'rgba(0,255,136,0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(0,255,136,0.3)',
              marginBottom: '25px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#00FF88' }}>
                🎁 <strong>14 jours gratuits</strong> • Sans carte bancaire
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            style={{
              width: '100%',
              padding: '15px',
              background: 'linear-gradient(90deg, #00FF88 0%, #FFD700 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            {mode === 'login' ? '🔓 Se connecter' : '🚀 Démarrer essai gratuit'}
          </button>
        </div>

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
          {mode === 'login' ? (
            <p>
              Pas de compte?{' '}
              <span
                onClick={() => setMode('signup')}
                style={{ color: '#00FF88', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Inscrivez-vous
              </span>
            </p>
          ) : (
            <p>
              Déjà un compte?{' '}
              <span
                onClick={() => setMode('login')}
                style={{ color: '#00FF88', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Connectez-vous
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}