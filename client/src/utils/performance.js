// Performance utilities for monitoring and optimization

// Debounce function for performance optimization
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for limiting function calls
export const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function(...args) {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

// Memory usage monitor
export const memoryMonitor = {
  logMemoryUsage() {
    if (performance.memory) {
      const memory = performance.memory;
      console.log('Memory Usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
      });
    }
  },

  // Warn if memory usage is high
  checkMemoryUsage() {
    if (performance.memory) {
      const memory = performance.memory;
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      
      if (usagePercent > 80) {
        console.warn(`High memory usage detected: ${usagePercent.toFixed(1)}%`);
        return true;
      }
    }
    return false;
  }
};

// Performance timing utilities
export const performanceTimer = {
  timers: new Map(),
  
  start(label) {
    this.timers.set(label, performance.now());
  },
  
  end(label) {
    const start = this.timers.get(label);
    if (start) {
      const duration = performance.now() - start;
      console.log(`${label}: ${duration.toFixed(2)}ms`);
      this.timers.delete(label);
      return duration;
    }
    return null;
  }
};

// Lazy loading utility for images
export const lazyLoadImage = (src, placeholder = '') => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
};

// Frame rate monitor
export class FrameRateMonitor {
  constructor() {
    this.frames = 0;
    this.startTime = Date.now();
    this.lastTime = this.startTime;
  }

  update() {
    this.frames++;
    const now = Date.now();
    
    if (now - this.lastTime >= 1000) {
      const fps = Math.round((this.frames * 1000) / (now - this.startTime));
      this.lastTime = now;
      this.frames = 0;
      this.startTime = now;
      return fps;
    }
    return null;
  }
}

// Resource cleanup utility
export const resourceManager = {
  resources: new Set(),
  
  add(resource) {
    this.resources.add(resource);
  },
  
  cleanup() {
    this.resources.forEach(resource => {
      try {
        if (resource.dispose) resource.dispose();
        if (resource.destroy) resource.destroy();
        if (resource.remove) resource.remove();
      } catch (error) {
        console.warn('Error during resource cleanup:', error);
      }
    });
    this.resources.clear();
  }
};

export default {
  debounce,
  throttle,
  memoryMonitor,
  performanceTimer,
  lazyLoadImage,
  FrameRateMonitor,
  resourceManager
};