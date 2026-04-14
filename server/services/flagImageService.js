const FlagImage = require('../models/FlagImage');

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetchImpl }) => fetchImpl(...args));

const FLAG_CACHE_DURATION_MS = 24 * 60 * 60 * 1000;
const FLAG_SOURCE_URL = 'https://restcountries.com/v3.1/all?fields=name,cca2';

let cachedFlags = null;
let cacheExpiresAt = 0;

function normalizeCountryKey(countryName) {
  return String(countryName || '')
    .toLowerCase()
    .trim();
}

function parseCodeFromFlagUrl(flagUrl) {
  const match = String(flagUrl || '').match(/\/([a-z]{2})\.png/i);
  return match ? match[1].toLowerCase() : '';
}

function readMemoryCache() {
  if (!cachedFlags || Date.now() >= cacheExpiresAt) {
    return null;
  }

  return cachedFlags;
}

function writeMemoryCache(countries) {
  cachedFlags = countries;
  cacheExpiresAt = Date.now() + FLAG_CACHE_DURATION_MS;
}

function normalizeRecord(record) {
  return {
    name: record.country,
    code: record.code || parseCodeFromFlagUrl(record.flagUrl),
    flagUrl: record.flagUrl
  };
}

async function loadFlagsFromDatabase() {
  const records = await FlagImage.find({}).lean();
  return records
    .map(normalizeRecord)
    .filter((entry) => entry.name && entry.flagUrl);
}

async function fetchFlagsFromApi() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(FLAG_SOURCE_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'GeoSwipe/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Flag source returned ${response.status}`);
    }

    const payload = await response.json();
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload
      .filter((country) => country?.name?.common && country?.cca2)
      .map((country) => {
        const code = String(country.cca2).toLowerCase();
        return {
          name: country.name.common,
          code,
          flagUrl: `https://flagcdn.com/w320/${code}.png`
        };
      });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function persistFlags(countries = []) {
  if (!Array.isArray(countries) || countries.length === 0) {
    return;
  }

  const operations = countries.map((country) => ({
    updateOne: {
      filter: { countryKey: normalizeCountryKey(country.name) },
      update: {
        $set: {
          country: country.name,
          countryKey: normalizeCountryKey(country.name),
          flagUrl: country.flagUrl,
          code: country.code || '',
          cachedAt: new Date()
        }
      },
      upsert: true
    }
  }));

  await FlagImage.bulkWrite(operations, { ordered: false });
}

async function getFlagCountriesWithCache() {
  const memoryValue = readMemoryCache();
  if (memoryValue) {
    return memoryValue;
  }

  const dbCountries = await loadFlagsFromDatabase();
  if (dbCountries.length > 0) {
    writeMemoryCache(dbCountries);
    return dbCountries;
  }

  const apiCountries = await fetchFlagsFromApi();
  if (apiCountries.length > 0) {
    await persistFlags(apiCountries);
    writeMemoryCache(apiCountries);
  }

  return apiCountries;
}

module.exports = {
  getFlagCountriesWithCache,
  persistFlags
};
