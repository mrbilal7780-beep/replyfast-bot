// Système d'accessibilité pour utilisateurs malvoyants et aveugles
// Conforme aux standards WCAG 2.1 AAA

export const ACCESSIBILITY_STORAGE_KEY = 'replyfast_accessibility';
export const TEXT_SIZE_STORAGE_KEY = 'replyfast_text_size';
export const VOICE_MODE_STORAGE_KEY = 'replyfast_voice_mode';

// Tailles de texte disponibles
export const TEXT_SIZES = {
  SMALL: { label: 'Petit', value: 'small', scale: 0.875 },
  NORMAL: { label: 'Normal', value: 'normal', scale: 1 },
  LARGE: { label: 'Grand', value: 'large', scale: 1.125 },
  XLARGE: { label: 'Très grand', value: 'xlarge', scale: 1.25 },
  XXLARGE: { label: 'Extra grand', value: 'xxlarge', scale: 1.5 }
};

/**
 * Vérifier si Web Speech API est disponible
 */
export function isSpeechSynthesisAvailable() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSpeechRecognitionAvailable() {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

/**
 * Appliquer la taille de texte
 */
export function applyTextSize(size) {
  if (typeof document === 'undefined') return;

  const scale = TEXT_SIZES[size.toUpperCase()]?.scale || 1;
  document.documentElement.style.fontSize = `${16 * scale}px`;
  localStorage.setItem(TEXT_SIZE_STORAGE_KEY, size);
}

/**
 * Obtenir la taille de texte actuelle
 */
export function getTextSize() {
  if (typeof window === 'undefined') return 'normal';
  return localStorage.getItem(TEXT_SIZE_STORAGE_KEY) || 'normal';
}

/**
 * Classe pour gérer la synthèse vocale (lecture de contenu)
 */
export class VoiceReader {
  constructor(options = {}) {
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.voice = null;
    this.rate = options.rate || 1.0;
    this.pitch = options.pitch || 1.0;
    this.volume = options.volume || 1.0;
    this.lang = options.lang || 'fr-FR';
    this.isReading = false;
    this.queue = [];

    // Charger les voix disponibles
    this.loadVoices();

    // Les voix peuvent prendre du temps à charger
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  loadVoices() {
    const voices = this.synth.getVoices();
    // Préférer une voix française si disponible
    this.voice = voices.find(v => v.lang === this.lang) || voices[0];
  }

  speak(text, options = {}) {
    if (!text || !this.synth) return;

    // Annuler toute lecture en cours si demandé
    if (options.interrupt) {
      this.stop();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.rate = options.rate || this.rate;
    utterance.pitch = options.pitch || this.pitch;
    utterance.volume = options.volume || this.volume;
    utterance.lang = this.lang;

    utterance.onstart = () => {
      this.isReading = true;
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.isReading = false;
      if (options.onEnd) options.onEnd();

      // Lire le prochain élément de la queue si disponible
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        this.speak(next.text, next.options);
      }
    };

    utterance.onerror = (error) => {
      console.error('Erreur de synthèse vocale:', error);
      this.isReading = false;
      if (options.onError) options.onError(error);
    };

    this.utterance = utterance;
    this.synth.speak(utterance);
  }

  speakQueue(text, options = {}) {
    if (this.isReading) {
      this.queue.push({ text, options });
    } else {
      this.speak(text, options);
    }
  }

  pause() {
    if (this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  stop() {
    this.synth.cancel();
    this.queue = [];
    this.isReading = false;
  }

  setRate(rate) {
    this.rate = rate;
  }

  setPitch(pitch) {
    this.pitch = pitch;
  }

  setVolume(volume) {
    this.volume = volume;
  }

  setLanguage(lang) {
    this.lang = lang;
    this.loadVoices();
  }
}

/**
 * Classe pour gérer la reconnaissance vocale (commandes vocales)
 */
export class VoiceRecognition {
  constructor(options = {}) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech Recognition not available');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = options.lang || 'fr-FR';
    this.recognition.continuous = options.continuous !== false;
    this.recognition.interimResults = options.interimResults || false;
    this.recognition.maxAlternatives = 1;

    this.isListening = false;
    this.commands = new Map();
    this.onResultCallback = null;

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('🎤 Reconnaissance vocale démarrée');
    };

    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.toLowerCase().trim();

      console.log('🗣️ Transcription:', transcript);

      // Exécuter les commandes enregistrées
      this.executeCommands(transcript);

      // Callback personnalisé
      if (this.onResultCallback) {
        this.onResultCallback(transcript, result[0].confidence);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('❌ Erreur reconnaissance vocale:', event.error);

      // Redémarrer automatiquement en cas d'erreur de réseau
      if (event.error === 'network' && this.recognition.continuous) {
        setTimeout(() => this.start(), 1000);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('🎤 Reconnaissance vocale arrêtée');

      // Redémarrer automatiquement si le mode continu est activé
      if (this.recognition.continuous) {
        setTimeout(() => this.start(), 500);
      }
    };
  }

  registerCommand(trigger, callback) {
    this.commands.set(trigger.toLowerCase(), callback);
  }

  registerCommands(commandsMap) {
    Object.entries(commandsMap).forEach(([trigger, callback]) => {
      this.registerCommand(trigger, callback);
    });
  }

  executeCommands(transcript) {
    for (const [trigger, callback] of this.commands.entries()) {
      if (transcript.includes(trigger)) {
        console.log('✅ Commande détectée:', trigger);
        callback(transcript);
        break;
      }
    }
  }

  onResult(callback) {
    this.onResultCallback = callback;
  }

  start() {
    if (!this.isListening) {
      try {
        this.recognition.start();
      } catch (error) {
        console.error('Erreur démarrage reconnaissance:', error);
      }
    }
  }

  stop() {
    if (this.isListening) {
      this.recognition.stop();
    }
  }

  setLanguage(lang) {
    this.recognition.lang = lang;
  }
}

/**
 * Gestionnaire d'accessibilité principal
 */
export class AccessibilityManager {
  constructor(options = {}) {
    this.enabled = false;
    this.textSize = getTextSize();
    this.voiceMode = false;
    this.reader = null;
    this.recognition = null;
    this.autoReadEnabled = false;

    // Charger les préférences sauvegardées
    this.loadPreferences();

    if (options.autoInit) {
      this.initialize();
    }
  }

  loadPreferences() {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
      if (saved) {
        const prefs = JSON.parse(saved);
        this.enabled = prefs.enabled || false;
        this.voiceMode = prefs.voiceMode || false;
        this.autoReadEnabled = prefs.autoRead || false;
      }

      // Appliquer la taille de texte sauvegardée
      applyTextSize(this.textSize);
    } catch (error) {
      console.error('Erreur chargement préférences accessibilité:', error);
    }
  }

  savePreferences() {
    if (typeof window === 'undefined') return;

    const prefs = {
      enabled: this.enabled,
      voiceMode: this.voiceMode,
      autoRead: this.autoReadEnabled
    };

    localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(prefs));
  }

  initialize() {
    if (!isSpeechSynthesisAvailable()) {
      console.warn('⚠️ Synthèse vocale non disponible');
      return;
    }

    // Initialiser le lecteur vocal
    this.reader = new VoiceReader({
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      lang: 'fr-FR'
    });

    // Initialiser la reconnaissance vocale si disponible
    if (isSpeechRecognitionAvailable()) {
      this.recognition = new VoiceRecognition({
        lang: 'fr-FR',
        continuous: true,
        interimResults: false
      });

      this.setupDefaultCommands();
    }

    this.enabled = true;
    this.savePreferences();
  }

  setupDefaultCommands() {
    if (!this.recognition) return;

    this.recognition.registerCommands({
      'hey replyfast': () => this.reader?.speak('Oui, je vous écoute'),
      'lire la page': () => this.readCurrentPage(),
      'arrêter la lecture': () => this.reader?.stop(),
      'aller au menu': () => window.location.href = '/dashboard',
      'aller aux conversations': () => window.location.href = '/dashboard',
      'aller aux rendez-vous': () => window.location.href = '/appointments',
      'aller aux clients': () => window.location.href = '/clients',
      'aller aux paramètres': () => window.location.href = '/settings',
      'aide': () => this.reader?.speak('Vous pouvez dire: lire la page, arrêter la lecture, aller au menu, aller aux conversations, aller aux rendez-vous, aller aux clients, ou aller aux paramètres'),
    });
  }

  enableVoiceMode() {
    if (!this.reader) {
      this.initialize();
    }

    this.voiceMode = true;

    if (this.recognition) {
      this.recognition.start();
    }

    this.reader?.speak('Mode vocal activé. Dites "Hey ReplyFast" suivi de votre commande, ou dites "aide" pour connaître les commandes disponibles.');
    this.savePreferences();
  }

  disableVoiceMode() {
    this.voiceMode = false;
    this.reader?.stop();

    if (this.recognition) {
      this.recognition.stop();
    }

    this.savePreferences();
  }

  setTextSize(size) {
    this.textSize = size;
    applyTextSize(size);
  }

  readText(text) {
    if (!this.reader) {
      this.initialize();
    }

    this.reader?.speak(text, { interrupt: true });
  }

  readCurrentPage() {
    if (!this.reader) return;

    // Lire le titre de la page
    const title = document.querySelector('h1');
    if (title) {
      this.reader.speak(title.textContent, { interrupt: true });
    }

    // Lire le contenu principal
    const mainContent = document.querySelector('main') || document.querySelector('.main-content') || document.body;
    const textContent = this.extractReadableText(mainContent);

    if (textContent) {
      this.reader.speakQueue(textContent);
    }
  }

  extractReadableText(element) {
    if (!element) return '';

    // Exclure les éléments cachés et scripts
    const excludedTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG'];
    let text = '';

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          if (excludedTags.includes(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          if (parent.offsetParent === null) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    while (walker.nextNode()) {
      const nodeText = walker.currentNode.textContent.trim();
      if (nodeText) {
        text += nodeText + '. ';
      }
    }

    return text;
  }

  destroy() {
    this.disableVoiceMode();
    this.reader = null;
    this.recognition = null;
    this.enabled = false;
  }
}

// Instance globale (singleton)
let globalAccessibilityManager = null;

export function getAccessibilityManager() {
  if (typeof window === 'undefined') return null;

  if (!globalAccessibilityManager) {
    globalAccessibilityManager = new AccessibilityManager({ autoInit: false });
  }

  return globalAccessibilityManager;
}
