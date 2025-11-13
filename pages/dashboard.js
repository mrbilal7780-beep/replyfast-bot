export default function Dashboard() {
  const stats = {
    todayMessages: 23,
    nightMessages: 12,
    timesSaved: '46 min',
    moneySaved: '19€',
    monthMessages: 487,
    monthHours: 16,
    monthMoney: '400€'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000 0%, #0A1128 100%)',
      color: '#fff',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ marginBottom: '30px', fontSize: '36px' }}>📊 Dashboard Client</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          padding: '30px',
          background: 'rgba(0,255,136,0.1)',
          borderRadius: '15px',
          border: '2px solid #00FF88'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>💬</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#00FF88' }}>{stats.todayMessages}</div>
          <div style={{ color: '#aaa' }}>Messages traités aujourd'hui</div>
        </div>
        
        <div style={{
          padding: '30px',
          background: 'rgba(255,215,0,0.1)',
          borderRadius: '15px',
          border: '2px solid #FFD700'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>⏰</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#FFD700' }}>{stats.timesSaved}</div>
          <div style={{ color: '#aaa' }}>Temps gagné</div>
        </div>
        
        <div style={{
          padding: '30px',
          background: 'rgba(255,109,0,0.1)',
          borderRadius: '15px',
          border: '2px solid #FF6D00'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>💰</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#FF6D00' }}>{stats.moneySaved}</div>
          <div style={{ color: '#aaa' }}>Économisé</div>
        </div>
      </div>
      
      <div style={{
        marginTop: '40px',
        padding: '30px',
        background: 'rgba(0,255,136,0.1)',
        borderRadius: '15px',
        border: '2px solid #00FF88'
      }}>
        <h2 style={{ color: '#00FF88', marginBottom: '20px', fontSize: '28px' }}>
          💤 Pendant que vous dormiez cette nuit
        </h2>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#FFD700', marginBottom: '15px' }}>
          {stats.nightMessages} messages traités
        </div>
        <p style={{ color: '#aaa', marginTop: '10px', fontSize: '18px' }}>
          Votre bot a répondu pendant votre sommeil. Zéro client perdu!
        </p>
      </div>

      <div style={{
        marginTop: '40px',
        padding: '30px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '15px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h2 style={{ color: '#FFD700', marginBottom: '20px', fontSize: '28px' }}>
          📈 Ce mois-ci
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '30px'
        }}>
          <div>
            <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px' }}>Messages traités</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#00FF88' }}>{stats.monthMessages}</div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px' }}>Heures gagnées</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#FFD700' }}>{stats.monthHours}h</div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px' }}>Économisé</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#FF6D00' }}>{stats.monthMoney}</div>
          </div>
        </div>

        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: 'rgba(0,255,136,0.1)',
          borderRadius: '10px',
          textAlign: 'center',
          border: '1px solid #00FF88'
        }}>
          <div style={{ fontSize: '16px', marginBottom: '10px' }}>
            ReplyFast vous coûte: <strong>19,99€</strong>
          </div>
          <div style={{ fontSize: '16px', marginBottom: '15px' }}>
            Vous rapporte: <strong style={{ color: '#00FF88' }}>~{stats.monthMoney}</strong>
          </div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#FFD700',
            padding: '15px',
            background: 'rgba(255,215,0,0.2)',
            borderRadius: '10px'
          }}>
            🔥 PROFIT NET: +380€ CE MOIS! 🔥
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '40px',
        textAlign: 'center'
      }}>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '15px 40px',
            background: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ← Retour accueil
        </button>
      </div>
    </div>
  );
}