import { useState, useEffect } from 'preact/hooks';
import SearchSelect, { type Option } from './SearchSelect';
import { getCitiesForCountry, hasCuratedCities } from '../data/cities';
import { COUNTRIES } from '../data/countries';

interface Props {
  id: string;
  initialValue?: string;
  initialCountryIso?: string;
}

// In-memory cache for API results
const apiCache: Record<string, string[]> = {};

async function fetchCitiesFromAPI(countryName: string): Promise<string[]> {
  if (apiCache[countryName]) return apiCache[countryName];
  try {
    const res = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: countryName }),
    });
    const json = await res.json();
    if (!json.error && Array.isArray(json.data)) {
      // Sort alphabetically, limit to 200
      const cities = (json.data as string[]).sort((a, b) => a.localeCompare(b)).slice(0, 200);
      apiCache[countryName] = cities;
      return cities;
    }
  } catch {
    // silently fail
  }
  return [];
}

function toOptions(cities: string[]): Option[] {
  return cities.map(c => ({ value: c, label: c }));
}

export default function CitySelect({ id, initialValue, initialCountryIso }: Props) {
  const [options, setOptions] = useState<Option[]>(() => {
    if (initialCountryIso) {
      return toOptions(getCitiesForCountry(initialCountryIso));
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [countryName, setCountryName] = useState('');

  const loadCities = async (iso: string, name: string) => {
    setCountryName(name);
    const curated = getCitiesForCountry(iso);
    if (curated.length > 0) {
      setOptions(toOptions(curated));
      return;
    }
    // Fallback: fetch from API using English country name
    const englishName = COUNTRIES.find(c => c.iso === iso)?.name ?? name;
    setLoading(true);
    const fetched = await fetchCitiesFromAPI(englishName);
    setLoading(false);
    if (fetched.length > 0) {
      setOptions(toOptions(fetched));
    } else {
      setOptions([]);
    }
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const { iso, name } = (e as CustomEvent).detail;
      // Reset city when country changes
      const hidden = document.getElementById(id) as HTMLInputElement | null;
      if (hidden) hidden.value = '';
      loadCities(iso, name);
    };
    document.addEventListener('ff:country-changed', handler);
    return () => document.removeEventListener('ff:country-changed', handler);
  }, [id]);

  // Load initial country cities if provided
  useEffect(() => {
    if (initialCountryIso) {
      const country = COUNTRIES.find(c => c.iso === initialCountryIso);
      if (country) loadCities(country.iso, country.name);
    }
  }, []);

  const placeholder = loading
    ? 'Chargement…'
    : options.length === 0
      ? 'Sélectionnez d\'abord un pays'
      : 'Rechercher une ville…';

  return (
    <SearchSelect
      id={id}
      options={options}
      placeholder={placeholder}
      noResultsText="Ville introuvable"
      disabled={options.length === 0 && !loading}
      loading={loading}
      initialValue={initialValue}
    />
  );
}
