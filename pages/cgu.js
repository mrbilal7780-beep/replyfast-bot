import Link from 'next/link'
import { ArrowLeft, FileText, Scale, AlertCircle } from 'lucide-react'

export default function CGU() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-indigo-900/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-xl border-b border-gray-800/50 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <ArrowLeft className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              ReplyFast AI
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
              <Scale className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-semibold">Documents légaux</span>
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-gray-400">
              Dernière mise à jour : 22 décembre 2024
            </p>
          </div>

          {/* Legal Content */}
          <div className="prose prose-invert prose-purple max-w-none">
            {/* Section 1 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6 text-purple-400" />
                1. Objet et Acceptation
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Les présentes Conditions Générales d'Utilisation (ci-après "CGU") régissent l'utilisation de la plateforme ReplyFast AI (ci-après "la Plateforme"), éditée par ReplyFast AI, société par actions simplifiée au capital de 10 000 euros, immatriculée au Registre du Commerce et des Sociétés sous le numéro XXX XXX XXX, dont le siège social est situé à Paris, France.
                </p>
                <p>
                  L'utilisation de la Plateforme implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser la Plateforme.
                </p>
                <p>
                  ReplyFast AI se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification par email et/ou notification sur la Plateforme. L'utilisation continue de la Plateforme après modification vaut acceptation des nouvelles CGU.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">2. Description du Service</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  ReplyFast AI est une plateforme SaaS (Software as a Service) qui permet aux entreprises et professionnels d'automatiser leurs réponses WhatsApp grâce à l'intelligence artificielle. Le service comprend notamment :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Un assistant conversationnel intelligent basé sur GPT-4o-mini</li>
                  <li>La connexion sécurisée à WhatsApp via WAHA (WhatsApp HTTP API)</li>
                  <li>Un système de gestion de rendez-vous automatisé</li>
                  <li>Un tableau de bord de gestion des conversations en temps réel</li>
                  <li>Des outils d'analyse et de statistiques</li>
                  <li>Un gestionnaire de menu produits/services</li>
                  <li>Des notifications en temps réel</li>
                </ul>
                <p>
                  ReplyFast AI s'engage à fournir un service de qualité mais ne garantit pas une disponibilité de 100%. Des interruptions peuvent survenir pour maintenance, mise à jour ou cas de force majeure.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">3. Inscription et Compte Utilisateur</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong>3.1 Conditions d'inscription :</strong> Pour utiliser ReplyFast AI, vous devez créer un compte en fournissant des informations exactes, complètes et à jour. Vous devez être majeur et avoir la capacité juridique de contracter.
                </p>
                <p>
                  <strong>3.2 Sécurité du compte :</strong> Vous êtes responsable de la confidentialité de vos identifiants de connexion. Toute activité effectuée depuis votre compte est présumée avoir été effectuée par vous. En cas de suspicion d'utilisation non autorisée, vous devez immédiatement nous en informer à support@replyfast.ai.
                </p>
                <p>
                  <strong>3.3 Vérification de l'email :</strong> Un email de confirmation sera envoyé à l'adresse fournie lors de l'inscription. Vous devez valider votre email pour activer pleinement votre compte.
                </p>
                <p>
                  <strong>3.4 Suspension ou résiliation :</strong> ReplyFast AI se réserve le droit de suspendre ou résilier votre compte en cas de violation des présentes CGU, d'utilisation frauduleuse, ou de non-paiement.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">4. Tarifs et Paiement</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong>4.1 Tarification :</strong> ReplyFast AI propose un abonnement mensuel au tarif de 19,99€ TTC par mois. Ce tarif inclut l'accès à toutes les fonctionnalités de la Plateforme sans limitation de conversations ou de rendez-vous.
                </p>
                <p>
                  <strong>4.2 Essai gratuit :</strong> Un essai gratuit de 30 jours est offert aux nouveaux utilisateurs. Aucune carte bancaire n'est requise pendant la période d'essai. À l'issue de cette période, l'abonnement payant débutera automatiquement sauf annulation.
                </p>
                <p>
                  <strong>4.3 Modalités de paiement :</strong> Les paiements sont traités de manière sécurisée par Stripe. Vous pouvez payer par carte bancaire (Visa, Mastercard, American Express). L'abonnement est renouvelé automatiquement chaque mois à la date anniversaire de souscription.
                </p>
                <p>
                  <strong>4.4 Facturation :</strong> Une facture est émise automatiquement après chaque paiement et envoyée par email. Vous pouvez également télécharger vos factures depuis votre tableau de bord.
                </p>
                <p>
                  <strong>4.5 Modification des tarifs :</strong> ReplyFast AI se réserve le droit de modifier ses tarifs à tout moment. Les utilisateurs existants seront informés au moins 30 jours avant l'application du nouveau tarif. En cas de désaccord, vous pouvez résilier votre abonnement avant l'entrée en vigueur du nouveau tarif.
                </p>
                <p>
                  <strong>4.6 Retard de paiement :</strong> En cas de défaut de paiement, votre accès à la Plateforme sera suspendu jusqu'à régularisation. Après 15 jours sans régularisation, votre compte pourra être définitivement supprimé.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">5. Droit de Rétractation et Résiliation</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong>5.1 Droit de rétractation :</strong> Conformément à l'article L221-18 du Code de la consommation, vous disposez d'un délai de 14 jours à compter de la souscription pour exercer votre droit de rétractation sans avoir à justifier de motifs ni à payer de pénalités.
                </p>
                <p>
                  <strong>5.2 Résiliation par l'utilisateur :</strong> Vous pouvez résilier votre abonnement à tout moment depuis votre tableau de bord (Paramètres > Abonnement > Annuler l'abonnement). La résiliation prend effet à la fin de la période de facturation en cours. Aucun remboursement au prorata ne sera effectué.
                </p>
                <p>
                  <strong>5.3 Résiliation par ReplyFast AI :</strong> ReplyFast AI peut résilier votre abonnement en cas de violation des CGU, d'utilisation frauduleuse, ou de non-paiement, après notification par email et délai de régularisation de 7 jours.
                </p>
                <p>
                  <strong>5.4 Conséquences de la résiliation :</strong> Après résiliation, vous conservez un accès en lecture seule à votre tableau de bord pendant 30 jours pour exporter vos données. Passé ce délai, toutes vos données seront définitivement supprimées.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">6. Obligations de l'Utilisateur</h2>
              <div className="text-gray-300 space-y-4">
                <p>En utilisant ReplyFast AI, vous vous engagez à :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Utiliser la Plateforme de manière légale et conforme aux présentes CGU</li>
                  <li>Ne pas utiliser le service pour envoyer des messages spam, frauduleux ou illégaux</li>
                  <li>Respecter les conditions d'utilisation de WhatsApp et WAHA</li>
                  <li>Ne pas tenter de contourner les mesures de sécurité de la Plateforme</li>
                  <li>Ne pas utiliser le service pour harceler, menacer ou porter atteinte aux droits d'autrui</li>
                  <li>Fournir des informations exactes et à jour lors de votre inscription</li>
                  <li>Informer vos clients que leurs conversations peuvent être traitées par un assistant automatisé</li>
                  <li>Respecter le RGPD et les lois sur la protection des données personnelles</li>
                  <li>Ne pas revendre, louer ou céder votre accès à la Plateforme</li>
                </ul>
                <p>
                  Toute violation de ces obligations peut entraîner la suspension ou la résiliation immédiate de votre compte sans préavis ni remboursement.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">7. Propriété Intellectuelle</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong>7.1 Droits de ReplyFast AI :</strong> Tous les éléments de la Plateforme (logiciels, textes, images, logos, marques, design, architecture, code source) sont la propriété exclusive de ReplyFast AI ou de ses partenaires. Toute reproduction, représentation, modification ou exploitation non autorisée est interdite.
                </p>
                <p>
                  <strong>7.2 Licence d'utilisation :</strong> ReplyFast AI vous accorde une licence non exclusive, non transférable et révocable d'utilisation de la Plateforme pour vos besoins professionnels, dans le cadre des présentes CGU.
                </p>
                <p>
                  <strong>7.3 Vos contenus :</strong> Vous conservez tous les droits sur les contenus que vous créez ou téléchargez sur la Plateforme (informations entreprise, messages, images). En utilisant le service, vous accordez à ReplyFast AI une licence limitée pour traiter ces contenus dans le cadre de la fourniture du service.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">8. Protection des Données Personnelles</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  ReplyFast AI s'engage à protéger vos données personnelles conformément au RGPD (Règlement Général sur la Protection des Données) et à la loi Informatique et Libertés.
                </p>
                <p>
                  Les données collectées sont nécessaires au fonctionnement du service et sont traitées de manière sécurisée. Pour plus d'informations, consultez notre <Link href="/privacy" className="text-purple-400 hover:text-purple-300">Politique de Confidentialité</Link>.
                </p>
                <p>
                  Vous disposez d'un droit d'accès, de rectification, de suppression, de limitation, de portabilité et d'opposition sur vos données personnelles. Pour exercer ces droits, contactez-nous à privacy@replyfast.ai.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">9. Limitation de Responsabilité</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong>9.1 Disponibilité :</strong> ReplyFast AI s'efforce d'assurer une disponibilité maximale de la Plateforme mais ne garantit pas un fonctionnement ininterrompu. Des interruptions peuvent survenir pour maintenance, mise à jour ou cas de force majeure.
                </p>
                <p>
                  <strong>9.2 Contenu généré par l'IA :</strong> Les réponses générées par l'assistant IA sont automatiques et peuvent contenir des erreurs. Vous êtes responsable de la supervision et de la validation des réponses envoyées à vos clients. ReplyFast AI ne peut être tenu responsable du contenu des messages générés.
                </p>
                <p>
                  <strong>9.3 Connexion WhatsApp :</strong> ReplyFast AI utilise WAHA pour la connexion à WhatsApp. Nous ne sommes pas responsables des dysfonctionnements liés à WhatsApp, WAHA ou aux modifications de leurs conditions d'utilisation.
                </p>
                <p>
                  <strong>9.4 Dommages indirects :</strong> En aucun cas ReplyFast AI ne pourra être tenu responsable des dommages indirects (perte de chiffre d'affaires, perte de clientèle, perte de données) résultant de l'utilisation ou de l'impossibilité d'utiliser la Plateforme.
                </p>
                <p>
                  <strong>9.5 Limitation :</strong> La responsabilité totale de ReplyFast AI, tous dommages confondus, est limitée au montant des sommes effectivement payées par l'utilisateur au cours des 12 derniers mois.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">10. Force Majeure</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  ReplyFast AI ne pourra être tenu responsable de tout retard ou inexécution de ses obligations résultant d'un cas de force majeure tel que défini par la jurisprudence française, incluant notamment : catastrophes naturelles, guerres, grèves, pannes d'électricité, défaillances d'internet, actes de terrorisme, décisions gouvernementales, etc.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">11. Droit Applicable et Juridiction</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Les présentes CGU sont régies par le droit français. En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, le litige sera porté devant les tribunaux compétents de Paris, France.
                </p>
                <p>
                  Conformément à l'article L612-1 du Code de la consommation, vous pouvez recourir gratuitement à un médiateur de la consommation en cas de litige : Médiateur de la Consommation, 27 avenue de la Libération, 87000 Limoges - contact@mediation-consommation.fr
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">12. Dispositions Générales</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong>12.1 Intégralité :</strong> Les présentes CGU constituent l'intégralité de l'accord entre vous et ReplyFast AI concernant l'utilisation de la Plateforme.
                </p>
                <p>
                  <strong>12.2 Divisibilité :</strong> Si une clause des présentes CGU est déclarée nulle ou inapplicable, les autres clauses resteront en vigueur.
                </p>
                <p>
                  <strong>12.3 Non-renonciation :</strong> Le fait pour ReplyFast AI de ne pas se prévaloir d'une clause des CGU ne constitue pas une renonciation à s'en prévaloir ultérieurement.
                </p>
                <p>
                  <strong>12.4 Contact :</strong> Pour toute question concernant les présentes CGU, vous pouvez nous contacter à legal@replyfast.ai ou par courrier à : ReplyFast AI, Service Juridique, Paris, France.
                </p>
              </div>
            </section>

            {/* Notice */}
            <div className="mt-12 p-6 bg-purple-900/20 border border-purple-500/30 rounded-xl flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-white mb-2">Important</p>
                <p>
                  En créant un compte et en utilisant ReplyFast AI, vous reconnaissez avoir lu, compris et accepté l'intégralité des présentes Conditions Générales d'Utilisation. Si vous avez des questions, n'hésitez pas à nous contacter avant de commencer à utiliser le service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500">
          <p>&copy; 2024 ReplyFast AI. Tous droits réservés.</p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <Link href="/faq" className="hover:text-purple-400 transition-colors">FAQ</Link>
            <Link href="/cgu" className="hover:text-purple-400 transition-colors">CGU</Link>
            <Link href="/privacy" className="hover:text-purple-400 transition-colors">Confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
