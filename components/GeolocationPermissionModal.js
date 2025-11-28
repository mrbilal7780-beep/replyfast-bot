import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Shield, X, Check, AlertTriangle } from 'lucide-react';
import { requestGeolocationPermission } from '../lib/geolocation';

export default function GeolocationPermissionModal({ isOpen, onClose, onGranted, onDenied }) {
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleAccept = async () => {
    setLoading(true);

    const result = await requestGeolocationPermission({
      highAccuracy: true,
      timeout: 15000
    });

    setLoading(false);

    if (result.success) {
      if (onGranted) onGranted(result.position);
      onClose();
    } else {
      if (onDenied) onDenied(result.error);
      onClose();
    }
  };

  const handleDecline = () => {
    if (onDenied) onDenied('User declined permission');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass max-w-lg w-full p-6 md:p-8 rounded-3xl relative max-h-[90vh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
              Autorisation de géolocalisation
            </h2>

            {/* Subtitle */}
            <p className="text-gray-300 text-center mb-6">
              ReplyFast AI demande l'accès à votre position pour activer des fonctionnalités avancées
            </p>

            {/* Benefits */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Statistiques de distance</p>
                  <p className="text-gray-400 text-sm">Calculez la distance entre votre commerce et vos clients</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Zones de vente</p>
                  <p className="text-gray-400 text-sm">Visualisez vos zones géographiques de clientèle</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Analytics avancées</p>
                  <p className="text-gray-400 text-sm">Optimisez votre stratégie marketing par zone</p>
                </div>
              </div>
            </div>

            {/* Privacy notice */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-500 font-semibold mb-1">Vos données sont protégées</p>
                  <ul className="text-yellow-500/90 text-sm space-y-1">
                    <li>✓ Données chiffrées de bout en bout</li>
                    <li>✓ Jamais partagées avec des tiers</li>
                    <li>✓ Conformité RGPD garantie</li>
                    <li>✓ Vous pouvez révoquer à tout moment</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Details toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-primary hover:text-accent transition-colors text-sm mb-4 text-center"
            >
              {showDetails ? '▼ Masquer les détails' : '▶ Voir les détails techniques'}
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="glass p-4 rounded-xl space-y-2 text-sm">
                    <p className="text-gray-300">
                      <strong className="text-white">Données collectées :</strong> Latitude, longitude, précision
                    </p>
                    <p className="text-gray-300">
                      <strong className="text-white">Stockage :</strong> Base de données chiffrée Supabase
                    </p>
                    <p className="text-gray-300">
                      <strong className="text-white">Usage :</strong> Calculs statistiques uniquement
                    </p>
                    <p className="text-gray-300">
                      <strong className="text-white">Rétention :</strong> Données supprimées à la demande
                    </p>
                    <p className="text-gray-300">
                      <strong className="text-white">Droits RGPD :</strong> Accès, rectification, suppression, portabilité
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDecline}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                Refuser
              </button>

              <button
                onClick={handleAccept}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Vérification...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5" />
                    <span>Autoriser</span>
                  </>
                )}
              </button>
            </div>

            {/* Legal notice */}
            <p className="text-gray-500 text-xs text-center mt-4">
              En autorisant, vous acceptez notre{' '}
              <button
                onClick={() => window.open('/privacy#geolocation', '_blank')}
                className="text-primary hover:text-accent underline"
              >
                politique de confidentialité
              </button>
              {' '}concernant la géolocalisation.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
