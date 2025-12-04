import { useEffect, useRef, useState } from 'react';

/**
 * Hook personnalisé pour Google Places Autocomplete
 * Permet l'autocomplétion d'adresses avec l'API Google Places
 */
export function useGooglePlaces(options = {}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [address, setAddress] = useState('');
  const [placeDetails, setPlaceDetails] = useState(null);

  const {
    onPlaceSelected,
    types = ['address'],
    componentRestrictions = {},
    fields = ['address_components', 'formatted_address', 'geometry', 'name']
  } = options;

  // Charger le script Google Places API
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

    if (!apiKey || apiKey === 'your_google_places_api_key') {
      console.warn('⚠️ Google Places API key not configured');
      return;
    }

    // Vérifier si le script est déjà chargé
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
      return;
    }

    // Charger le script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=fr`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      console.error('❌ Erreur chargement Google Places API');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  // Initialiser l'autocomplete quand le script est chargé
  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google) {
      return;
    }

    try {
      // Créer l'instance Autocomplete
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types,
        componentRestrictions,
        fields
      });

      autocompleteRef.current = autocomplete;

      // Écouter l'événement de sélection
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (!place.geometry) {
          console.warn('⚠️ Aucune adresse sélectionnée');
          return;
        }

        // Extraire les composants de l'adresse
        const addressComponents = {};
        place.address_components?.forEach((component) => {
          const types = component.types;
          if (types.includes('street_number')) {
            addressComponents.street_number = component.long_name;
          }
          if (types.includes('route')) {
            addressComponents.route = component.long_name;
          }
          if (types.includes('locality')) {
            addressComponents.city = component.long_name;
          }
          if (types.includes('postal_code')) {
            addressComponents.postal_code = component.long_name;
          }
          if (types.includes('country')) {
            addressComponents.country = component.long_name;
            addressComponents.country_code = component.short_name;
          }
          if (types.includes('administrative_area_level_1')) {
            addressComponents.region = component.long_name;
          }
        });

        const details = {
          formatted_address: place.formatted_address,
          address_components: addressComponents,
          geometry: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          },
          name: place.name
        };

        setAddress(place.formatted_address);
        setPlaceDetails(details);

        // Callback personnalisé
        if (onPlaceSelected) {
          onPlaceSelected(details);
        }
      });

      console.log('✅ Google Places Autocomplete initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation autocomplete:', error);
    }
  }, [isLoaded, types, componentRestrictions, fields, onPlaceSelected]);

  return {
    inputRef,
    isLoaded,
    address,
    placeDetails,
    setAddress
  };
}
