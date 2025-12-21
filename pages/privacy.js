import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, FileCheck } from 'lucide-react'

export default function Privacy() {
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
              <Shield className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-semibold">Confidentialité & RGPD</span>
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
              Politique de Confidentialité
            </h1>
            <p className="text-gray-400">
              Dernière mise à jour : 22 décembre 2024
            </p>
          </div>

          {/* Legal Content */}
          <div className="prose prose-invert prose-purple max-w-none">
            {/* Introduction */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-purple-400" />
                Introduction
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Chez ReplyFast AI, la protection de vos données personnelles est une priorité absolue. La présente Politique de Confidentialité a pour objectif de vous informer de manière transparente sur la collecte, l'utilisation, le stockage et la protection de vos données personnelles dans le cadre de l'utilisation de notre plateforme.
                </p>
                <p>
                  Cette politique est conforme au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679) et à la loi française Informatique et Libertés modifiée.
                </p>
                <p>
                  <strong>Responsable du traitement :</strong> ReplyFast AI, société par actions simplifiée au capital de 10 000 euros, immatriculée au RCS sous le numéro XXX XXX XXX, dont le siège social est situé à Paris, France.
                </p>
                <p>
                  <strong>Contact :</strong> Pour toute question relative à la protection de vos données personnelles, vous pouvez nous contacter à privacy@replyfast.ai ou par courrier à : ReplyFast AI, Service Protection des Données, Paris, France.
                </p>
              </div>
            </section>

            {/* Section 1 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Database className="w-6 h-6 text-purple-400" />
                1. Données Collectées
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Nous collectons différentes catégories de données personnelles en fonction de votre utilisation de la Plateforme :
                </p>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-white mb-3">1.1 Données d'inscription et de compte</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Nom et prénom</li>
                    <li>Adresse email</li>
                    <li>Mot de passe (chiffré et non accessible par nos équipes)</li>
                    <li>Numéro de téléphone (optionnel)</li>
                    <li>Date de création du compte</li>
                  </ul>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-white mb-3">1.2 Données professionnelles</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Nom de l'entreprise</li>
                    <li>Secteur d'activité</li>
                    <li>Adresse professionnelle</li>
                    <li>Numéro de téléphone professionnel</li>
                    <li>Horaires d'ouverture</li>
                    <li>Services et produits proposés</li>
                    <li>Informations de configuration du bot IA</li>
                  </ul>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-white mb-3">1.3 Données de conversations WhatsApp</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Numéros de téléphone de vos clients</li>
                    <li>Contenu des messages échangés (envoyés et reçus)</li>
                    <li>Dates et heures des conversations</li>
                    <li>Métadonnées des conversations (statut de lecture, etc.)</li>
                  </ul>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-white mb-3">1.4 Données de rendez-vous</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Nom des clients</li>
                    <li>Numéros de téléphone</li>
                    <li>Dates et heures des rendez-vous</li>
                    <li>Services demandés</li>
                    <li>Notes et commentaires</li>
                  </ul>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-white mb-3">1.5 Données de paiement</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Informations de facturation (nom, adresse)</li>
                    <li>Historique des paiements et factures</li>
                    <li>Les données bancaires sont traitées directement par Stripe (notre prestataire de paiement) et ne sont jamais stockées sur nos serveurs</li>
                  </ul>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-white mb-3">1.6 Données techniques et de connexion</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Adresse IP</li>
                    <li>Type de navigateur et système d'exploitation</li>
                    <li>Pages visitées et actions effectuées sur la Plateforme</li>
                    <li>Dates et heures de connexion</li>
                    <li>Cookies et technologies similaires</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Eye className="w-6 h-6 text-purple-400" />
                2. Finalités et Bases Légales du Traitement
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Vos données personnelles sont collectées et traitées pour les finalités suivantes :
                </p>

                <div className="mt-6 space-y-6">
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Gestion de votre compte utilisateur</h4>
                    <p className="text-sm text-gray-400">Base légale : Exécution du contrat</p>
                    <p className="mt-2">Création, authentification, gestion et sécurisation de votre compte.</p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Fourniture du service ReplyFast AI</h4>
                    <p className="text-sm text-gray-400">Base légale : Exécution du contrat</p>
                    <p className="mt-2">Connexion WhatsApp, traitement des conversations, génération de réponses automatiques par IA, gestion des rendez-vous, affichage du tableau de bord.</p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Gestion des paiements et facturation</h4>
                    <p className="text-sm text-gray-400">Base légale : Exécution du contrat et obligations légales</p>
                    <p className="mt-2">Traitement des abonnements, émission de factures, gestion des remboursements.</p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Support client et assistance technique</h4>
                    <p className="text-sm text-gray-400">Base légale : Intérêt légitime</p>
                    <p className="mt-2">Réponse à vos demandes, résolution de problèmes techniques, amélioration de la qualité du service.</p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Amélioration de la Plateforme</h4>
                    <p className="text-sm text-gray-400">Base légale : Intérêt légitime</p>
                    <p className="mt-2">Analyse d'usage, statistiques anonymisées, développement de nouvelles fonctionnalités.</p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Sécurité et prévention de la fraude</h4>
                    <p className="text-sm text-gray-400">Base légale : Intérêt légitime et obligations légales</p>
                    <p className="mt-2">Détection et prévention des activités frauduleuses, protection contre les cyberattaques.</p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Communications marketing (optionnel)</h4>
                    <p className="text-sm text-gray-400">Base légale : Consentement</p>
                    <p className="mt-2">Envoi de newsletters, offres promotionnelles, nouveautés. Vous pouvez vous désabonner à tout moment.</p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Respect des obligations légales</h4>
                    <p className="text-sm text-gray-400">Base légale : Obligations légales</p>
                    <p className="mt-2">Conservation des données comptables et fiscales, réponse aux demandes des autorités compétentes.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-purple-400" />
                3. Destinataires des Données
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Vos données personnelles sont traitées par ReplyFast AI et peuvent être transmises aux catégories de destinataires suivants :
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Personnel autorisé de ReplyFast AI</h4>
                    <p>Nos équipes techniques et support client ont accès aux données strictement nécessaires à l'exécution de leurs missions.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Sous-traitants techniques</h4>
                    <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                      <li><strong>Supabase</strong> : Hébergement de la base de données (serveurs situés en Europe)</li>
                      <li><strong>Render</strong> : Hébergement de l'application web</li>
                      <li><strong>OpenAI</strong> : Traitement des messages par intelligence artificielle (GPT-4o-mini)</li>
                      <li><strong>WAHA</strong> : Infrastructure de connexion WhatsApp</li>
                      <li><strong>Stripe</strong> : Traitement sécurisé des paiements</li>
                    </ul>
                    <p className="mt-2 text-sm">Tous nos sous-traitants sont soumis à des obligations contractuelles strictes de confidentialité et de sécurité conformes au RGPD.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Autorités légales</h4>
                    <p>En cas d'obligation légale, nous pouvons être amenés à communiquer vos données aux autorités compétentes (police, justice, administration fiscale).</p>
                  </div>
                </div>

                <p className="mt-6 font-semibold text-white">
                  ⚠️ Nous ne vendons jamais vos données personnelles à des tiers à des fins commerciales.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Lock className="w-6 h-6 text-purple-400" />
                4. Sécurité des Données
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  ReplyFast AI met en œuvre toutes les mesures techniques et organisationnelles appropriées pour garantir la sécurité de vos données personnelles et les protéger contre toute destruction, perte, altération, divulgation ou accès non autorisé.
                </p>

                <div className="mt-6">
                  <h4 className="font-semibold text-white mb-3">Mesures de sécurité techniques :</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Chiffrement SSL/TLS pour toutes les communications</li>
                    <li>Chiffrement des mots de passe avec bcrypt</li>
                    <li>Authentification sécurisée avec tokens JWT</li>
                    <li>Pare-feu et protection anti-DDoS</li>
                    <li>Sauvegardes automatiques quotidiennes</li>
                    <li>Surveillance et détection des intrusions 24/7</li>
                    <li>Mises à jour de sécurité régulières</li>
                  </ul>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-white mb-3">Mesures organisationnelles :</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Accès aux données limité au personnel autorisé uniquement</li>
                    <li>Formation régulière de nos équipes à la sécurité et au RGPD</li>
                    <li>Politique de mots de passe stricte</li>
                    <li>Audits de sécurité réguliers</li>
                    <li>Procédures de gestion des incidents de sécurité</li>
                  </ul>
                </div>

                <p className="mt-6">
                  En cas de violation de données personnelles susceptible d'engendrer un risque élevé pour vos droits et libertés, nous vous en informerons dans les meilleurs délais conformément au RGPD.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">5. Durée de Conservation</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Vos données personnelles sont conservées pour la durée strictement nécessaire aux finalités pour lesquelles elles ont été collectées :
                </p>

                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Données de compte actif</h4>
                    <p>Conservées pendant toute la durée de votre abonnement + 30 jours après résiliation (pour permettre l'export de vos données).</p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Conversations et messages</h4>
                    <p>Conservés pendant la durée de votre abonnement + 30 jours après résiliation.</p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Données de facturation</h4>
                    <p>Conservées 10 ans conformément aux obligations légales comptables et fiscales.</p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Logs de connexion et données techniques</h4>
                    <p>Conservés 12 mois pour des raisons de sécurité et de prévention de la fraude.</p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Données marketing (si consentement)</h4>
                    <p>Conservées 3 ans à compter de votre dernier contact ou jusqu'à retrait de votre consentement.</p>
                  </div>
                </div>

                <p className="mt-6">
                  À l'issue de ces durées, vos données sont supprimées ou anonymisées de manière irréversible.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <FileCheck className="w-6 h-6 text-purple-400" />
                6. Vos Droits sur vos Données
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants sur vos données personnelles :
                </p>

                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">✅ Droit d'accès</h4>
                    <p>Vous pouvez demander à accéder à toutes vos données personnelles que nous détenons.</p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">✏️ Droit de rectification</h4>
                    <p>Vous pouvez demander la correction de données inexactes ou incomplètes.</p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">🗑️ Droit à l'effacement ("droit à l'oubli")</h4>
                    <p>Vous pouvez demander la suppression de vos données dans certaines conditions (sauf obligations légales de conservation).</p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">⏸️ Droit à la limitation du traitement</h4>
                    <p>Vous pouvez demander le gel temporaire de vos données dans certaines situations.</p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">📦 Droit à la portabilité</h4>
                    <p>Vous pouvez récupérer vos données dans un format structuré et lisible par machine (CSV, JSON).</p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">🚫 Droit d'opposition</h4>
                    <p>Vous pouvez vous opposer au traitement de vos données pour des raisons tenant à votre situation particulière.</p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">⚙️ Droit de retirer votre consentement</h4>
                    <p>Pour les traitements basés sur le consentement (marketing), vous pouvez le retirer à tout moment.</p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">📝 Droit de définir des directives post-mortem</h4>
                    <p>Vous pouvez définir des directives relatives au sort de vos données après votre décès.</p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                  <h4 className="font-semibold text-white mb-3">Comment exercer vos droits ?</h4>
                  <p className="mb-4">
                    Pour exercer vos droits, vous pouvez :
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Accéder directement à votre tableau de bord (Paramètres > Confidentialité)</li>
                    <li>Nous envoyer un email à <strong>privacy@replyfast.ai</strong></li>
                    <li>Nous écrire par courrier à : ReplyFast AI, Service Protection des Données, Paris, France</li>
                  </ul>
                  <p className="mt-4 text-sm">
                    Nous nous engageons à répondre à votre demande dans un délai maximum de <strong>1 mois</strong> à compter de sa réception. Ce délai peut être prolongé de 2 mois en cas de demande complexe (vous en serez informé).
                  </p>
                </div>

                <p className="mt-6">
                  Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" className="text-purple-400 hover:text-purple-300">www.cnil.fr</a>
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">7. Cookies et Technologies Similaires</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  ReplyFast AI utilise des cookies et technologies similaires pour améliorer votre expérience utilisateur et analyser l'utilisation de la Plateforme.
                </p>

                <div className="mt-6">
                  <h4 className="font-semibold text-white mb-3">Types de cookies utilisés :</h4>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <h5 className="font-semibold text-white mb-2">Cookies strictement nécessaires</h5>
                      <p className="text-sm mb-2">Indispensables au fonctionnement de la Plateforme (authentification, sécurité, préférences de session).</p>
                      <p className="text-sm text-purple-400">✅ Pas de consentement requis</p>
                    </div>

                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <h5 className="font-semibold text-white mb-2">Cookies analytiques</h5>
                      <p className="text-sm mb-2">Nous permettent de comprendre comment vous utilisez la Plateforme et d'améliorer nos services.</p>
                      <p className="text-sm text-yellow-400">⚠️ Consentement requis</p>
                    </div>

                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <h5 className="font-semibold text-white mb-2">Cookies de performance</h5>
                      <p className="text-sm mb-2">Mesurent les performances techniques de la Plateforme.</p>
                      <p className="text-sm text-yellow-400">⚠️ Consentement requis</p>
                    </div>
                  </div>
                </div>

                <p className="mt-6">
                  Vous pouvez à tout moment gérer vos préférences de cookies depuis les paramètres de votre navigateur ou depuis notre bandeau de cookies. Le refus de certains cookies peut limiter certaines fonctionnalités de la Plateforme.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">8. Transferts de Données hors UE</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Vos données personnelles sont principalement hébergées et traitées au sein de l'Union Européenne (Supabase, Render).
                </p>
                <p>
                  Certains de nos sous-traitants (notamment OpenAI pour le traitement par intelligence artificielle) peuvent être situés en dehors de l'Union Européenne, notamment aux États-Unis.
                </p>
                <p>
                  Dans ce cas, nous nous assurons que des garanties appropriées sont mises en place conformément au RGPD :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>Clauses contractuelles types approuvées par la Commission Européenne</li>
                  <li>Certification Privacy Shield (si applicable)</li>
                  <li>Mesures de sécurité renforcées (chiffrement, pseudonymisation)</li>
                </ul>
              </div>
            </section>

            {/* Section 9 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">9. Mineurs</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  ReplyFast AI est un service destiné aux professionnels et entreprises. Nous ne collectons pas sciemment de données personnelles de personnes mineures (moins de 18 ans).
                </p>
                <p>
                  Si vous êtes parent ou tuteur légal et que vous découvrez que votre enfant nous a fourni des données personnelles sans votre consentement, veuillez nous contacter immédiatement à privacy@replyfast.ai pour que nous puissions supprimer ces données.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">10. Modifications de la Politique de Confidentialité</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Nous pouvons être amenés à modifier la présente Politique de Confidentialité pour refléter les évolutions de nos pratiques, de la législation ou de nos services.
                </p>
                <p>
                  En cas de modification substantielle, nous vous en informerons par email et/ou par notification sur la Plateforme au moins <strong>30 jours avant</strong> l'entrée en vigueur des modifications.
                </p>
                <p>
                  La date de dernière mise à jour est indiquée en haut de cette page. Nous vous encourageons à consulter régulièrement cette politique.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section className="mb-12 p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">11. Contact et Délégué à la Protection des Données</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Pour toute question relative à la protection de vos données personnelles ou pour exercer vos droits, vous pouvez nous contacter :
                </p>
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                  <p><strong>Email :</strong> privacy@replyfast.ai</p>
                  <p className="mt-2"><strong>Courrier :</strong> ReplyFast AI, Service Protection des Données, Paris, France</p>
                  <p className="mt-2"><strong>Téléphone :</strong> +33 (0)1 XX XX XX XX</p>
                </div>
                <p className="mt-4">
                  Nous nous engageons à répondre à vos demandes dans les meilleurs délais et en tout état de cause dans le délai légal d'1 mois.
                </p>
              </div>
            </section>

            {/* Final Notice */}
            <div className="mt-12 p-6 bg-purple-900/20 border border-purple-500/30 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-4">🔒 Notre Engagement</h3>
              <p className="text-gray-300">
                Chez ReplyFast AI, la protection de vos données personnelles n'est pas une option, c'est une priorité. Nous mettons tout en œuvre pour garantir la sécurité, la confidentialité et la conformité de vos données avec les réglementations les plus strictes. Votre confiance est notre plus grande responsabilité.
              </p>
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
