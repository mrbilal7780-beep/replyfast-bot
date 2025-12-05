// Système de traductions multilingue pour ReplyFast AI
// Support: Français, English, Español, Deutsch, Italiano, Português, العربية, 中文

export const translations = {
  // FRANÇAIS
  fr: {
    name: "Français",
    flag: "🇫🇷",
    common: {
      welcome: "Bienvenue",
      loading: "Chargement...",
      save: "Sauvegarder",
      cancel: "Annuler",
      delete: "Supprimer",
      edit: "Modifier",
      close: "Fermer",
      back: "Retour",
      next: "Suivant",
      search: "Rechercher",
      filter: "Filtrer",
      sort: "Trier",
      yes: "Oui",
      no: "Non",
      confirm: "Confirmer",
      error: "Erreur",
      success: "Succès"
    },
    nav: {
      conversations: "Conversations",
      appointments: "Smart RDV",
      menu: "Menu Manager",
      clients: "Clients",
      insights: "Market Insights",
      analytics: "Analytics",
      assistant: "Assistant IA",
      payments: "Paiements",
      settings: "Paramètres",
      logout: "Déconnexion"
    },
    settings: {
      title: "Paramètres",
      subtitle: "Gérez votre profil, entreprise, sécurité et paiements",
      saved: "Paramètres sauvegardés !",
      tabs: {
        profile: "Profil",
        business: "Entreprise",
        security: "Sécurité",
        payment: "Paiement",
        appearance: "Apparence"
      },
      profile: {
        title: "Informations personnelles",
        photo: "Photo de profil",
        changePhoto: "Modifier la photo",
        email: "Email",
        emailNote: "L'email ne peut pas être modifié",
        fullName: "Nom complet",
        phone: "Téléphone personnel"
      },
      appearance: {
        theme: "Thème de l'interface",
        dark: "Sombre",
        light: "Clair",
        notifications: "Notifications",
        notifEmail: "Notifications par email",
        notifRdv: "Rappels de rendez-vous",
        notifClients: "Nouveaux clients",
        language: "Langue",
        textSize: "Taille du texte",
        accessibility: "Accessibilité"
      },
      geolocation: {
        title: "Géolocalisation",
        subtitle: "Activez la géolocalisation pour des statistiques avancées",
        enable: "Activer la géolocalisation",
        permission: "Autorisation requise",
        permissionText: "ReplyFast AI demande l'accès à votre position pour calculer les distances clients et créer des zones de vente. Vos données sont chiffrées et jamais partagées.",
        privacy: "Politique de confidentialité",
        status: "Statut",
        enabled: "Activée",
        disabled: "Désactivée"
      }
    },
    landing: {
      tagline: "Intelligence artificielle de nouvelle génération",
      title1: "Votre commerce",
      title2: "ouvert 24/7",
      subtitle: "Pendant que vous dormez, notre IA travaille",
      cta: "1 mois d'essai gratuit",
      learnMore: "En savoir plus",
      noCard: "Annulation en un clic"
    },
    dashboard: {
      title: "Dashboard",
      welcome: "Bienvenue",
      activityOverview: "Voici un aperçu de votre activité",
      totalMessages: "Messages totaux",
      activeConversations: "Conversations actives",
      responseRate: "Taux de réponse",
      recentConversations: "Conversations récentes",
      noConversations: "Aucune conversation pour le moment",
      clickForMore: "Cliquez pour + d'infos",
      rename: "Renommer",
      viewConversation: "Voir la conversation",
      gotIt: "Compris !",
      modals: {
        messages: {
          title: "Messages Totaux",
          subtitle: "Suivi en temps réel de votre activité",
          currently: "Actuellement",
          messages: "messages",
          description: "Cette métrique représente le volume total de messages échangés avec vos clients via WhatsApp Business.",
          received: "Messages reçus",
          receivedDesc: "Questions, demandes de renseignements, confirmations de RDV",
          sent: "Messages envoyés",
          sentDesc: "Réponses automatiques de l'IA, confirmations, rappels",
          whyImportant: "Pourquoi c'est important ?",
          whyDesc: "Un volume élevé indique un fort engagement client et une bonne visibilité de votre entreprise. L'IA traite tous ces messages automatiquement, vous faisant gagner des heures de travail quotidien."
        },
        conversations: {
          title: "Conversations Actives",
          subtitle: "Clients en interaction avec votre IA",
          currently: "Actuellement",
          active: "conversations actives",
          description: "Ce chiffre représente le nombre de clients distincts qui ont échangé avec votre business récemment et dont la conversation est toujours ouverte.",
          definition: "Qu'est-ce qu'une conversation active ?",
          definitionDesc: "Une conversation devient active dès qu'un client vous envoie son premier message. Elle reste active tant que le client continue d'interagir (questions, RDV, commandes).",
          whyImportant: "Pourquoi c'est important ?",
          whyDesc: "Plus vous avez de conversations actives, plus votre base de clients engagés est large. Chaque conversation active est une opportunité de vente ou de fidélisation gérée par l'IA."
        },
        response: {
          title: "Taux de Réponse IA",
          subtitle: "Performance de votre assistant automatique",
          currently: "Actuellement",
          responseRate: "de réactivité",
          description: "Ce pourcentage mesure le rapport entre les messages que vous envoyez et ceux que vous recevez. Un taux > 100% signifie que votre IA envoie plus de messages que vous n'en recevez (suivi proactif, rappels).",
          interpretation: "Comment l'interpréter ?",
          high: "80-120%",
          highDesc: "Excellent équilibre : l'IA répond efficacement sans surcharger",
          medium: "50-80%",
          mediumDesc: "Bon niveau : l'IA traite la majorité des demandes",
          low: "< 50%",
          lowDesc: "À améliorer : vérifier la configuration de l'assistant IA",
          whyImportant: "Pourquoi c'est important ?",
          whyDesc: "Un taux de réponse élevé garantit que vos clients reçoivent toujours une réponse rapide, même la nuit ou le weekend. C'est la clé de la satisfaction client et de la conversion."
        }
      }
    }
  },

  // ENGLISH
  en: {
    name: "English",
    flag: "🇬🇧",
    common: {
      welcome: "Welcome",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      back: "Back",
      next: "Next",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      yes: "Yes",
      no: "No",
      confirm: "Confirm",
      error: "Error",
      success: "Success"
    },
    nav: {
      conversations: "Conversations",
      appointments: "Smart Appointments",
      menu: "Menu Manager",
      clients: "Clients",
      insights: "Market Insights",
      analytics: "Analytics",
      assistant: "AI Assistant",
      payments: "Payments",
      settings: "Settings",
      logout: "Logout"
    },
    settings: {
      title: "Settings",
      subtitle: "Manage your profile, business, security and payments",
      saved: "Settings saved!",
      tabs: {
        profile: "Profile",
        business: "Business",
        security: "Security",
        payment: "Payment",
        appearance: "Appearance"
      },
      profile: {
        title: "Personal Information",
        photo: "Profile photo",
        changePhoto: "Change photo",
        email: "Email",
        emailNote: "Email cannot be changed",
        fullName: "Full name",
        phone: "Personal phone"
      },
      appearance: {
        theme: "Interface theme",
        dark: "Dark",
        light: "Light",
        notifications: "Notifications",
        notifEmail: "Email notifications",
        notifRdv: "Appointment reminders",
        notifClients: "New clients",
        language: "Language",
        textSize: "Text size",
        accessibility: "Accessibility"
      },
      geolocation: {
        title: "Geolocation",
        subtitle: "Enable geolocation for advanced analytics",
        enable: "Enable geolocation",
        permission: "Permission required",
        permissionText: "ReplyFast AI requests access to your location to calculate client distances and create sales zones. Your data is encrypted and never shared.",
        privacy: "Privacy policy",
        status: "Status",
        enabled: "Enabled",
        disabled: "Disabled"
      }
    },
    landing: {
      tagline: "Next-generation artificial intelligence",
      title1: "Your business",
      title2: "open 24/7",
      subtitle: "While you sleep, our AI works",
      cta: "1 month free trial",
      learnMore: "Learn more",
      noCard: "Cancel anytime"
    },
    dashboard: {
      title: "Dashboard",
      welcome: "Welcome",
      activityOverview: "Here's an overview of your activity",
      totalMessages: "Total messages",
      activeConversations: "Active conversations",
      responseRate: "Response rate",
      recentConversations: "Recent conversations",
      noConversations: "No conversations yet",
      clickForMore: "Click for more info",
      rename: "Rename",
      viewConversation: "View conversation",
      gotIt: "Got it!",
      modals: {
        messages: {
          title: "Total Messages",
          subtitle: "Real-time activity tracking",
          currently: "Currently",
          messages: "messages",
          description: "This metric represents the total volume of messages exchanged with your customers via WhatsApp Business.",
          received: "Received messages",
          receivedDesc: "Questions, inquiries, appointment confirmations",
          sent: "Sent messages",
          sentDesc: "AI automatic responses, confirmations, reminders",
          whyImportant: "Why is this important?",
          whyDesc: "A high volume indicates strong customer engagement and good business visibility. AI processes all these messages automatically, saving you hours of daily work."
        },
        conversations: {
          title: "Active Conversations",
          subtitle: "Clients interacting with your AI",
          currently: "Currently",
          active: "active conversations",
          description: "This number represents the count of distinct customers who have recently exchanged with your business and whose conversation is still open.",
          definition: "What is an active conversation?",
          definitionDesc: "A conversation becomes active as soon as a customer sends their first message. It remains active as long as the customer continues to interact (questions, appointments, orders).",
          whyImportant: "Why is this important?",
          whyDesc: "The more active conversations you have, the larger your engaged customer base. Each active conversation is a sales or retention opportunity managed by AI."
        },
        response: {
          title: "AI Response Rate",
          subtitle: "Your automatic assistant performance",
          currently: "Currently",
          responseRate: "responsiveness",
          description: "This percentage measures the ratio between messages you send and those you receive. A rate > 100% means your AI sends more messages than you receive (proactive follow-up, reminders).",
          interpretation: "How to interpret it?",
          high: "80-120%",
          highDesc: "Excellent balance: AI responds effectively without overwhelming",
          medium: "50-80%",
          mediumDesc: "Good level: AI handles most requests",
          low: "< 50%",
          lowDesc: "Needs improvement: check AI assistant configuration",
          whyImportant: "Why is this important?",
          whyDesc: "A high response rate ensures your customers always receive a quick response, even at night or on weekends. It's the key to customer satisfaction and conversion."
        }
      }
    }
  },

  // ESPAÑOL
  es: {
    name: "Español",
    flag: "🇪🇸",
    common: {
      welcome: "Bienvenido",
      loading: "Cargando...",
      save: "Guardar",
      cancel: "Cancelar",
      delete: "Eliminar",
      edit: "Editar",
      close: "Cerrar",
      back: "Atrás",
      next: "Siguiente",
      search: "Buscar",
      filter: "Filtrar",
      sort: "Ordenar",
      yes: "Sí",
      no: "No",
      confirm: "Confirmar",
      error: "Error",
      success: "Éxito"
    },
    nav: {
      conversations: "Conversaciones",
      appointments: "Citas Inteligentes",
      menu: "Gestor de Menú",
      clients: "Clientes",
      insights: "Análisis de Mercado",
      analytics: "Analíticas",
      assistant: "Asistente IA",
      payments: "Pagos",
      settings: "Configuración",
      logout: "Cerrar sesión"
    },
    settings: {
      title: "Configuración",
      subtitle: "Gestiona tu perfil, negocio, seguridad y pagos",
      saved: "¡Configuración guardada!",
      tabs: {
        profile: "Perfil",
        business: "Negocio",
        security: "Seguridad",
        payment: "Pago",
        appearance: "Apariencia"
      },
      profile: {
        title: "Información personal",
        photo: "Foto de perfil",
        changePhoto: "Cambiar foto",
        email: "Correo",
        emailNote: "El correo no se puede cambiar",
        fullName: "Nombre completo",
        phone: "Teléfono personal"
      },
      appearance: {
        theme: "Tema de interfaz",
        dark: "Oscuro",
        light: "Claro",
        notifications: "Notificaciones",
        notifEmail: "Notificaciones por correo",
        notifRdv: "Recordatorios de citas",
        notifClients: "Nuevos clientes",
        language: "Idioma",
        textSize: "Tamaño de texto",
        accessibility: "Accesibilidad"
      },
      geolocation: {
        title: "Geolocalización",
        subtitle: "Activa la geolocalización para estadísticas avanzadas",
        enable: "Activar geolocalización",
        permission: "Permiso requerido",
        permissionText: "ReplyFast AI solicita acceso a tu ubicación para calcular distancias de clientes y crear zonas de ventas. Tus datos están cifrados y nunca se comparten.",
        privacy: "Política de privacidad",
        status: "Estado",
        enabled: "Activado",
        disabled: "Desactivado"
      }
    },
    landing: {
      tagline: "Inteligencia artificial de nueva generación",
      title1: "Tu negocio",
      title2: "abierto 24/7",
      subtitle: "Mientras duermes, nuestra IA trabaja",
      cta: "1 mes de prueba gratis",
      learnMore: "Saber más",
      noCard: "Cancela cuando quieras"
    }
  },

  // DEUTSCH
  de: {
    name: "Deutsch",
    flag: "🇩🇪",
    common: {
      welcome: "Willkommen",
      loading: "Laden...",
      save: "Speichern",
      cancel: "Abbrechen",
      delete: "Löschen",
      edit: "Bearbeiten",
      close: "Schließen",
      back: "Zurück",
      next: "Weiter",
      search: "Suchen",
      filter: "Filtern",
      sort: "Sortieren",
      yes: "Ja",
      no: "Nein",
      confirm: "Bestätigen",
      error: "Fehler",
      success: "Erfolg"
    },
    nav: {
      conversations: "Gespräche",
      appointments: "Smart Termine",
      menu: "Menü-Manager",
      clients: "Kunden",
      insights: "Markteinblicke",
      analytics: "Analytics",
      assistant: "KI-Assistent",
      payments: "Zahlungen",
      settings: "Einstellungen",
      logout: "Abmelden"
    },
    settings: {
      title: "Einstellungen",
      subtitle: "Verwalten Sie Ihr Profil, Geschäft, Sicherheit und Zahlungen",
      saved: "Einstellungen gespeichert!",
      tabs: {
        profile: "Profil",
        business: "Geschäft",
        security: "Sicherheit",
        payment: "Zahlung",
        appearance: "Erscheinungsbild"
      },
      profile: {
        title: "Persönliche Informationen",
        photo: "Profilbild",
        changePhoto: "Foto ändern",
        email: "E-Mail",
        emailNote: "E-Mail kann nicht geändert werden",
        fullName: "Vollständiger Name",
        phone: "Persönliche Telefon"
      },
      appearance: {
        theme: "Oberflächenthema",
        dark: "Dunkel",
        light: "Hell",
        notifications: "Benachrichtigungen",
        notifEmail: "E-Mail-Benachrichtigungen",
        notifRdv: "Terminerinnerungen",
        notifClients: "Neue Kunden",
        language: "Sprache",
        textSize: "Textgröße",
        accessibility: "Barrierefreiheit"
      },
      geolocation: {
        title: "Geolokalisierung",
        subtitle: "Aktivieren Sie die Geolokalisierung für erweiterte Analysen",
        enable: "Geolokalisierung aktivieren",
        permission: "Berechtigung erforderlich",
        permissionText: "ReplyFast AI fordert Zugriff auf Ihren Standort an, um Kundenentfernungen zu berechnen und Verkaufszonen zu erstellen. Ihre Daten sind verschlüsselt und werden niemals weitergegeben.",
        privacy: "Datenschutzrichtlinie",
        status: "Status",
        enabled: "Aktiviert",
        disabled: "Deaktiviert"
      }
    },
    landing: {
      tagline: "Künstliche Intelligenz der nächsten Generation",
      title1: "Ihr Geschäft",
      title2: "24/7 geöffnet",
      subtitle: "Während Sie schlafen, arbeitet unsere KI",
      cta: "1 Monat kostenlos testen",
      learnMore: "Mehr erfahren",
      noCard: "Jederzeit kündbar"
    }
  },

  // ITALIANO
  it: {
    name: "Italiano",
    flag: "🇮🇹",
    common: {
      welcome: "Benvenuto",
      loading: "Caricamento...",
      save: "Salva",
      cancel: "Annulla",
      delete: "Elimina",
      edit: "Modifica",
      close: "Chiudi",
      back: "Indietro",
      next: "Avanti",
      search: "Cerca",
      filter: "Filtra",
      sort: "Ordina",
      yes: "Sì",
      no: "No",
      confirm: "Conferma",
      error: "Errore",
      success: "Successo"
    },
    nav: {
      conversations: "Conversazioni",
      appointments: "Appuntamenti Smart",
      menu: "Gestore Menu",
      clients: "Clienti",
      insights: "Analisi di Mercato",
      analytics: "Analytics",
      assistant: "Assistente IA",
      payments: "Pagamenti",
      settings: "Impostazioni",
      logout: "Disconnetti"
    },
    settings: {
      title: "Impostazioni",
      subtitle: "Gestisci profilo, azienda, sicurezza e pagamenti",
      saved: "Impostazioni salvate!",
      tabs: {
        profile: "Profilo",
        business: "Azienda",
        security: "Sicurezza",
        payment: "Pagamento",
        appearance: "Aspetto"
      },
      profile: {
        title: "Informazioni personali",
        photo: "Foto profilo",
        changePhoto: "Cambia foto",
        email: "Email",
        emailNote: "L'email non può essere modificata",
        fullName: "Nome completo",
        phone: "Telefono personale"
      },
      appearance: {
        theme: "Tema interfaccia",
        dark: "Scuro",
        light: "Chiaro",
        notifications: "Notifiche",
        notifEmail: "Notifiche via email",
        notifRdv: "Promemoria appuntamenti",
        notifClients: "Nuovi clienti",
        language: "Lingua",
        textSize: "Dimensione testo",
        accessibility: "Accessibilità"
      },
      geolocation: {
        title: "Geolocalizzazione",
        subtitle: "Abilita la geolocalizzazione per analisi avanzate",
        enable: "Abilita geolocalizzazione",
        permission: "Permesso richiesto",
        permissionText: "ReplyFast AI richiede l'accesso alla tua posizione per calcolare le distanze dei clienti e creare zone di vendita. I tuoi dati sono crittografati e mai condivisi.",
        privacy: "Politica sulla privacy",
        status: "Stato",
        enabled: "Abilitato",
        disabled: "Disabilitato"
      }
    },
    landing: {
      tagline: "Intelligenza artificiale di nuova generazione",
      title1: "La tua attività",
      title2: "aperta 24/7",
      subtitle: "Mentre dormi, la nostra IA lavora",
      cta: "1 mese di prova gratuita",
      learnMore: "Scopri di più",
      noCard: "Annulla quando vuoi"
    }
  },

  // PORTUGUÊS
  pt: {
    name: "Português",
    flag: "🇵🇹",
    common: {
      welcome: "Bem-vindo",
      loading: "Carregando...",
      save: "Salvar",
      cancel: "Cancelar",
      delete: "Excluir",
      edit: "Editar",
      close: "Fechar",
      back: "Voltar",
      next: "Próximo",
      search: "Pesquisar",
      filter: "Filtrar",
      sort: "Ordenar",
      yes: "Sim",
      no: "Não",
      confirm: "Confirmar",
      error: "Erro",
      success: "Sucesso"
    },
    nav: {
      conversations: "Conversas",
      appointments: "Agendamentos Smart",
      menu: "Gestor de Menu",
      clients: "Clientes",
      insights: "Análise de Mercado",
      analytics: "Analytics",
      assistant: "Assistente IA",
      payments: "Pagamentos",
      settings: "Configurações",
      logout: "Sair"
    },
    settings: {
      title: "Configurações",
      subtitle: "Gerencie seu perfil, empresa, segurança e pagamentos",
      saved: "Configurações salvas!",
      tabs: {
        profile: "Perfil",
        business: "Empresa",
        security: "Segurança",
        payment: "Pagamento",
        appearance: "Aparência"
      },
      profile: {
        title: "Informações pessoais",
        photo: "Foto de perfil",
        changePhoto: "Alterar foto",
        email: "E-mail",
        emailNote: "O e-mail não pode ser alterado",
        fullName: "Nome completo",
        phone: "Telefone pessoal"
      },
      appearance: {
        theme: "Tema da interface",
        dark: "Escuro",
        light: "Claro",
        notifications: "Notificações",
        notifEmail: "Notificações por e-mail",
        notifRdv: "Lembretes de agendamentos",
        notifClients: "Novos clientes",
        language: "Idioma",
        textSize: "Tamanho do texto",
        accessibility: "Acessibilidade"
      },
      geolocation: {
        title: "Geolocalização",
        subtitle: "Ative a geolocalização para análises avançadas",
        enable: "Ativar geolocalização",
        permission: "Permissão necessária",
        permissionText: "ReplyFast AI solicita acesso à sua localização para calcular distâncias de clientes e criar zonas de vendas. Seus dados são criptografados e nunca compartilhados.",
        privacy: "Política de privacidade",
        status: "Status",
        enabled: "Ativado",
        disabled: "Desativado"
      }
    },
    landing: {
      tagline: "Inteligência artificial de nova geração",
      title1: "Seu negócio",
      title2: "aberto 24/7",
      subtitle: "Enquanto você dorme, nossa IA trabalha",
      cta: "1 mês de teste grátis",
      learnMore: "Saiba mais",
      noCard: "Cancele quando quiser"
    }
  },

  // ARABIC - العربية
  ar: {
    name: "العربية",
    flag: "🇸🇦",
    dir: "rtl", // Right-to-left
    common: {
      welcome: "مرحبا",
      loading: "جاري التحميل...",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      close: "إغلاق",
      back: "رجوع",
      next: "التالي",
      search: "بحث",
      filter: "تصفية",
      sort: "ترتيب",
      yes: "نعم",
      no: "لا",
      confirm: "تأكيد",
      error: "خطأ",
      success: "نجح"
    },
    nav: {
      conversations: "المحادثات",
      appointments: "المواعيد الذكية",
      menu: "مدير القائمة",
      clients: "العملاء",
      insights: "تحليلات السوق",
      analytics: "التحليلات",
      assistant: "المساعد الذكي",
      payments: "المدفوعات",
      settings: "الإعدادات",
      logout: "تسجيل الخروج"
    },
    settings: {
      title: "الإعدادات",
      subtitle: "إدارة الملف الشخصي والأعمال والأمان والمدفوعات",
      saved: "تم حفظ الإعدادات!",
      tabs: {
        profile: "الملف الشخصي",
        business: "الأعمال",
        security: "الأمان",
        payment: "الدفع",
        appearance: "المظهر"
      },
      profile: {
        title: "المعلومات الشخصية",
        photo: "صورة الملف الشخصي",
        changePhoto: "تغيير الصورة",
        email: "البريد الإلكتروني",
        emailNote: "لا يمكن تغيير البريد الإلكتروني",
        fullName: "الاسم الكامل",
        phone: "الهاتف الشخصي"
      },
      appearance: {
        theme: "مظهر الواجهة",
        dark: "داكن",
        light: "فاتح",
        notifications: "الإشعارات",
        notifEmail: "إشعارات البريد الإلكتروني",
        notifRdv: "تذكيرات المواعيد",
        notifClients: "عملاء جدد",
        language: "اللغة",
        textSize: "حجم النص",
        accessibility: "إمكانية الوصول"
      },
      geolocation: {
        title: "تحديد الموقع الجغرافي",
        subtitle: "تفعيل تحديد الموقع للتحليلات المتقدمة",
        enable: "تفعيل تحديد الموقع",
        permission: "إذن مطلوب",
        permissionText: "يطلب ReplyFast AI الوصول إلى موقعك لحساب مسافات العملاء وإنشاء مناطق المبيعات. بياناتك مشفرة ولا تتم مشاركتها أبدًا.",
        privacy: "سياسة الخصوصية",
        status: "الحالة",
        enabled: "مفعل",
        disabled: "معطل"
      }
    },
    landing: {
      tagline: "الذكاء الاصطناعي من الجيل القادم",
      title1: "عملك",
      title2: "مفتوح 24/7",
      subtitle: "بينما تنام، يعمل الذكاء الاصطناعي لدينا",
      cta: "شهر واحد تجربة مجانية",
      learnMore: "معرفة المزيد",
      noCard: "إلغاء في أي وقت"
    },
    dashboard: {
      title: "لوحة التحكم",
      welcome: "مرحبا",
      activityOverview: "هذه نظرة عامة على نشاطك",
      totalMessages: "إجمالي الرسائل",
      activeConversations: "المحادثات النشطة",
      responseRate: "معدل الاستجابة",
      recentConversations: "المحادثات الأخيرة",
      noConversations: "لا توجد محادثات حتى الآن",
      clickForMore: "انقر لمزيد من المعلومات",
      rename: "إعادة تسمية",
      viewConversation: "عرض المحادثة",
      gotIt: "فهمت !",
      modals: {
        messages: {
          title: "إجمالي الرسائل",
          subtitle: "تتبع النشاط في الوقت الفعلي",
          currently: "حاليا",
          messages: "رسائل",
          description: "يمثل هذا المقياس الحجم الإجمالي للرسائل المتبادلة مع عملائك عبر واتساب للأعمال.",
          received: "الرسائل المستلمة",
          receivedDesc: "الأسئلة والاستفسارات وتأكيدات المواعيد",
          sent: "الرسائل المرسلة",
          sentDesc: "الردود التلقائية للذكاء الاصطناعي والتأكيدات والتذكيرات",
          whyImportant: "لماذا هذا مهم؟",
          whyDesc: "يشير الحجم الكبير إلى تفاعل قوي مع العملاء ورؤية جيدة للأعمال. يعالج الذكاء الاصطناعي كل هذه الرسائل تلقائيًا، مما يوفر لك ساعات من العمل اليومي."
        },
        conversations: {
          title: "المحادثات النشطة",
          subtitle: "العملاء الذين يتفاعلون مع الذكاء الاصطناعي الخاص بك",
          currently: "حاليا",
          active: "محادثات نشطة",
          description: "يمثل هذا الرقم عدد العملاء المميزين الذين تبادلوا مؤخرًا مع عملك والذين لا تزال محادثتهم مفتوحة.",
          definition: "ما هي المحادثة النشطة؟",
          definitionDesc: "تصبح المحادثة نشطة بمجرد أن يرسل العميل رسالته الأولى. تظل نشطة طالما يستمر العميل في التفاعل (أسئلة، مواعيد، طلبات).",
          whyImportant: "لماذا هذا مهم؟",
          whyDesc: "كلما زادت المحادثات النشطة لديك، زادت قاعدة عملائك المشاركين. كل محادثة نشطة هي فرصة مبيعات أو احتفاظ يديرها الذكاء الاصطناعي."
        },
        response: {
          title: "معدل استجابة الذكاء الاصطناعي",
          subtitle: "أداء مساعدك التلقائي",
          currently: "حاليا",
          responseRate: "من الاستجابة",
          description: "تقيس هذه النسبة المئوية العلاقة بين الرسائل التي ترسلها والرسائل التي تستقبلها. معدل > 100٪ يعني أن الذكاء الاصطناعي يرسل رسائل أكثر مما تتلقى (متابعة استباقية، تذكيرات).",
          interpretation: "كيف تفسرها؟",
          high: "80-120٪",
          highDesc: "توازن ممتاز: الذكاء الاصطناعي يستجيب بفعالية دون إرهاق",
          medium: "50-80٪",
          mediumDesc: "مستوى جيد: الذكاء الاصطناعي يعالج معظم الطلبات",
          low: "< 50٪",
          lowDesc: "يحتاج تحسين: تحقق من تكوين المساعد الذكي",
          whyImportant: "لماذا هذا مهم؟",
          whyDesc: "يضمن معدل الاستجابة العالي حصول عملائك دائمًا على رد سريع، حتى في الليل أو في عطلات نهاية الأسبوع. إنه مفتاح رضا العملاء والتحويل."
        }
      }
    }
  },

  // CHINESE - 中文
  zh: {
    name: "中文",
    flag: "🇨🇳",
    common: {
      welcome: "欢迎",
      loading: "加载中...",
      save: "保存",
      cancel: "取消",
      delete: "删除",
      edit: "编辑",
      close: "关闭",
      back: "返回",
      next: "下一步",
      search: "搜索",
      filter: "筛选",
      sort: "排序",
      yes: "是",
      no: "否",
      confirm: "确认",
      error: "错误",
      success: "成功"
    },
    nav: {
      conversations: "对话",
      appointments: "智能预约",
      menu: "菜单管理",
      clients: "客户",
      insights: "市场洞察",
      analytics: "分析",
      assistant: "AI助手",
      payments: "支付",
      settings: "设置",
      logout: "登出"
    },
    settings: {
      title: "设置",
      subtitle: "管理您的个人资料、企业、安全和支付",
      saved: "设置已保存！",
      tabs: {
        profile: "个人资料",
        business: "企业",
        security: "安全",
        payment: "支付",
        appearance: "外观"
      },
      profile: {
        title: "个人信息",
        photo: "头像",
        changePhoto: "更改头像",
        email: "邮箱",
        emailNote: "邮箱无法更改",
        fullName: "全名",
        phone: "个人电话"
      },
      appearance: {
        theme: "界面主题",
        dark: "深色",
        light: "浅色",
        notifications: "通知",
        notifEmail: "邮件通知",
        notifRdv: "预约提醒",
        notifClients: "新客户",
        language: "语言",
        textSize: "文字大小",
        accessibility: "辅助功能"
      },
      geolocation: {
        title: "地理定位",
        subtitle: "启用地理定位以获得高级分析",
        enable: "启用地理定位",
        permission: "需要权限",
        permissionText: "ReplyFast AI 请求访问您的位置以计算客户距离并创建销售区域。您的数据已加密且永不共享。",
        privacy: "隐私政策",
        status: "状态",
        enabled: "已启用",
        disabled: "已禁用"
      }
    },
    landing: {
      tagline: "下一代人工智能",
      title1: "您的业务",
      title2: "24/7开放",
      subtitle: "当您睡觉时，我们的AI在工作",
      cta: "1个月免费试用",
      learnMore: "了解更多",
      noCard: "随时取消"
    }
  }
};

// Fonction pour obtenir la traduction
export function t(locale, key) {
  const keys = key.split('.');
  let value = translations[locale] || translations['fr'];

  for (const k of keys) {
    value = value[k];
    if (!value) return key; // Retourne la clé si traduction manquante
  }

  return value;
}

// Langues disponibles
export const availableLanguages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
];

// Détecter la langue du navigateur
export function detectBrowserLanguage() {
  if (typeof window === 'undefined') return 'fr';

  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0]; // 'en-US' -> 'en'

  // Vérifier si la langue est supportée
  if (availableLanguages.find(l => l.code === langCode)) {
    return langCode;
  }

  return 'fr'; // Fallback
}
