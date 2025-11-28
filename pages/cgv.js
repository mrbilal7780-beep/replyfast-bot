import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { useRouter } from 'next/router';

export default function CGV() {
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
            <FileText className="w-12 h-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-white">Conditions Générales de Vente</h1>
              <p className="text-gray-400">Dernière mise à jour : 27 novembre 2025</p>
            </div>
          </div>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Objet</h2>
              <p>
                Les présentes Conditions Générales de Vente (CGV) régissent la fourniture du service ReplyFast AI,
                une plateforme SaaS d'automatisation de la relation client via intelligence artificielle et WhatsApp Business.
              </p>
              <p className="mt-2">
                En souscrivant à ReplyFast AI, vous acceptez sans réserve les présentes CGV.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Services fournis</h2>
              <p>ReplyFast AI propose :</p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Un assistant IA conversationnel connecté à WhatsApp Business</li>
                <li>Gestion de rendez-vous et calendrier intelligent</li>
                <li>Tableau de bord analytics et insights</li>
                <li>Gestion de base de données clients</li>
                <li>Support technique par email</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Tarification et paiement</h2>
              <p>
                <strong>Prix :</strong> 19,99€ HT/mois par utilisateur
              </p>
              <p className="mt-2">
                <strong>Période d'essai :</strong> 14 jours gratuits sans engagement. Aucun paiement n'est requis pendant la période d'essai.
              </p>
              <p className="mt-2">
                <strong>Facturation :</strong> Mensuelle, automatique par prélèvement via Stripe. La première facturation intervient
                à la fin de la période d'essai si vous ne résiliez pas.
              </p>
              <p className="mt-2">
                <strong>TVA :</strong> Le prix affiché est HT. La TVA applicable (21% en Belgique) sera ajoutée à la facturation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Durée et résiliation</h2>
              <p>
                <strong>Durée :</strong> L'abonnement est à durée indéterminée, renouvelable tacitement chaque mois.
              </p>
              <p className="mt-2">
                <strong>Résiliation :</strong> Vous pouvez résilier à tout moment depuis votre tableau de bord.
                La résiliation prend effet à la fin de la période de facturation en cours. Aucun remboursement
                au prorata n'est effectué.
              </p>
              <p className="mt-2">
                <strong>Période d'essai :</strong> Vous pouvez annuler gratuitement pendant les 14 premiers jours
                sans aucun frais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Obligations du client</h2>
              <p>Le client s'engage à :</p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Fournir des informations exactes lors de l'inscription</li>
                <li>Maintenir la confidentialité de ses identifiants de connexion</li>
                <li>Utiliser le service conformément aux lois en vigueur</li>
                <li>Ne pas utiliser le service pour du spam, harcèlement ou activités illégales</li>
                <li>Respecter les conditions d'utilisation de WhatsApp Business et Meta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Disponibilité du service</h2>
              <p>
                Nous nous efforçons de maintenir une disponibilité maximale du service, mais ne garantissons pas
                une disponibilité de 100%. Des interruptions peuvent survenir pour maintenance, mises à jour
                ou cas de force majeure.
              </p>
              <p className="mt-2">
                <strong>SLA :</strong> Nous visons une disponibilité de 99,5% sur base mensuelle (hors maintenance programmée).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Propriété intellectuelle</h2>
              <p>
                ReplyFast AI, son code source, design et marques sont la propriété exclusive de leurs créateurs.
                L'abonnement vous octroie un droit d'utilisation non-exclusif et non-cessible du service.
              </p>
              <p className="mt-2">
                <strong>Vos données :</strong> Vous conservez tous les droits sur vos données clients et conversations.
                Nous ne revendiquons aucun droit sur votre contenu.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Limitation de responsabilité</h2>
              <p>
                ReplyFast AI est fourni "tel quel". Nous ne pouvons être tenus responsables :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Des dommages indirects ou pertes de chiffre d'affaires</li>
                <li>Des erreurs de l'IA (les réponses doivent être supervisées par le client)</li>
                <li>Des interruptions de service de nos partenaires (Meta, OpenAI, Supabase)</li>
                <li>De l'utilisation inappropriée du service par le client</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Données personnelles</h2>
              <p>
                Le traitement de vos données personnelles est détaillé dans notre{' '}
                <a href="/privacy" className="text-primary hover:underline">Politique de Confidentialité</a>.
                Nous sommes conformes au RGPD.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Modifications des CGV</h2>
              <p>
                Nous nous réservons le droit de modifier ces CGV à tout moment. Les modifications seront
                communiquées par email 30 jours avant leur entrée en vigueur. La poursuite de l'utilisation
                du service vaut acceptation des nouvelles CGV.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Droit applicable et litiges</h2>
              <p>
                Les présentes CGV sont régies par le droit belge. En cas de litige, une solution amiable
                sera recherchée en priorité. À défaut, les tribunaux de Bruxelles seront compétents.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact</h2>
              <p>
                Pour toute question concernant ces CGV :<br />
                Email : <a href="mailto:support@replyfast.ai" className="text-primary hover:underline">support@replyfast.ai</a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
