import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/router';

export default function Privacy() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="fixed inset-0 gradient-bg opacity-10"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-3xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <Shield className="w-12 h-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-white">Politique de Confidentialité</h1>
              <p className="text-gray-400">Dernière mise à jour : 26 novembre 2025</p>
            </div>
          </div>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Collecte des données</h2>
              <p>
                ReplyFast AI collecte uniquement les données nécessaires au fonctionnement du service :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Informations d'identification (email, nom, prénom)</li>
                <li>Informations professionnelles (nom d'entreprise, secteur d'activité, horaires)</li>
                <li>Données de conversation WhatsApp (pour le bot IA)</li>
                <li>Données de rendez-vous et clients</li>
                <li>Informations de paiement (via Stripe - nous ne stockons pas vos données bancaires)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Utilisation des données</h2>
              <p>Vos données sont utilisées pour :</p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Fournir et améliorer le service ReplyFast AI</li>
                <li>Personnaliser les réponses du bot IA en fonction de votre secteur</li>
                <li>Gérer vos rendez-vous et conversations clients</li>
                <li>Générer des analytics et insights business</li>
                <li>Traiter vos paiements via Stripe</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Partage des données</h2>
              <p>
                Nous ne vendons JAMAIS vos données à des tiers. Vos données ne sont partagées qu'avec :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li><strong>Supabase</strong> : hébergement sécurisé de la base de données</li>
                <li><strong>OpenAI</strong> : traitement IA des conversations (GPT-4o-mini)</li>
                <li><strong>Meta/WhatsApp</strong> : envoi et réception de messages WhatsApp Business</li>
                <li><strong>Stripe</strong> : traitement sécurisé des paiements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Sécurité</h2>
              <p>
                Vos données sont protégées par cryptage SSL/TLS. Nous utilisons des services cloud conformes
                RGPD (Supabase en Europe) et des pratiques de sécurité de niveau bancaire.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Vos droits (RGPD)</h2>
              <p>Conformément au RGPD, vous avez le droit de :</p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li><strong>Accéder</strong> à vos données personnelles</li>
                <li><strong>Rectifier</strong> vos données inexactes</li>
                <li><strong>Supprimer</strong> vos données (droit à l'oubli)</li>
                <li><strong>Exporter</strong> vos données (portabilité)</li>
                <li><strong>Vous opposer</strong> au traitement de vos données</li>
              </ul>
              <p className="mt-4">
                Pour exercer ces droits, contactez-nous à : <a href="mailto:privacy@replyfast.ai" className="text-primary hover:underline">privacy@replyfast.ai</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Cookies</h2>
              <p>
                Nous utilisons des cookies essentiels pour le fonctionnement du site (authentification, préférences).
                Aucun cookie de tracking ou publicitaire n'est utilisé.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Conservation des données</h2>
              <p>
                Vos données sont conservées tant que votre compte est actif. En cas de résiliation,
                vos données sont supprimées sous 30 jours (sauf obligations légales de conservation comptable).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Contact</h2>
              <p>
                Pour toute question concernant vos données personnelles :<br />
                Email : <a href="mailto:privacy@replyfast.ai" className="text-primary hover:underline">privacy@replyfast.ai</a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
