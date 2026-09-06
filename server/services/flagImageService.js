const FlagImage = require('../models/FlagImage');
const COUNTRIES = require('../data/countries');

const FLAG_CACHE_DURATION_MS = 24 * 60 * 60 * 1000;
const FLAG_IMAGE_BASE = 'https://flagcdn.com/w320';

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

// Builds the country/flag list from the bundled static dataset.
//
// This previously fetched restcountries.com, which has since been deprecated:
// it 301-redirects and returns {success:false,...} rather than an array, so
// this returned [] and the flag game answered 503. Country names and ISO codes
// are static data, so they are now bundled - no network call, no outage.
function buildFlagsFromStaticData() {
  return COUNTRIES.map((country) => ({
    name: country.name,
    code: country.code,
    flagUrl: `${FLAG_IMAGE_BASE}/${country.code}.png`
  }));
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

  const staticCountries = buildFlagsFromStaticData();
  if (staticCountries.length > 0) {
    writeMemoryCache(staticCountries);
    // Persist for the DB-backed path, but never let a write failure break the
    // game - the in-memory list is already usable.
    try {
      await persistFlags(staticCountries);
    } catch (err) {
      console.warn('[flags] Could not persist flag cache to MongoDB:', err.message || err);
    }
  } else {
    console.error('[flags] Static country dataset is empty - server/data/countries.js may be corrupt.');
  }

  return staticCountries;
}

module.exports = {
  getFlagCountriesWithCache,
  persistFlags
};
