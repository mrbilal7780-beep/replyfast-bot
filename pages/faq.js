import Link from 'next/link'
import { ChevronDown, ArrowLeft, HelpCircle, MessageSquare, CreditCard, Settings, Shield, Zap } from 'lucide-react'
import { useState } from 'react'

const FAQCategory = ({ icon: Icon, title, faqs }) => {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-purple-500/50"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-5 flex items-center justify-between text-left"
            >
              <span className="text-lg font-semibold text-white pr-4">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-purple-400 transition-transform duration-300 flex-shrink-0 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              className={`transition-all duration-300 ${
                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              } overflow-hidden`}
            >
              <div className="px-6 pb-5 text-gray-400 leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function FAQ() {
  const categories = [
    {
      icon: HelpCircle,
      title: 'Questions Générales',
      faqs: [
        {
          question: 'Qu\'est-ce que ReplyFast AI ?',
          answer: 'ReplyFast AI est un assistant intelligent WhatsApp qui répond automatiquement à vos clients 24h/24 et 7j/7. Il utilise l\'intelligence artificielle GPT-4o-mini pour comprendre les demandes de vos clients, répondre de manière personnalisée, prendre des rendez-vous et gérer vos conversations professionnelles.'
        },
        {
          question: 'Comment fonctionne ReplyFast AI ?',
          answer: 'ReplyFast AI se connecte à votre compte WhatsApp Business via WAHA (WhatsApp HTTP API). Une fois configuré, le bot analyse chaque message reçu, comprend l\'intention du client grâce à l\'IA, et génère une réponse adaptée en fonction des informations de votre entreprise (horaires, services, tarifs). Vous gardez le contrôle total depuis votre tableau de bord.'
        },
        {
          question: 'Ai-je besoin de connaissances techniques pour utiliser ReplyFast AI ?',
          answer: 'Non, absolument pas ! ReplyFast AI a été conçu pour être simple et intuitif. L\'installation se fait en 3 étapes : créer votre compte, connecter WhatsApp via QR code, et configurer vos informations business. Tout est guidé et ne prend que quelques minutes.'
        },
        {
          question: 'Puis-je utiliser ReplyFast AI avec mon numéro WhatsApp personnel ?',
          answer: 'Nous recommandons fortement d\'utiliser un numéro WhatsApp Business dédié pour séparer votre vie professionnelle et personnelle. Cependant, techniquement, vous pouvez utiliser n\'importe quel numéro WhatsApp compatible avec WAHA.'
        },
        {
          question: 'ReplyFast AI remplace-t-il complètement l\'interaction humaine ?',
          answer: 'Non, ReplyFast AI est un assistant qui vous aide à gérer les demandes courantes automatiquement. Vous pouvez à tout moment prendre le contrôle d\'une conversation depuis votre tableau de bord et répondre manuellement. Le bot est là pour vous faire gagner du temps, pas pour remplacer votre expertise.'
        }
      ]
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp & Connexion',
      faqs: [
        {
          question: 'Comment connecter mon WhatsApp à ReplyFast AI ?',
          answer: 'Après votre inscription, vous serez redirigé vers la page de connexion WhatsApp. Scannez simplement le QR code affiché avec votre application WhatsApp (Menu > Appareils connectés > Associer un appareil). La connexion est instantanée et sécurisée.'
        },
        {
          question: 'Qu\'est-ce que WAHA ?',
          answer: 'WAHA (WhatsApp HTTP API) est une solution open-source qui permet de connecter WhatsApp à des applications tierces de manière sécurisée. C\'est l\'infrastructure que nous utilisons pour faire communiquer votre WhatsApp avec ReplyFast AI.'
        },
        {
          question: 'Ma connexion WhatsApp est-elle sécurisée ?',
          answer: 'Oui, absolument. Nous utilisons WAHA qui respecte les protocoles de sécurité de WhatsApp. Vos messages sont chiffrés de bout en bout. Nous ne stockons jamais vos identifiants WhatsApp, seulement les sessions actives nécessaires au fonctionnement du bot.'
        },
        {
          question: 'Que se passe-t-il si je me déconnecte de WhatsApp ?',
          answer: 'Si vous vous déconnectez manuellement ou si la session expire, le bot cessera de fonctionner. Vous recevrez une notification par email et vous pourrez vous reconnecter en quelques secondes depuis votre tableau de bord en scannant à nouveau le QR code.'
        },
        {
          question: 'Puis-je utiliser WhatsApp normalement sur mon téléphone ?',
          answer: 'Oui, bien sûr ! ReplyFast AI fonctionne comme un appareil connecté (comme WhatsApp Web). Vous pouvez continuer à utiliser WhatsApp sur votre téléphone normalement. Les messages envoyés par le bot apparaîtront dans vos conversations.'
        }
      ]
    },
    {
      icon: Zap,
      title: 'Fonctionnalités & Utilisation',
      faqs: [
        {
          question: 'Quelles sont les principales fonctionnalités de ReplyFast AI ?',
          answer: 'ReplyFast AI offre : réponses automatiques 24/7 avec IA, prise de rendez-vous automatique avec calendrier intégré, gestion des conversations en temps réel, menu de produits/services personnalisable, statistiques et analytics détaillés, offres spéciales et promotions, notifications en temps réel, et bien plus.'
        },
        {
          question: 'Comment le bot sait-il quoi répondre ?',
          answer: 'Le bot utilise GPT-4o-mini, un modèle d\'IA avancé, combiné aux informations que vous avez configurées (nom de l\'entreprise, secteur d\'activité, horaires, services, adresse). Il analyse le contexte de la conversation et génère des réponses naturelles et pertinentes.'
        },
        {
          question: 'Puis-je personnaliser les réponses du bot ?',
          answer: 'Oui ! Vous pouvez configurer les informations de votre entreprise, vos horaires, vos services, et même définir des réponses spécifiques pour certaines questions fréquentes. Le bot s\'adapte automatiquement à votre secteur d\'activité.'
        },
        {
          question: 'Comment fonctionne la prise de rendez-vous automatique ?',
          answer: 'Lorsqu\'un client demande un rendez-vous, le bot détecte automatiquement l\'intention, demande les informations nécessaires (date, heure, service), vérifie la disponibilité dans votre calendrier, et confirme le rendez-vous. Vous recevez une notification instantanée et pouvez gérer tous vos rendez-vous depuis le tableau de bord.'
        },
        {
          question: 'Puis-je voir toutes les conversations en temps réel ?',
          answer: 'Oui, absolument. Votre tableau de bord affiche toutes les conversations en temps réel. Vous pouvez lire l\'historique complet, voir les messages en cours, et prendre le contrôle à tout moment pour répondre manuellement.'
        },
        {
          question: 'Le bot peut-il gérer plusieurs conversations simultanément ?',
          answer: 'Oui, le bot peut gérer un nombre illimité de conversations simultanées. C\'est l\'un des grands avantages de l\'automatisation : vos clients reçoivent une réponse instantanée, même si vous recevez 100 messages en même temps.'
        }
      ]
    },
    {
      icon: CreditCard,
      title: 'Tarifs & Abonnement',
      faqs: [
        {
          question: 'Quel est le prix de ReplyFast AI ?',
          answer: 'ReplyFast AI coûte 19,99€ par mois. Ce tarif unique inclut toutes les fonctionnalités sans limitation : conversations illimitées, rendez-vous illimités, support client prioritaire, et toutes les futures mises à jour.'
        },
        {
          question: 'Y a-t-il un essai gratuit ?',
          answer: 'Oui ! Nous offrons 30 jours d\'essai gratuit sans engagement. Vous pouvez tester toutes les fonctionnalités de ReplyFast AI sans carte bancaire. Si vous n\'êtes pas satisfait, vous pouvez annuler à tout moment avant la fin de la période d\'essai.'
        },
        {
          question: 'Comment se passe le paiement ?',
          answer: 'Les paiements sont gérés de manière 100% sécurisée par Stripe, leader mondial du paiement en ligne. Vous pouvez payer par carte bancaire. L\'abonnement est mensuel et renouvelé automatiquement.'
        },
        {
          question: 'Puis-je annuler mon abonnement à tout moment ?',
          answer: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord (Paramètres > Abonnement). L\'annulation prend effet à la fin de votre période de facturation en cours. Aucun frais caché, aucune pénalité.'
        },
        {
          question: 'Que se passe-t-il si j\'annule mon abonnement ?',
          answer: 'Si vous annulez, vous conservez l\'accès à ReplyFast AI jusqu\'à la fin de votre période payée. Après cette date, le bot cessera de répondre automatiquement, mais vous pourrez toujours accéder à votre tableau de bord en lecture seule pour exporter vos données.'
        },
        {
          question: 'Y a-t-il des frais supplémentaires ou cachés ?',
          answer: 'Non, aucun frais caché. Le prix de 19,99€/mois inclut tout : conversations illimitées, rendez-vous illimités, support client, mises à jour, et toutes les fonctionnalités. Vous ne payez rien de plus.'
        }
      ]
    },
    {
      icon: Settings,
      title: 'Configuration & Support',
      faqs: [
        {
          question: 'Comment configurer les informations de mon entreprise ?',
          answer: 'Rendez-vous dans Paramètres > Informations Business. Vous pouvez y renseigner le nom de votre entreprise, secteur d\'activité, adresse, téléphone, horaires d\'ouverture, services proposés, et toute autre information utile pour le bot.'
        },
        {
          question: 'Puis-je changer mes horaires d\'ouverture facilement ?',
          answer: 'Oui, vous pouvez modifier vos horaires à tout moment depuis les paramètres. Le bot s\'adaptera automatiquement et informera vos clients des nouveaux horaires lors des prochaines conversations.'
        },
        {
          question: 'Comment ajouter des produits ou services ?',
          answer: 'Allez dans Menu Manager depuis votre tableau de bord. Vous pouvez ajouter, modifier ou supprimer des produits/services avec nom, description, prix, et même des images. Le bot utilisera ces informations pour répondre aux questions des clients.'
        },
        {
          question: 'Quel support est disponible si j\'ai un problème ?',
          answer: 'Nous offrons un support client prioritaire par email à support@replyfast.ai. Nous répondons généralement sous 24h maximum. Vous pouvez également consulter notre documentation complète et nos tutoriels vidéo.'
        },
        {
          question: 'ReplyFast AI est-il compatible avec tous les secteurs d\'activité ?',
          answer: 'Oui ! ReplyFast AI s\'adapte à tous les secteurs : restaurants, salons de coiffure, garages automobiles, cabinets médicaux, boutiques e-commerce, services à domicile, coaching, et bien plus. Le bot personnalise ses réponses en fonction de votre secteur.'
        }
      ]
    },
    {
      icon: Shield,
      title: 'Sécurité & Confidentialité',
      faqs: [
        {
          question: 'Mes données sont-elles sécurisées ?',
          answer: 'Oui, la sécurité est notre priorité absolue. Toutes vos données sont stockées sur des serveurs sécurisés (Supabase) avec chiffrement. Nous respectons le RGPD et ne partageons jamais vos données avec des tiers.'
        },
        {
          question: 'Qui a accès à mes conversations WhatsApp ?',
          answer: 'Seul vous avez accès à vos conversations depuis votre tableau de bord. Nos systèmes traitent les messages de manière automatisée pour générer les réponses, mais aucun humain de notre équipe ne lit vos conversations.'
        },
        {
          question: 'Les messages sont-ils stockés ?',
          answer: 'Oui, les messages sont stockés dans votre base de données personnelle pour vous permettre de consulter l\'historique et les statistiques. Vous pouvez exporter ou supprimer vos données à tout moment depuis les paramètres.'
        },
        {
          question: 'ReplyFast AI est-il conforme au RGPD ?',
          answer: 'Oui, ReplyFast AI est 100% conforme au RGPD (Règlement Général sur la Protection des Données). Vous êtes le responsable de traitement de vos données clients, et nous agissons en tant que sous-traitant. Nous avons mis en place toutes les mesures techniques et organisationnelles nécessaires.'
        },
        {
          question: 'Puis-je exporter mes données ?',
          answer: 'Oui, vous pouvez exporter toutes vos données (conversations, rendez-vous, statistiques) à tout moment depuis les paramètres. Les exports sont disponibles au format CSV et JSON.'
        }
      ]
    }
  ]

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
              <HelpCircle className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-semibold">Centre d'aide</span>
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
              Questions Fréquentes
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Trouvez rapidement les réponses à toutes vos questions sur ReplyFast AI
            </p>
          </div>

          {/* FAQ Categories */}
          {categories.map((category, index) => (
            <FAQCategory
              key={index}
              icon={category.icon}
              title={category.title}
              faqs={category.faqs}
            />
          ))}

          {/* Contact Support */}
          <div className="mt-16 p-8 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/20 rounded-2xl text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Vous ne trouvez pas votre réponse ?
            </h3>
            <p className="text-gray-400 mb-6">
              Notre équipe support est là pour vous aider
            </p>
            <a
              href="mailto:support@replyfast.ai"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              Contacter le support
            </a>
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
