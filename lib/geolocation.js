// Système de géolocalisation avec permissions RGPD
// Conforme aux régulations européennes sur la vie privée

export const GEOLOCATION_STORAGE_KEY = 'replyfast_geolocation_permission';
export const GEOLOCATION_DATA_KEY = 'replyfast_geolocation_data';

// États de permission
export const PERMISSION_STATES = {
  GRANTED: 'granted',
  DENIED: 'denied',
  PROMPT: 'prompt',
  NOT_REQUESTED: 'not_requested'
};

/**
 * Vérifier si la géolocalisation est disponible
 */
export function isGeolocationAvailable() {
  return 'geolocation' in navigator;
}

/**
 * Obtenir le statut de permission actuel
 */
export async function getPermissionStatus() {
  if (!isGeolocationAvailable()) {
    return PERMISSION_STATES.DENIED;
  }

  try {
    // Vérifier dans le localStorage d'abord
    const storedPermission = localStorage.getItem(GEOLOCATION_STORAGE_KEY);
    if (storedPermission) {
      return storedPermission;
    }

    // Vérifier la permission native si disponible
    if (navigator.permissions) {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    }

    return PERMISSION_STATES.NOT_REQUESTED;
  } catch (error) {
    console.error('Erreur getPermissionStatus:', error);
    return PERMISSION_STATES.NOT_REQUESTED;
  }
}

/**
 * Demander la permission de géolocalisation
 * @param {Object} options - Options de la demande
 * @returns {Promise<{success: boolean, position?: Object, error?: string}>}
 */
export async function requestGeolocationPermission(options = {}) {
  if (!isGeolocationAvailable()) {
    return {
      success: false,
      error: 'Geolocation not available in this browser'
    };
  }

  return new Promise((resolve) => {
    const geoOptions = {
      enableHighAccuracy: options.highAccuracy || false,
      timeout: options.timeout || 10000,
      maximumAge: options.maximumAge || 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Succès - sauvegarder la permission
        localStorage.setItem(GEOLOCATION_STORAGE_KEY, PERMISSION_STATES.GRANTED);

        // Sauvegarder les données (optionnel)
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        localStorage.setItem(GEOLOCATION_DATA_KEY, JSON.stringify(locationData));

        resolve({
          success: true,
          position: locationData
        });
      },
      (error) => {
        // Erreur - sauvegarder le refus
        localStorage.setItem(GEOLOCATION_STORAGE_KEY, PERMISSION_STATES.DENIED);

        let errorMessage = 'Unknown error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permission denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Request timeout';
            break;
        }

        resolve({
          success: false,
          error: errorMessage
        });
      },
      geoOptions
    );
  });
}

/**
 * Calculer la distance entre deux coordonnées (formule de Haversine)
 * @param {number} lat1 - Latitude du point 1
 * @param {number} lon1 - Longitude du point 1
 * @param {number} lat2 - Latitude du point 2
 * @param {number} lon2 - Longitude du point 2
 * @returns {number} Distance en kilomètres
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Arrondir à 1 décimale
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Obtenir la position actuelle stockée
 */
export function getStoredPosition() {
  try {
    const data = localStorage.getItem(GEOLOCATION_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erreur getStoredPosition:', error);
    return null;
  }
}

/**
 * Révoquer la permission et supprimer les données
 */
export function revokeGeolocationPermission() {
  localStorage.removeItem(GEOLOCATION_STORAGE_KEY);
  localStorage.removeItem(GEOLOCATION_DATA_KEY);
}

/**
 * Enregistrer une position de client dans la base de données
 * @param {Object} supabase - Client Supabase
 * @param {string} clientPhone - Numéro de téléphone du client
 * @param {Object} position - Coordonnées
 * @param {string} businessEmail - Email du business
 */
export async function saveClientLocation(supabase, clientPhone, position, businessEmail) {
  try {
    const { data, error } = await supabase
      .from('client_locations')
      .upsert({
        business_email: businessEmail,
        client_phone: clientPhone,
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'business_email,client_phone'
      });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erreur saveClientLocation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtenir les statistiques de distance pour un business
 * @param {Object} supabase - Client Supabase
 * @param {string} businessEmail - Email du business
 * @param {Object} businessPosition - Position du business
 */
export async function getDistanceStats(supabase, businessEmail, businessPosition) {
  try {
    const { data: locations, error } = await supabase
      .from('client_locations')
      .select('*')
      .eq('business_email', businessEmail);

    if (error) throw error;

    if (!locations || locations.length === 0) {
      return {
        success: true,
        stats: {
          totalClients: 0,
          averageDistance: 0,
          maxDistance: 0,
          minDistance: 0,
          zones: []
        }
      };
    }

    // Calculer les distances
    const distances = locations.map(loc => ({
      phone: loc.client_phone,
      distance: calculateDistance(
        businessPosition.latitude,
        businessPosition.longitude,
        loc.latitude,
        loc.longitude
      )
    }));

    // Statistiques
    const distanceValues = distances.map(d => d.distance);
    const stats = {
      totalClients: distances.length,
      averageDistance: Math.round((distanceValues.reduce((a, b) => a + b, 0) / distances.length) * 10) / 10,
      maxDistance: Math.max(...distanceValues),
      minDistance: Math.min(...distanceValues),
      zones: createDistanceZones(distances)
    };

    return { success: true, stats, distances };
  } catch (error) {
    console.error('Erreur getDistanceStats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Créer des zones de distance (0-5km, 5-10km, 10-20km, 20+km)
 */
function createDistanceZones(distances) {
  const zones = [
    { range: '0-5 km', min: 0, max: 5, count: 0, percentage: 0 },
    { range: '5-10 km', min: 5, max: 10, count: 0, percentage: 0 },
    { range: '10-20 km', min: 10, max: 20, count: 0, percentage: 0 },
    { range: '20+ km', min: 20, max: Infinity, count: 0, percentage: 0 }
  ];

  distances.forEach(({ distance }) => {
    for (const zone of zones) {
      if (distance >= zone.min && distance < zone.max) {
        zone.count++;
        break;
      }
    }
  });

  const total = distances.length;
  zones.forEach(zone => {
    zone.percentage = total > 0 ? Math.round((zone.count / total) * 100) : 0;
  });

  return zones;
}
