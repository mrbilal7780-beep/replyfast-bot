import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

export default function GuidedTutorial({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu le tutoriel
    const hasSeenTutorial = localStorage.getItem('replyfast_tutorial_completed');
    if (!hasSeenTutorial) {
      // Afficher après un court délai pour laisser le dashboard se charger
      setTimeout(() => setShowTutorial(true), 1500);
    }
  }, []);

  const tutorialSteps = [
    {
      title: 'Bienvenue sur ReplyFast AI',
      description: 'Nous allons vous guider à travers les fonctionnalités principales de votre nouveau tableau de bord. Ce tutoriel ne prendra que 2 minutes.',
      icon: '👋',
      highlight: null
    },
    {
      title: 'Connectez votre WhatsApp Business',
      description: 'Cliquez sur le bouton "Connecter WhatsApp" dans le menu de gauche pour intégrer votre compte WhatsApp Business. C\'est la première étape essentielle.',
      icon: '💬',
      highlight: 'whatsapp-button'
    },
    {
      title: 'Gérez vos conversations',
      description: 'Toutes vos conversations clients apparaîtront dans l\'onglet "Messages". L\'IA répondra automatiquement, mais vous pouvez intervenir à tout moment.',
      icon: '💬',
      highlight: 'messages-section'
    },
    {
      title: 'Gérez vos rendez-vous',
      description: 'L\'onglet "Rendez-vous" vous permet de visualiser tous vos rendez-vous. L\'IA peut même les planifier automatiquement pour vous.',
      icon: '📅',
      highlight: 'appointments-section'
    },
    {
      title: 'Suivez vos performances',
      description: 'Consultez vos analytics pour voir l\'impact de ReplyFast AI sur votre business : taux de réponse, clients actifs, tendances...',
      icon: '📊',
      highlight: 'analytics-section'
    },
    {
      title: 'Personnalisez votre Assistant IA',
      description: 'Utilisez l\'Assistant IA (icône robot) pour obtenir des conseils personnalisés et optimiser votre utilisation de la plateforme.',
      icon: '🤖',
      highlight: 'ai-assistant'
    },
    {
      title: 'C\'est parti!',
      description: 'Vous êtes prêt à utiliser ReplyFast AI. N\'hésitez pas à explorer toutes les fonctionnalités. Notre support est disponible 24/7 si vous avez des questions.',
      icon: '🚀',
      highlight: null
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTutorial = () => {
    localStorage.setItem('replyfast_tutorial_completed', 'true');
    setShowTutorial(false);
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('replyfast_tutorial_completed', 'true');
    setShowTutorial(false);
    if (onSkip) onSkip();
  };

  if (!showTutorial) return null;

  const step = tutorialSteps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={handleSkip}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass max-w-2xl w-full p-8 rounded-3xl relative"
        >
          {/* Bouton fermer */}
          <button
            onClick={handleSkip}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
            title="Passer le tutoriel"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Progression */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                Étape {currentStep + 1} sur {tutorialSteps.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-sm text-gray-400 hover:text-accent transition-colors"
              >
                Passer le tutoriel
              </button>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Contenu */}
          <div className="text-center mb-8">
            <div className="text-7xl mb-4">{step.icon}</div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {step.title}
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                currentStep === 0
                  ? 'opacity-30 cursor-not-allowed'
                  : 'glass hover:scale-105'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Précédent
            </button>

            <div className="flex gap-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-primary w-6'
                      : index < currentStep
                      ? 'bg-accent'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {currentStep === tutorialSteps.length - 1 ? (
              <button
                onClick={completeTutorial}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-full hover:scale-105 transition-transform font-semibold"
              >
                Terminer
                <Check className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-full hover:scale-105 transition-transform font-semibold"
              >
                Suivant
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
