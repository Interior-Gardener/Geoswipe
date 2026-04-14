const STORAGE_KEY = 'geoswipe_custom_emergency_contacts_v1';

const DEFAULT_CONTACTS = {
  India: {
    default: [
      { label: 'National Emergency', number: '112' },
      { label: 'Police', number: '100' },
      { label: 'Ambulance', number: '108' },
      { label: 'Fire', number: '101' },
      { label: 'Women Helpline', number: '1091' }
    ],
    cities: {
      Mumbai: [
        { label: 'Mumbai Traffic Police', number: '8454999999' },
        { label: 'Disaster Control Mumbai', number: '1916' }
      ],
      Pune: [
        { label: 'Pune City Police', number: '02026126296' },
        { label: 'Pune Disaster Helpline', number: '1077' }
      ],
      Delhi: [
        { label: 'Delhi Police Helpline', number: '1090' },
        { label: 'Delhi Emergency Ops', number: '1077' }
      ],
      Jaipur: [
        { label: 'Jaipur Police Control Room', number: '01412561639' }
      ],
      Agra: [
        { label: 'Tourist Police Agra', number: '9454404044' }
      ]
    }
  },
  USA: {
    default: [
      { label: 'Emergency', number: '911' },
      { label: 'Poison Control', number: '18002221222' }
    ],
    cities: {}
  },
  UK: {
    default: [
      { label: 'Emergency', number: '999' },
      { label: 'NHS Non-Emergency', number: '111' }
    ],
    cities: {}
  }
};

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase();
}

function readCustomStore() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeCustomStore(store) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore localStorage write failures.
  }
}

function makeCompositeKey(country, city) {
  return `${normalizeKey(country)}::${normalizeKey(city)}`;
}

function dedupeContacts(contacts) {
  const seen = new Set();
  return contacts.filter((contact) => {
    const key = `${normalizeKey(contact.label)}::${normalizeKey(contact.number)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function getEmergencyContacts(country = 'India', city = '') {
  const selectedCountry = country && DEFAULT_CONTACTS[country] ? country : 'India';
  const cityKey = String(city || '').trim();

  const baseCountryContacts = DEFAULT_CONTACTS[selectedCountry]?.default || [];
  const citySpecificContacts = DEFAULT_CONTACTS[selectedCountry]?.cities?.[cityKey] || [];

  const customStore = readCustomStore();
  const customCountry = customStore[makeCompositeKey(selectedCountry, '')] || [];
  const customCity = customStore[makeCompositeKey(selectedCountry, cityKey)] || [];

  return dedupeContacts([
    ...baseCountryContacts,
    ...citySpecificContacts,
    ...customCountry,
    ...customCity
  ]);
}

export function getEmergencyLocations() {
  return Object.entries(DEFAULT_CONTACTS).map(([country, value]) => ({
    country,
    cities: Object.keys(value.cities || {})
  }));
}

export function saveCustomEmergencyContact({ country, city = '', label, number }) {
  const normalizedCountry = country && DEFAULT_CONTACTS[country] ? country : 'India';
  const cleanLabel = String(label || '').trim();
  const cleanNumber = String(number || '').replace(/\s+/g, '');

  if (!cleanLabel || !cleanNumber) {
    throw new Error('Contact label and number are required.');
  }

  const store = readCustomStore();
  const key = makeCompositeKey(normalizedCountry, city);
  const existing = Array.isArray(store[key]) ? store[key] : [];

  store[key] = dedupeContacts([
    ...existing,
    {
      label: cleanLabel,
      number: cleanNumber,
      isCustom: true
    }
  ]);

  writeCustomStore(store);
}

export function getEmergencyTelHref(number) {
  const clean = String(number || '').replace(/[^\d+]/g, '');
  return `tel:${clean}`;
}
