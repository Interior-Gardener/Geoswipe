// Asset loading optimization utilities

export const ASSET_PATHS = {
  textures: {
    albedo: '/assets/Albedo.jpg',
    bump: '/assets/Bump.jpg',
    clouds: '/assets/Clouds.png',
    ocean: '/assets/Ocean.png',
    nightLights: '/assets/night_lights_modified.png',
    gaiaSky: '/assets/Gaia_EDR3_darkened.png'
  },
  data: {
    countries: '/assets/countrieslite.geo.json'
  },
  icons: {
    historicBuildings: '/assets/Historic Buildings.png',
    historicForts: '/assets/Historic Forts.png',
    monuments: '/assets/Monuments.png',
    palacesMuseums: '/assets/Palaces & Museums.png',
    rockCutCaves: '/assets/Rock-cut Caves.png',
    temples: '/assets/Temples.png',
    unesco: '/assets/UNESCO World Heritage.png'
  }
};

// Preload critical assets for better performance
export const preloadCriticalAssets = async () => {
  const criticalAssets = [
    ASSET_PATHS.textures.albedo,
    ASSET_PATHS.textures.gaiaSky,
    ASSET_PATHS.data.countries
  ];

  const preloadPromises = criticalAssets.map(assetPath => {
    return new Promise((resolve, reject) => {
      if (assetPath.endsWith('.json')) {
        // Preload JSON files
        fetch(assetPath)
          .then(response => response.json())
          .then(resolve)
          .catch(reject);
      } else {
        // Preload image files
        const img = new Image();
        img.onload = () => resolve(assetPath);
        img.onerror = reject;
        img.src = assetPath;
      }
    });
  });

  try {
    await Promise.all(preloadPromises);
    console.log('✅ Critical assets preloaded successfully');
  } catch (error) {
    console.warn('⚠️ Some critical assets failed to preload:', error);
  }
};

// Progressive asset loading for non-critical assets
export const loadAssetsProgressively = () => {
  const nonCriticalAssets = [
    ...Object.values(ASSET_PATHS.icons),
    ASSET_PATHS.textures.bump,
    ASSET_PATHS.textures.clouds,
    ASSET_PATHS.textures.ocean,
    ASSET_PATHS.textures.nightLights
  ];

  // Load non-critical assets with a delay to not block critical rendering
  setTimeout(() => {
    nonCriticalAssets.forEach(assetPath => {
      const img = new Image();
      img.src = assetPath;
    });
  }, 2000);
};

// Asset cache management
export class AssetCache {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
  }

  async get(path) {
    // Return cached asset if available
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }

    // Return existing loading promise if asset is currently being loaded
    if (this.loadingPromises.has(path)) {
      return this.loadingPromises.get(path);
    }

    // Start loading the asset
    const loadingPromise = this.loadAsset(path);
    this.loadingPromises.set(path, loadingPromise);

    try {
      const asset = await loadingPromise;
      this.cache.set(path, asset);
      this.loadingPromises.delete(path);
      return asset;
    } catch (error) {
      this.loadingPromises.delete(path);
      throw error;
    }
  }

  async loadAsset(path) {
    if (path.endsWith('.json')) {
      const response = await fetch(path);
      return response.json();
    } else {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = path;
      });
    }
  }

  clear() {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  getStats() {
    return {
      cachedAssets: this.cache.size,
      loadingAssets: this.loadingPromises.size,
      totalSize: this.calculateCacheSize()
    };
  }

  calculateCacheSize() {
    let size = 0;
    this.cache.forEach((asset, path) => {
      if (asset instanceof HTMLImageElement) {
        size += asset.naturalWidth * asset.naturalHeight * 4; // Rough estimate
      } else if (typeof asset === 'object') {
        size += JSON.stringify(asset).length * 2; // Rough estimate for JSON
      }
    });
    return Math.round(size / 1024 / 1024 * 100) / 100; // MB
  }
}

export const globalAssetCache = new AssetCache();

export default {
  ASSET_PATHS,
  preloadCriticalAssets,
  loadAssetsProgressively,
  AssetCache,
  globalAssetCache
};