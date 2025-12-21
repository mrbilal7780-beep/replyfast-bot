import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { Smartphone, QrCode, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import Image from 'next/image'

export default function WahaSetup({ session }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState(null)
  const [status, setStatus] = useState('disconnected') // disconnected, connecting, connected
  const [error, setError] = useState('')
  const [sessionName, setSessionName] = useState('')

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }
    
    // Générer un nom de session unique basé sur l'email
    const uniqueSession = `waha_${session.user.email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`
    setSessionName(uniqueSession)
  }, [session])

  const startWahaSession = async () => {
    setLoading(true)
    setError('')

    try {
      // Démarrer la session WAHA
      const response = await fetch('/api/waha/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionName,
          email: session.user.email
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du démarrage de la session')
      }

      setStatus('connecting')
      
      // Récupérer le QR code
      await fetchQRCode()
      
      // Vérifier le statut toutes les 3 secondes
      const interval = setInterval(async () => {
        const statusResponse = await fetch(`/api/waha/check-status?session=${sessionName}`)
        const statusData = await statusResponse.json()

        if (statusData.status === 'WORKING') {
          clearInterval(interval)
          setStatus('connected')
          
          // Sauvegarder dans Supabase
          await supabase
            .from('clients')
            .update({
              whatsapp_connected: true,
              waha_session_name: sessionName,
              profile_completed: true
            })
            .eq('email', session.user.email)

          // Rediriger vers le dashboard après 2 secondes
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else if (statusData.status === 'FAILED') {
          clearInterval(interval)
          setError('Échec de la connexion. Veuillez réessayer.')
          setStatus('disconnected')
        }
      }, 3000)

      // Arrêter la vérification après 5 minutes
      setTimeout(() => {
        clearInterval(interval)
        if (status === 'connecting') {
          setError('Délai d\'attente dépassé. Veuillez réessayer.')
          setStatus('disconnected')
        }
      }, 300000)

    } catch (err) {
      console.error('Erreur WAHA:', err)
      setError(err.message || 'Erreur lors de la connexion à WAHA')
      setStatus('disconnected')
    } finally {
      setLoading(false)
    }
  }

  const fetchQRCode = async () => {
    try {
      const response = await fetch(`/api/waha/get-qr?session=${sessionName}`)
      const data = await response.json()

      if (data.qr) {
        setQrCode(data.qr)
      }
    } catch (err) {
      console.error('Erreur récupération QR:', err)
    }
  }

  const skipForNow = async () => {
    // Marquer comme complété mais sans WhatsApp
    await supabase
      .from('clients')
      .update({
        profile_completed: true,
        whatsapp_connected: false
      })
      .eq('email', session.user.email)

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 shadow-lg">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Connecter WhatsApp Business
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Scannez le QR code avec votre application WhatsApp Business
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* État déconnecté */}
          {status === 'disconnected' && (
            <div className="text-center space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  📱 Instructions
                </h3>
                <ol className="text-left text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>1. Ouvrez WhatsApp Business sur votre téléphone</li>
                  <li>2. Allez dans Paramètres → Appareils connectés</li>
                  <li>3. Appuyez sur "Connecter un appareil"</li>
                  <li>4. Scannez le QR code qui apparaîtra ci-dessous</li>
                </ol>
              </div>

              <button
                onClick={startWahaSession}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Préparation...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Générer le QR Code
                  </span>
                )}
              </button>

              <button
                onClick={skipForNow}
                className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium py-2"
              >
                Passer cette étape (configurer plus tard)
              </button>
            </div>
          )}

          {/* État en connexion */}
          {status === 'connecting' && (
            <div className="text-center space-y-6">
              {qrCode ? (
                <div className="bg-white p-6 rounded-xl border-4 border-green-500 inline-block">
                  <img 
                    src={qrCode} 
                    alt="QR Code WhatsApp" 
                    className="w-64 h-64 mx-auto"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Génération du QR code...
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  ⏳ En attente de scan... Scannez le QR code avec WhatsApp Business
                </p>
              </div>

              <button
                onClick={() => {
                  setStatus('disconnected')
                  setQrCode(null)
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
              >
                Annuler
              </button>
            </div>
          )}

          {/* État connecté */}
          {status === 'connected' && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  WhatsApp connecté avec succès ! 🎉
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Votre bot est maintenant prêt à répondre automatiquement à vos clients
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Redirection vers le tableau de bord...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info supplémentaire */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            🔒 Votre connexion est sécurisée et chiffrée de bout en bout
          </p>
        </div>
      </div>
    </div>
  )
}
