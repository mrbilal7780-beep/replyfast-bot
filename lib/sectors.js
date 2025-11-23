export const SECTORS = {
  // TIER 1: GOLD MINE
  coiffure: {
    id: 'coiffure',
    name: 'Salon de Coiffure / Barbier',
    emoji: '💇',
    tier: 1,
    features: ['rdv', 'tarifs', 'rappels', 'fidélisation'],
    promptContext: 'Tu es l\'assistant d\'un salon de coiffure. Tu gères les prises de rendez-vous, les tarifs des prestations, et tu réponds aux questions sur les services disponibles.',
    rdvEnabled: true,
    menuEnabled: false,
    marketInsights: {
      prixMoyen: '35€',
      heuresPointe: ['Samedi 10h-14h', 'Mercredi 18h-20h'],
      tauxFidelisation: '68%',
      tempsAttenteMoyen: '15 min'
    }
  },
  
  beaute: {
    id: 'beaute',
    name: 'Institut de Beauté / Esthétique',
    emoji: '💅',
    tier: 1,
    features: ['rdv', 'packages', 'tarifs', 'fidélisation'],
    promptContext: 'Tu es l\'assistant d\'un institut de beauté. Tu gères les rendez-vous pour soins du visage, manucure, épilation, etc. Tu proposes des packages et des offres spéciales.',
    rdvEnabled: true,
    menuEnabled: false,
    marketInsights: {
      prixMoyen: '55€',
      heuresPointe: ['Samedi toute la journée', 'Vendredi 16h-20h'],
      tauxFidelisation: '72%',
      tempsAttenteMoyen: '10 min'
    }
  },

  medical: {
    id: 'medical',
    name: 'Cabinet Médical (Généraliste, Dentiste, Kiné)',
    emoji: '🏥',
    tier: 1,
    features: ['rdv', 'urgences', 'rappels', 'annulations'],
    promptContext: 'Tu es l\'assistant d\'un cabinet médical. Tu gères les rendez-vous, les urgences, et tu donnes des informations pratiques. Tu es professionnel et rassurant.',
    rdvEnabled: true,
    menuEnabled: false,
    marketInsights: {
      prixMoyen: 'Consultation: 25-60€',
      heuresPointe: ['Lundi 8h-10h', 'Vendredi 14h-18h'],
      tauxFidelisation: '85%',
      tempsAttenteMoyen: '20 min'
    }
  },

  sport_club: {
    id: 'sport_club',
    name: 'Club de Sport (Foot, Basket, Tennis, Rugby)',
    emoji: '⚽',
    tier: 1,
    features: ['inscriptions', 'cotisations', 'horaires', 'infos_cours'],
    promptContext: 'Tu es l\'assistant d\'un club de sport. Tu donnes des infos sur les inscriptions, les cotisations, les horaires d\'entraînement, et tu réponds aux questions des parents et sportifs.',
    rdvEnabled: false,
    menuEnabled: false,
    marketInsights: {
      cotisationMoyenne: '250€/an',
      heuresPointe: ['Mercredi 14h-18h', 'Samedi 9h-12h'],
      tauxInscription: '45%',
      tempsReponse: '2h'
    }
  },

  fitness: {
    id: 'fitness',
    name: 'Salle de Sport / Fitness / CrossFit / Boxing',
    emoji: '🥊',
    tier: 1,
    features: ['inscriptions', 'cours', 'abonnements', 'planning'],
    promptContext: 'Tu es l\'assistant d\'une salle de sport. Tu gères les inscriptions, les cours collectifs, les abonnements, et tu motives les membres.',
    rdvEnabled: true,
    menuEnabled: false,
    marketInsights: {
      abonnementMoyen: '45€/mois',
      heuresPointe: ['Lundi-Jeudi 18h-20h', 'Samedi 10h-12h'],
      tauxFidelisation: '58%',
      tempsAttenteMoyen: '5 min'
    }
  },

  // TIER 2: TRÈS RENTABLE
  restaurant: {
    id: 'restaurant',
    name: 'Restaurant / Bistro',
    emoji: '🍽️',
    tier: 2,
    features: ['reservations', 'menu', 'commandes', 'allergies'],
    promptContext: 'Tu es l\'assistant d\'un restaurant. Tu gères les réservations, tu présentes le menu, tu prends des commandes, et tu réponds aux questions sur les allergènes.',
    rdvEnabled: true,
    menuEnabled: true,
    marketInsights: {
      ticketMoyen: '32€',
      heuresPointe: ['Vendredi-Samedi 19h-22h', 'Dimanche 12h-14h'],
      tauxReservation: '65%',
      tempsAttenteMoyen: '30 min'
    }
  },

  cafe: {
    id: 'cafe',
    name: 'Café / Boulangerie / Salon de Thé',
    emoji: '☕',
    tier: 2,
    features: ['commandes', 'menu', 'horaires', 'evenements'],
    promptContext: 'Tu es l\'assistant d\'un café/boulangerie. Tu prends des commandes, tu présentes les produits, et tu donnes des infos sur les horaires et événements.',
    rdvEnabled: false,
    menuEnabled: true,
    marketInsights: {
      ticketMoyen: '8€',
      heuresPointe: ['Matin 7h-9h', 'Pause déjeuner 12h-14h'],
      tauxFidelisation: '78%',
      tempsAttenteMoyen: '5 min'
    }
  },

  hotel: {
    id: 'hotel',
    name: 'Hôtel / Chambre d\'hôtes',
    emoji: '🏨',
    tier: 2,
    features: ['reservations', 'disponibilites', 'services', 'tarifs'],
    promptContext: 'Tu es l\'assistant d\'un hôtel. Tu gères les réservations, tu donnes les disponibilités, les tarifs, et tu présentes les services (spa, restaurant, etc.).',
    rdvEnabled: true,
    menuEnabled: false,
    marketInsights: {
      prixNuitMoyen: '95€',
      tauxOccupation: '72%',
      saisonHaute: 'Juillet-Août, Décembre',
      tempsReponse: '1h'
    }
  },

  garage: {
    id: 'garage',
    name: 'Garage / Mécanicien',
    emoji: '🚗',
    tier: 2,
    features: ['rdv', 'devis', 'urgences', 'entretien'],
    promptContext: 'Tu es l\'assistant d\'un garage automobile. Tu gères les rendez-vous pour réparations et entretien, tu donnes des estimations de prix, et tu gères les urgences.',
    rdvEnabled: true,
    menuEnabled: false,
    marketInsights: {
      prixMoyen: '180€/intervention',
      heuresPointe: ['Samedi matin', 'Avant vacances'],
      tauxFidelisation: '65%',
      tempsAttenteMoyen: '2 jours'
    }
  },

  immobilier: {
    id: 'immobilier',
    name: 'Agent Immobilier / Agence',
    emoji: '🏠',
    tier: 2,
    features: ['visites', 'biens', 'estimations', 'rdv'],
    promptContext: 'Tu es l\'assistant d\'une agence immobilière. Tu organises des visites, tu donnes des infos sur les biens disponibles, et tu prends des rendez-vous avec les agents.',
    rdvEnabled: true,
    menuEnabled: false,
    marketInsights: {
      commissionMoyenne: '5% du prix de vente',
      tempsVenteMoyen: '90 jours',
      tauxConversion: '12%',
      heuresPointe: 'Samedi toute la journée'
    }
  },

  // TIER 3: VOLUME MASSIF
  yoga: {
    id: 'yoga',
    name: 'Studio de Yoga / Pilates / Danse',
    emoji: '🧘',
    tier: 3,
    features: ['cours', 'inscriptions', 'planning', 'abonnements'],
    promptContext: 'Tu es l\'assistant d\'un studio de yoga/pilates. Tu gères les inscriptions aux cours, le planning, les abonnements, et tu donnes des conseils sur les cours adaptés.',
    rdvEnabled: true,
    menuEnabled: false,
    marketInsights: {
      coursMoyen: '15€',
      heuresPointe: ['Mardi-Jeudi 18h-20h', 'Samedi 10h-12h'],
      tauxFidelisation: '70%',
      tempsReponse: '30 min'
    }
  },

  veterinaire: {
    id: 'veterinaire',
    name: 'Vétérinaire / Toiletteur',
    emoji: '🐕',
    tier: 3,
    features: ['rdv', 'urgences', 'vaccins', 'tarifs'],
    promptContext: 'Tu es l\'assistant d\'un cabinet vétérinaire. Tu gères les rendez-vous, les urgences, les rappels de vaccins, et tu rassures les propriétaires d\'animaux.',
    rdvEnabled: true,
    menuEnabled: false,
    marketInsights: {
      consultationMoyenne: '50€',
      heuresPointe: ['Samedi matin', 'Mercredi après-midi'],
      tauxFidelisation: '82%',
      tempsAttenteMoyen: '15 min'
    }
  },

  ecole: {
    id: 'ecole',
    name: 'École Privée / Cours Particuliers',
    emoji: '👨‍🏫',
    tier: 3,
    features: ['inscriptions', 'horaires', 'absences', 'tarifs'],
    promptContext: 'Tu es l\'assistant d\'une école ou d\'un centre de cours particuliers. Tu gères les inscriptions, les horaires, les absences, et tu réponds aux questions des parents.',
    rdvEnabled: true,
    menuEnabled: false,
    marketInsights: {
      coursMoyen: '35€/heure',
      heuresPointe: ['Mercredi', 'Samedi matin'],
      tauxInscription: '55%',
      tempsReponse: '2h'
    }
  },

  spectacle: {
    id: 'spectacle',
    name: 'Salle de Spectacle / Cinéma / Théâtre',
    emoji: '🎭',
    tier: 3,
    features: ['reservations', 'seances', 'groupes', 'tarifs'],
    promptContext: 'Tu es l\'assistant d\'une salle de spectacle. Tu gères les réservations, tu donnes les infos sur les séances/spectacles, et tu gères les réservations de groupes.',
    rdvEnabled: true,
    menuEnabled: false,
    marketInsights: {
      ticketMoyen: '12€',
      heuresPointe: ['Vendredi-Samedi soir', 'Mercredi après-midi'],
      tauxOccupation: '68%',
      tempsReponse: '1h'
    }
  },

  coach: {
    id: 'coach',
    name: 'Coach Sportif Indépendant',
    emoji: '🏋️',
    tier: 3,
    features: ['rdv', 'programmes', 'suivis', 'tarifs'],
    promptContext: 'Tu es l\'assistant d\'un coach sportif. Tu gères les rendez-vous, tu présentes les programmes d\'entraînement, et tu assures le suivi des clients.',
    rdvEnabled: true,
    menuEnabled: false,
    marketInsights: {
      seanceMoyenne: '50€',
      heuresPointe: ['Matin 6h-8h', 'Soir 18h-20h'],
      tauxFidelisation: '75%',
      tempsReponse: '30 min'
    }
  },

  // TIER 4: NICHES RENTABLES
  artisan: {
    id: 'artisan',
    name: 'Plombier / Électricien / Artisan',
    emoji: '🔧',
    tier: 4,
    features: ['rdv', 'urgences', 'devis', 'disponibilites'],
    promptContext: 'Tu es l\'assistant d\'un artisan. Tu gères les rendez-vous, les urgences, tu donnes des estimations de prix, et tu informes sur les disponibilités.',
    rdvEnabled: true,
    menuEnabled: false,
    marketInsights: {
      interventionMoyenne: '120€',
      heuresPointe: 'Urgences soir/weekend',
      tauxFidelisation: '60%',
      tempsReponse: '2h'
    }
  },

  taxi: {
    id: 'taxi',
    name: 'Taxi / VTC',
    emoji: '🚕',
    tier: 4,
    features: ['reservations', 'tarifs', 'itineraires', 'disponibilites'],
    promptContext: 'Tu es l\'assistant d\'un service de taxi/VTC. Tu gères les réservations, tu donnes les tarifs estimés, et tu informes sur les disponibilités.',
    rdvEnabled: true,
    menuEnabled: false,
    marketInsights: {
      courseMoyenne: '25€',
      heuresPointe: ['Vendredi-Samedi soir', 'Lundi matin'],
      tauxOccupation: '65%',
      tempsReponse: '10 min'
    }
  },

  piscine: {
    id: 'piscine',
    name: 'Piscine / Centre Aquatique',
    emoji: '🏊',
    tier: 4,
    features: ['cours', 'abonnements', 'creneaux', 'tarifs'],
    promptContext: 'Tu es l\'assistant d\'un centre aquatique. Tu gères les inscriptions aux cours de natation, les abonnements, et tu donnes les créneaux disponibles.',
    rdvEnabled: true,
    menuEnabled: false,
    marketInsights: {
      abonnementMoyen: '35€/mois',
      heuresPointe: ['Mercredi', 'Weekend'],
      tauxFidelisation: '70%',
      tempsReponse: '1h'
    }
  },

  tattoo: {
    id: 'tattoo',
    name: 'Tatoueur / Pierceur',
    emoji: '🎨',
    tier: 4,
    features: ['rdv', 'portfolios', 'tarifs', 'conseils'],
    promptContext: 'Tu es l\'assistant d\'un salon de tatouage. Tu gères les rendez-vous, tu présentes le portfolio, tu donnes des infos sur les tarifs et les conseils d\'entretien.',
    rdvEnabled: true,
    menuEnabled: false,
    marketInsights: {
      tatouageMoyen: '150€',
      heuresPointe: ['Vendredi-Samedi', 'Vacances scolaires'],
      tauxFidelisation: '65%',
      tempsAttenteMoyen: '2 semaines'
    }
  },

  spa: {
    id: 'spa',
    name: 'SPA / Hammam / Sauna',
    emoji: '🧴',
    tier: 4,
    features: ['reservations', 'packages', 'bien-etre', 'tarifs'],
    promptContext: 'Tu es l\'assistant d\'un SPA. Tu gères les réservations, tu proposes des packages bien-être, et tu présentes les différents soins disponibles.',
    rdvEnabled: true,
    menuEnabled: false,
    marketInsights: {
      seanceMoyenne: '85€',
      heuresPointe: ['Weekend', 'Soirées'],
      tauxFidelisation: '68%',
      tempsReponse: '30 min'
    }
  }
};

export const getSectorById = (sectorId) => {
  return SECTORS[sectorId] || null;
};

export const getSectorsList = () => {
  return Object.values(SECTORS);
};

export const getSectorsByTier = (tier) => {
  return Object.values(SECTORS).filter(s => s.tier === tier);
};