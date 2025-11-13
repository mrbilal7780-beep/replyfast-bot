export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A1128 0%, #1a2744 100%)',
      color: '#fff',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '64px',
          marginBottom: '20px',
          background: 'linear-gradient(90deg, #00FF88, #FFD700)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          🌙☀️ ReplyFast 24/7
        </h1>
        
        <p style={{ 
          fontSize: '28px', 
          color: '#00FF88', 
          marginBottom: '60px',
          fontWeight: '500'
        }}>
          Votre commerce ouvert 24/7<br/>
          Pendant que vous dormez, on travaille
        </p>
        
        <div style={{
          maxWidth: '700px',
          margin: '0 auto 60px',
          padding: '50px',
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '25px',
          border: '3px solid #00FF88',
          boxShadow: '0 20px 60px rgba(0,255,136,0.3)'
        }}>
          <h2 style={{ color: '#FFD700', fontSize: '32px', marginBottom: '30px' }}>
            💰 Vous perdez de l'argent chaque nuit
          </h2>
          
          <div style={{ fontSize: '20px', lineHeight: '1.8', marginBottom: '40px' }}>
            <p style={{ color: '#FF6D00', fontSize: '48px', fontWeight: 'bold', margin: '20px 0' }}>
              38.325€/an
            </p>
            <p style={{ color: '#aaa' }}>
              perdus à cause des messages non répondus la nuit
            </p>
          </div>
          
          <div style={{
            padding: '30px',
            background: 'rgba(0,255,136,0.15)',
            borderRadius: '20px',
            marginBottom: '40px',
            border: '2px solid #00FF88'
          }}>
            <div style={{ fontSize: '56px', fontWeight: 'bold', color: '#00FF88', marginBottom: '10px' }}>
              19,99€
            </div>
            <div style={{ fontSize: '18px', color: '#FFD700' }}>
              par mois
            </div>
            <div style={{ color: '#aaa', marginTop: '15px', fontSize: '16px' }}>
              0,66€/jour pour un employé parfait 24/7
            </div>
          </div>
          
          <button 
            onClick={() => window.location.href = '/login'}
            style={{
              padding: '25px 70px',
              fontSize: '24px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #00FF88, #FFD700)',
              border: 'none',
              borderRadius: '15px',
              color: '#000',
              cursor: 'pointer',
              boxShadow: '0 10px 40px rgba(0,255,136,0.4)'
            }}
          >
            🎁 ESSAI GRATUIT 14 JOURS
          </button>
          
          <p style={{ marginTop: '20px', fontSize: '14px', color: '#888' }}>
            Sans carte bancaire • Annulez quand vous voulez
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '80px'
        }}>
          {[
            { icon: '💤', title: 'Pendant que vous dormez', desc: 'Bot répond 24/7, même à 3h du matin' },
            { icon: '⏰', title: 'Gagnez 29h/mois', desc: 'Plus de questions répétitives 100x/jour' },
            { icon: '💰', title: '+30.660€/an', desc: 'Récupérez les clients perdus' }
          ].map((item, i) => (
            <div key={i} style={{
              padding: '40px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '20px',
              border: '2px solid rgba(0,255,136,0.2)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>{item.icon}</div>
              <h3 style={{ color: '#00FF88', fontSize: '24px', marginBottom: '15px' }}>{item.title}</h3>
              <p style={{ color: '#aaa', fontSize: '16px', lineHeight: '1.6' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}