import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Book, CheckCircle, ChevronDown, ChevronRight,
  Settings, MessageSquare, Calendar, Menu as MenuIcon,
  Bot, TrendingUp, Users, MapPin, Bell, CreditCard,
  Smartphone, Globe, Zap, Shield, Volume2, Eye,
  ArrowRight, Home, PlayCircle
} from 'lucide-react';
import { useRouter } from 'next/router';

export default function Tutorial() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const markAsCompleted = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const tutorialSections = [
    {
      id: 'setup',
      title: '🚀 Configuration Initiale',
      icon: Settings,
      color: 'from-blue-500 to-cyan-500',
      steps: [
        {
          id: 'setup-1',
          title: 'Créer votre compte ReplyFast',
          description: 'Inscrivez-vous avec votre email professionnel et choisissez un mot de passe sécurisé.',
          tips: [
            'Utilisez un email que vous consultez régulièrement',
            'Activez l\'authentification à deux facteurs pour plus de sécurité',
            'Conservez vos identifiants en lieu sûr'
          ]
        },
        {
          id: 'setup-2',
          title: 'Configurer WhatsApp Business API',
          description: 'Connectez votre numéro WhatsApp Business pour recevoir et envoyer des messages automatiquement.',
          steps: [
            'Allez dans Paramètres > Informations Business',
            'Cliquez sur "Configurer WhatsApp"',
            'Suivez les instructions Meta pour obtenir votre Phone Number ID',
            'Collez le Phone Number ID dans ReplyFast',
            'Vérifiez la connexion avec un message test'
          ],
          tips: [
            'Vous devez avoir un compte Meta Business',
            'Le Phone Number ID est unique - un seul compte ReplyFast par ID',
            'Testez toujours la connexion avant de passer en production'
          ]
        },
        {
          id: 'setup-3',
          title: 'Remplir vos informations business',
          description: 'Complétez votre profil d\'entreprise pour personnaliser l\'expérience client.',
          fields: [
            'Nom de l\'entreprise',
            'Secteur d\'activité',
            'Adresse (avec autocomplétion Google Places)',
            'Email de contact',
            'Site web',
            'Horaires d\'ouverture',
            'Tarifs et services'
          ],
          tips: [
            'L\'adresse utilise Google Places - tapez et sélectionnez pour GPS automatique',
            'Les horaires sont utilisés par l\'IA pour les rendez-vous',
            'Les tarifs aident l\'IA à répondre aux questions de prix'
          ]
        }
      ]
    },
    {
      id: 'conversations',
      title: '💬 Gérer les Conversations',
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500',
      steps: [
        {
          id: 'conv-1',
          title: 'Accéder aux conversations',
          description: 'Visualisez toutes vos conversations WhatsApp depuis le dashboard.',
          actions: [
            'Cliquez sur "Conversations" dans le menu',
            'Voir la liste de tous les clients',
            'Cliquez sur une conversation pour voir les détails',
            'Utilisez le bouton X flottant pour fermer rapidement'
          ]
        },
        {
          id: 'conv-2',
          title: 'Répondre manuellement',
          description: 'Vous pouvez toujours prendre la main et répondre manuellement.',
          tips: [
            'L\'IA répond automatiquement, mais vous gardez le contrôle',
            'Prenez la main pour les cas sensibles ou complexes',
            'Vos réponses manuelles enrichissent l\'apprentissage de l\'IA'
          ]
        },
        {
          id: 'conv-3',
          title: 'Gérer les rendez-vous',
          description: 'Confirmez, modifiez ou annulez les rendez-vous directement depuis les conversations.',
          features: [
            'Confirmation automatique des RDV',
            'Rappels automatiques 24h avant',
            'Gestion des annulations et reports',
            'Synchronisation avec le calendrier'
          ]
        }
      ]
    },
    {
      id: 'appointments',
      title: '📅 Système de Rendez-vous',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      steps: [
        {
          id: 'appt-1',
          title: 'Calendrier intelligent',
          description: 'Visualisez tous vos rendez-vous dans un calendrier intuitif.',
          views: [
            'Vue mensuelle - Aperçu global',
            'Vue hebdomadaire - Planning détaillé',
            'Vue journalière - Focus sur une date',
            'Liste - Tous les RDV chronologiquement'
          ]
        },
        {
          id: 'appt-2',
          title: 'Créer un rendez-vous manuel',
          description: 'Ajoutez des rendez-vous manuellement pour les clients qui appellent ou viennent en personne.',
          fields: [
            'Nom du client',
            'Téléphone (optionnel)',
            'Date et heure',
            'Durée du service',
            'Type de service',
            'Notes spéciales'
          ]
        },
        {
          id: 'appt-3',
          title: 'Archivage automatique',
          description: 'Les rendez-vous passés sont automatiquement archivés pour garder votre calendrier propre.',
          features: [
            'Archivage auto des RDV > 30 jours',
            'Archivage manuel possible',
            'Restauration des RDV archivés',
            'Statistiques sur les RDV archivés'
          ]
        },
        {
          id: 'appt-4',
          title: 'Géolocalisation et distance',
          description: 'Activez la géolocalisation pour calculer la distance client et optimiser vos déplacements.',
          steps: [
            'Allez dans Paramètres > Accessibilité',
            'Activez "Géolocalisation" avec consentement RGPD',
            'Autorisez la localisation dans votre navigateur',
            'Les distances s\'affichent dans Analytics et Rendez-vous'
          ],
          tips: [
            'Conforme RGPD - consentement explicite requis',
            'Révocable à tout moment',
            'Utilisé pour stats de distance et zones populaires',
            'Ne jamais partagé avec des tiers'
          ]
        }
      ]
    },
    {
      id: 'menu',
      title: '🍽️ Menu Manager',
      icon: MenuIcon,
      color: 'from-orange-500 to-red-500',
      steps: [
        {
          id: 'menu-1',
          title: 'Saisir votre menu',
          description: 'Trois façons de créer votre menu : upload image, upload PDF, ou saisie manuelle.',
          methods: [
            'Upload PNG/JPEG - OCR automatique (bientôt)',
            'Upload PDF - Extraction texte (bientôt)',
            'Saisie manuelle - Remplissez le formulaire'
          ],
          currentBest: 'Pour l\'instant, utilisez la saisie manuelle pour un résultat optimal.'
        },
        {
          id: 'menu-2',
          title: 'Gestion de l\'inventaire',
          description: 'Suivez vos stocks en temps réel et enregistrez les ventes.',
          features: [
            'Ajout de produits avec stock initial',
            'Enregistrement des ventes (décrémente le stock)',
            'Alertes stock bas (<20 unités)',
            'Statistiques : Total vendu, Articles trackés, Stock restant',
            'Reset des ventes journalières'
          ],
          howTo: [
            'Onglet "Inventaire" dans Menu Manager',
            'Tapez la quantité vendue et appuyez sur Enter',
            'Le stock se décrémente automatiquement',
            'Consultez les stats en temps réel'
          ]
        },
        {
          id: 'menu-3',
          title: 'L\'IA utilise votre menu',
          description: 'L\'Assistant IA accède à votre menu pour répondre aux questions des clients.',
          examples: [
            'Client : "Vous avez quoi comme plats ?" → IA liste les plats du menu',
            'Client : "C\'est combien le poulet ?" → IA donne le prix exact',
            'Client : "Il reste des côtelettes ?" → IA vérifie l\'inventaire'
          ]
        }
      ]
    },
    {
      id: 'ai-assistant',
      title: '🤖 Assistant IA Personnel',
      icon: Bot,
      color: 'from-cyan-500 to-blue-500',
      steps: [
        {
          id: 'ai-1',
          title: 'Votre coach business intelligent',
          description: 'L\'IA connaît TOUTES vos données : RDV, messages, tarifs, horaires, menu, clients.',
          capabilities: [
            'Analyse de performance mensuelle',
            'Conseils personnalisés pour augmenter le CA',
            'Identification des meilleurs créneaux',
            'Suggestions pour attirer plus de clients',
            'Optimisation des horaires et tarifs'
          ]
        },
        {
          id: 'ai-2',
          title: 'Questions suggérées',
          description: 'Des exemples de questions à poser à votre assistant IA :',
          questions: [
            '"Comment améliorer mes revenus ?"',
            '"Analyse mes performances du mois"',
            '"Quels sont mes meilleurs créneaux ?"',
            '"Conseils pour attirer plus de clients"',
            '"Comment optimiser mes horaires ?"',
            '"Pourquoi j\'ai eu des annulations ?"'
          ]
        },
        {
          id: 'ai-3',
          title: 'Réponses automatiques clients',
          description: 'L\'IA répond automatiquement sur WhatsApp 24/7 en utilisant vos données.',
          scenarios: [
            'Prise de RDV automatique selon vos horaires',
            'Réponses sur les tarifs de vos services',
            'Informations sur votre localisation',
            'Confirmation/annulation de RDV',
            'Questions sur le menu et disponibilité'
          ]
        }
      ]
    },
    {
      id: 'analytics',
      title: '📊 Analytics & Insights',
      icon: TrendingUp,
      color: 'from-yellow-500 to-orange-500',
      steps: [
        {
          id: 'analytics-1',
          title: 'Dashboard de performance',
          description: 'Visualisez vos KPIs en temps réel.',
          metrics: [
            'Taux de confirmation RDV',
            'Nombre de messages reçus/envoyés',
            'Taux de réponse automatique',
            'Revenus estimés',
            'Clients actifs'
          ]
        },
        {
          id: 'analytics-2',
          title: 'Géolocalisation avancée',
          description: 'Stats de distance et zones géographiques de vos clients.',
          stats: [
            'Distance moyenne client',
            'Distance totale parcourue',
            'Plus proche/plus éloigné',
            'Zones géographiques populaires',
            'Carte des clients'
          ],
          privacy: 'Toutes les données géolocalisées sont conformes RGPD et stockées de manière sécurisée.'
        },
        {
          id: 'analytics-3',
          title: 'Export des données',
          description: 'Exportez vos données pour analyses externes.',
          formats: [
            'CSV - Pour Excel/Google Sheets',
            'PDF - Rapports mensuels',
            'JSON - Intégrations techniques'
          ]
        }
      ]
    },
    {
      id: 'accessibility',
      title: '♿ Accessibilité',
      icon: Eye,
      color: 'from-indigo-500 to-purple-500',
      steps: [
        {
          id: 'access-1',
          title: 'Taille du texte',
          description: 'Ajustez la taille du texte pour un confort optimal.',
          sizes: [
            'Petit - Affichage compact',
            'Normal - Par défaut',
            'Grand - Meilleure lisibilité',
            'Très Grand - Accessibilité maximale'
          ],
          location: 'Paramètres > Accessibilité > Taille du texte'
        },
        {
          id: 'access-2',
          title: 'Mode vocal (Text-to-Speech)',
          description: 'L\'IA lit les messages à voix haute - idéal pour la conduite ou malvoyants.',
          features: [
            'Lecture automatique des messages entrants',
            'Réponse vocale (Speech-to-Text)',
            'Commandes vocales pour navigation',
            'Optimisé pour mobile (meilleure qualité)',
            'Chunking intelligent pour textes longs'
          ],
          activation: [
            'Paramètres > Accessibilité',
            'Activer "Mode vocal"',
            'Autoriser micro dans navigateur',
            'Tester avec bouton "Tester la voix"'
          ]
        },
        {
          id: 'access-3',
          title: 'Thème sombre/clair',
          description: 'Choisissez le thème qui convient à votre environnement.',
          themes: [
            'Sombre - Réduit fatigue oculaire',
            'Clair - Meilleure lisibilité en journée'
          ],
          tip: 'Le thème persiste automatiquement - plus de flash blanc au chargement !'
        }
      ]
    },
    {
      id: 'settings',
      title: '⚙️ Paramètres Avancés',
      icon: Settings,
      color: 'from-gray-500 to-slate-600',
      steps: [
        {
          id: 'settings-1',
          title: 'Profil utilisateur',
          description: 'Vos informations personnelles.',
          fields: [
            'Nom complet',
            'Téléphone',
            'Email (non modifiable)',
            'Photo de profil'
          ],
          persistence: 'Toutes les données sont sauvegardées automatiquement en triple : localStorage (instant) + DB (permanent) + Session.'
        },
        {
          id: 'settings-2',
          title: 'Préférences',
          description: 'Personnalisez votre expérience ReplyFast.',
          options: [
            'Thème (sombre/clair)',
            'Langue (8 langues disponibles)',
            'Notifications email',
            'Notifications RDV',
            'Notifications nouveaux clients'
          ]
        },
        {
          id: 'settings-3',
          title: 'Multilingue',
          description: 'ReplyFast supporte 8 langues pour une portée internationale.',
          languages: [
            '🇫🇷 Français',
            '🇬🇧 English',
            '🇪🇸 Español',
            '🇩🇪 Deutsch',
            '🇮🇹 Italiano',
            '🇵🇹 Português',
            '🇳🇱 Nederlands',
            '🇵🇱 Polski'
          ],
          changeLang: 'Paramètres > Préférences > Langue'
        },
        {
          id: 'settings-4',
          title: 'Sécurité',
          description: 'Protégez votre compte.',
          features: [
            'Changement de mot de passe',
            'Authentification à deux facteurs (2FA)',
            'Codes de récupération',
            'Historique des connexions'
          ]
        }
      ]
    },
    {
      id: 'payment',
      title: '💳 Paiements & Abonnement',
      icon: CreditCard,
      color: 'from-green-600 to-teal-600',
      steps: [
        {
          id: 'payment-1',
          title: 'Choisir votre plan',
          description: 'ReplyFast propose plusieurs plans adaptés à votre business.',
          plans: [
            'Gratuit - Essai 14 jours',
            'Starter - 29€/mois',
            'Pro - 79€/mois',
            'Enterprise - Sur mesure'
          ]
        },
        {
          id: 'payment-2',
          title: 'Paiement sécurisé Stripe',
          description: 'Payez par carte bancaire - aucun compte Stripe requis.',
          security: [
            'Paiement 100% sécurisé via Stripe',
            'Carte bancaire uniquement',
            'Pas de compte Stripe nécessaire',
            '3D Secure pour validation',
            'Annulation à tout moment'
          ]
        },
        {
          id: 'payment-3',
          title: 'Historique de paiement',
          description: 'Consultez tous vos paiements et factures.',
          access: 'Paramètres > Abonnement & Paiement > Historique'
        }
      ]
    },
    {
      id: 'tips',
      title: '💡 Conseils & Best Practices',
      icon: Zap,
      color: 'from-pink-500 to-rose-600',
      steps: [
        {
          id: 'tips-1',
          title: 'Optimiser les réponses IA',
          tips: [
            'Remplissez TOUT votre profil business (horaires, tarifs, services)',
            'Mettez à jour votre menu régulièrement',
            'Maintenez l\'inventaire à jour pour éviter fausses promesses',
            'Testez l\'IA avec des questions client typiques',
            'Prenez la main manuellement pour cas complexes'
          ]
        },
        {
          id: 'tips-2',
          title: 'Réduire les annulations',
          tips: [
            'Activez les rappels automatiques 24h avant',
            'Confirmez les RDV rapidement',
            'Soyez flexible pour les reports',
            'Analysez les raisons d\'annulation avec l\'IA',
            'Proposez des créneaux variés'
          ]
        },
        {
          id: 'tips-3',
          title: 'Augmenter votre CA',
          tips: [
            'Utilisez l\'assistant IA pour identifier vos meilleurs créneaux',
            'Optimisez vos tarifs selon la demande',
            'Proposez des services complémentaires',
            'Fidélisez avec des remises récurrents',
            'Analysez vos analytics hebdomadairement'
          ]
        },
        {
          id: 'tips-4',
          title: 'Utilisation mobile',
          tips: [
            'Activez le mode vocal pour utiliser en déplacement',
            'Géolocalisation pour calculs de distance',
            'Notifications push pour RDV urgents',
            'Interface optimisée tactile',
            'Fonctionne hors connexion (cache local)'
          ]
        }
      ]
    },
    {
      id: 'faq',
      title: '❓ FAQ',
      icon: Book,
      color: 'from-teal-500 to-cyan-600',
      faqs: [
        {
          q: 'Comment obtenir un WhatsApp Phone Number ID ?',
          a: 'Créez un compte Meta Business, ajoutez une app WhatsApp Business, configurez un numéro dans l\'app, et récupérez le Phone Number ID dans les paramètres.'
        },
        {
          q: 'L\'IA peut-elle se tromper ?',
          a: 'L\'IA est très fiable mais peut parfois mal interpréter. C\'est pourquoi vous gardez toujours le contrôle pour prendre la main manuellement si nécessaire.'
        },
        {
          q: 'Mes données sont-elles sécurisées ?',
          a: 'Oui ! Toutes vos données sont chiffrées, stockées sur des serveurs européens conformes RGPD, et ne sont jamais partagées avec des tiers.'
        },
        {
          q: 'Puis-je utiliser plusieurs numéros WhatsApp ?',
          a: 'Non, un compte ReplyFast = un Phone Number ID WhatsApp. Pour plusieurs numéros, créez plusieurs comptes ReplyFast.'
        },
        {
          q: 'Comment annuler mon abonnement ?',
          a: 'Paramètres > Abonnement > Annuler. Votre abonnement reste actif jusqu\'à la fin de la période payée.'
        },
        {
          q: 'Le mode vocal fonctionne-t-il sur tous les navigateurs ?',
          a: 'Le mode vocal nécessite un navigateur moderne (Chrome, Edge, Safari). Firefox a un support limité.'
        },
        {
          q: 'Puis-je exporter mes données ?',
          a: 'Oui, depuis Analytics vous pouvez exporter en CSV, PDF ou JSON à tout moment.'
        },
        {
          q: 'L\'autocomplétion d\'adresse ne fonctionne pas ?',
          a: 'Vérifiez que la clé Google Places API est configurée dans les variables d\'environnement. Contactez le support si le problème persiste.'
        }
      ]
    }
  ];

  const progressPercentage = Math.round(
    (completedSteps.length / tutorialSections.reduce((total, section) => total + (section.steps?.length || section.faqs?.length || 0), 0)) * 100
  );

  return (
    <div className="min-h-screen bg-dark">
      {/* Header fixe */}
      <div className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <Home className="w-5 h-5" />
                <span className="hidden md:inline">Dashboard</span>
              </button>
              <div className="w-px h-6 bg-white/10"></div>
              <div className="flex items-center gap-3">
                <Book className="w-8 h-8 text-accent" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Comment utiliser ReplyFast</h1>
                  <p className="text-xs text-gray-400">Guide complet d'utilisation</p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-gray-400">Progression</p>
                <p className="text-sm font-bold text-accent">{progressPercentage}%</p>
              </div>
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent to-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-3xl mb-8"
        >
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0">
              <PlayCircle className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-3">Bienvenue sur ReplyFast ! 🎉</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                ReplyFast est votre assistant business intelligent qui automatise vos conversations WhatsApp,
                gère vos rendez-vous, et vous donne des conseils personnalisés basés sur vos données réelles.
              </p>
              <p className="text-gray-400 text-sm">
                Ce guide vous accompagne pas à pas pour maîtriser toutes les fonctionnalités.
                Cliquez sur chaque section pour déplier le contenu et cochez les étapes au fur et à mesure !
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sections du tutoriel */}
        <div className="space-y-4">
          {tutorialSections.map((section, index) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const sectionSteps = section.steps || section.faqs || [];
            const sectionCompleted = sectionSteps.filter(s =>
              completedSteps.includes(s.id || `faq-${index}`)
            ).length;

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-2xl overflow-hidden"
              >
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white">{section.title}</h3>
                      <p className="text-sm text-gray-400">
                        {sectionCompleted}/{sectionSteps.length} complété
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                      {isActive ? (
                        <ChevronDown className="w-6 h-6 text-accent" />
                      ) : (
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Section content */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-6 space-y-6">
                        {/* FAQs */}
                        {section.faqs && section.faqs.map((faq, faqIndex) => (
                          <div key={faqIndex} className="glass p-5 rounded-xl">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-1">
                                <span className="text-accent text-xs font-bold">Q</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-white font-semibold mb-2">{faq.q}</h4>
                                <p className="text-gray-300 text-sm leading-relaxed">{faq.a}</p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Steps */}
                        {section.steps && section.steps.map((step, stepIndex) => {
                          const isCompleted = completedSteps.includes(step.id);

                          return (
                            <div key={step.id} className="glass p-5 rounded-xl">
                              <div className="flex items-start gap-4">
                                <button
                                  onClick={() => markAsCompleted(step.id)}
                                  className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isCompleted
                                      ? 'bg-accent border-accent'
                                      : 'border-gray-600 hover:border-accent'
                                  }`}
                                >
                                  {isCompleted && <CheckCircle className="w-5 h-5 text-white" />}
                                </button>
                                <div className="flex-1">
                                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                    {step.title}
                                    {isCompleted && <span className="text-xs text-accent">✓ Complété</span>}
                                  </h4>
                                  <p className="text-gray-300 text-sm mb-3">{step.description}</p>

                                  {/* Tips */}
                                  {step.tips && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
                                      <p className="text-yellow-400 text-xs font-semibold mb-2">💡 Conseils</p>
                                      <ul className="space-y-1">
                                        {step.tips.map((tip, i) => (
                                          <li key={i} className="text-yellow-200 text-xs flex items-start gap-2">
                                            <span className="text-yellow-400 mt-0.5">•</span>
                                            <span>{tip}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Lists */}
                                  {(step.steps || step.fields || step.features || step.actions || step.views ||
                                    step.methods || step.capabilities || step.questions || step.scenarios ||
                                    step.metrics || step.stats || step.formats || step.sizes || step.themes ||
                                    step.options || step.languages || step.plans || step.security || step.howTo) && (
                                    <div className="space-y-2">
                                      {(step.steps || step.fields || step.features || step.actions || step.views ||
                                        step.methods || step.capabilities || step.questions || step.scenarios ||
                                        step.metrics || step.stats || step.formats || step.sizes || step.themes ||
                                        step.options || step.languages || step.plans || step.security || step.howTo).map((item, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                          <ArrowRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                          <span className="text-gray-300 text-sm">{item}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Additional info blocks */}
                                  {step.currentBest && (
                                    <p className="text-blue-400 text-xs mt-2 italic">{step.currentBest}</p>
                                  )}
                                  {step.location && (
                                    <p className="text-gray-400 text-xs mt-2">📍 {step.location}</p>
                                  )}
                                  {step.changeLang && (
                                    <p className="text-gray-400 text-xs mt-2">🌍 {step.changeLang}</p>
                                  )}
                                  {step.access && (
                                    <p className="text-gray-400 text-xs mt-2">🔗 {step.access}</p>
                                  )}
                                  {step.privacy && (
                                    <p className="text-green-400 text-xs mt-2">🔒 {step.privacy}</p>
                                  )}
                                  {step.persistence && (
                                    <p className="text-cyan-400 text-xs mt-2">💾 {step.persistence}</p>
                                  )}

                                  {/* Examples */}
                                  {step.examples && (
                                    <div className="mt-3 space-y-1">
                                      <p className="text-xs text-gray-400 font-semibold">Exemples :</p>
                                      {step.examples.map((ex, i) => (
                                        <p key={i} className="text-xs text-gray-300 pl-3">{ex}</p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-3xl mt-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-3">Prêt à démarrer ? 🚀</h3>
          <p className="text-gray-400 mb-6">
            Vous avez maintenant toutes les clés pour maîtriser ReplyFast.
            Commencez par configurer WhatsApp et laissez l'IA faire le reste !
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => router.push('/settings')}
              className="px-6 py-3 bg-gradient-to-r from-accent to-primary rounded-xl text-white font-semibold hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Configurer maintenant
            </button>
            <button
              onClick={() => router.push('/ai-assistant')}
              className="px-6 py-3 glass rounded-xl text-white font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Bot className="w-5 h-5" />
              Parler à l'IA
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 glass rounded-xl text-white font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              Retour au Dashboard
            </button>
          </div>
        </motion.div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Besoin d'aide ? Contactez-nous à{' '}
            <a href="mailto:support@replyfast.ai" className="text-accent hover:underline">
              support@replyfast.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
