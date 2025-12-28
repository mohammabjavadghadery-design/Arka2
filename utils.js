/**
 * ARKA COMMAND HUB - UTILITIES
 * Version: 2.1.0
 * Author: محمد جواد قادری
 * Description: مجموعه ابزارهای کمکی پیشرفته برای سایت آرکا
 */

// ======================
// 🛠️ Utility Manager
// ======================
class Utils {
  constructor() {
    this.browser = this.detectBrowser();
    this.device = this.detectDevice();
    this.performance = {
      metrics: {},
      startTime: 0,
      endTime: 0
    };
    this.performance.startTime = performance.now();
    this.init();
  }

  init() {
    console.log('🔧 Utils module initialized');
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Performance monitoring
    window.addEventListener('load', () => {
      this.performance.endTime = performance.now();
      this.performance.metrics.loadTime = this.performance.endTime - this.performance.startTime;
      this.logPerformance();
    });

    // Memory monitoring
    if ('memory' in performance) {
      this.performance.metrics.memory = performance.memory;
    }
  }

  // ======================
  // 🌐 Browser & Device Detection
  // ======================
  detectBrowser() {
    const ua = navigator.userAgent;
    let browser = {
      name: 'Unknown',
      version: '0.0.0',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isChrome: false,
      isFirefox: false,
      isSafari: false,
      isEdge: false,
      isOpera: false
    };

    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      browser.name = 'Chrome';
      const match = ua.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
      browser.version = match ? match[1] : '0.0.0';
      browser.isChrome = true;
    } else if (ua.includes('Firefox')) {
      browser.name = 'Firefox';
      const match = ua.match(/Firefox\/(\d+\.\d+)/);
      browser.version = match ? match[1] : '0.0.0';
      browser.isFirefox = true;
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browser.name = 'Safari';
      const match = ua.match(/Version\/(\d+\.\d+)/);
      browser.version = match ? match[1] : '0.0.0';
      browser.isSafari = true;
    } else if (ua.includes('Edg')) {
      browser.name = 'Edge';
      const match = ua.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/);
      browser.version = match ? match[1] : '0.0.0';
      browser.isEdge = true;
    } else if (ua.includes('OPR') || ua.includes('Opera')) {
      browser.name = 'Opera';
      const match = ua.match(/OPR\/(\d+\.\d+\.\d+\.\d+)/);
      browser.version = match ? match[1] : '0.0.0';
      browser.isOpera = true;
    }

    return browser;
  }

  detectDevice() {
    const ua = navigator.userAgent;
    let device = {
      type: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isWindows: false,
      isMac: false,
      isLinux: false,
      isAndroid: false,
      isIOS: false
    };

    if (/Android/i.test(ua)) {
      device.type = 'mobile';
      device.isMobile = true;
      device.isAndroid = true;
      device.isDesktop = false;
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      device.type = 'mobile';
      device.isMobile = true;
      device.isIOS = true;
      device.isDesktop = false;
    } else if (/iPad/i.test(ua)) {
      device.type = 'tablet';
      device.isTablet = true;
      device.isIOS = true;
      device.isDesktop = false;
    } else if (/Windows/i.test(ua)) {
      device.isWindows = true;
    } else if (/Mac/i.test(ua)) {
      device.isMac = true;
    } else if (/Linux/i.test(ua)) {
      device.isLinux = true;
    }

    return device;
  }

  // ======================
  // ⚡ Performance Utilities
  // ======================
  logPerformance() {
    const metrics = this.performance.metrics;
    console.group('📊 Performance Metrics');
    console.log('Load Time:', metrics.loadTime, 'ms');
    if (metrics.memory) {
      console.log('Used Heap Size:', (metrics.memory.usedJSHeapSize / 1024 / 1024).toFixed(2), 'MB');
      console.log('Total Heap Size:', (metrics.memory.totalJSHeapSize / 1024 / 1024).toFixed(2), 'MB');
      console.log('JS Heap Size Limit:', (metrics.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2), 'MB');
    }
    console.groupEnd();
  }

  measureFunction(func, name) {
    const start = performance.now();
    const result = func();
    const end = performance.now();
    console.log(`⏱️ Function "${name}" took:`, end - start, 'ms');
    return result;
  }

  // ======================
  // 🔧 Data Utilities
  // ======================
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }
  }

  mergeObjects(target, source) {
    const result = this.deepClone(target);
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this.mergeObjects(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    return result;
  }

  // ======================
  // 📊 Data Validation
  // ======================
  validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  validateURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  validateJSON(jsonString) {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  // ======================
  // 🗂️ Storage Utilities
  // ======================
  setLocalStorage(key, value, ttl = null) {
    const item = {
      value: value,
      timestamp: Date.now(),
      ttl: ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  getLocalStorage(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch {
      return null;
    }
  }

  clearLocalStorage() {
    localStorage.clear();
  }

  // ======================
  // 📝 Logging Utilities
  // ======================
  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      browser: this.browser.name,
      version: this.browser.version
    };

    switch (level.toLowerCase()) {
      case 'error':
        console.error(`[${timestamp}] ERROR:`, message, data);
        break;
      case 'warn':
        console.warn(`[${timestamp}] WARN:`, message, data);
        break;
      case 'info':
        console.info(`[${timestamp}] INFO:`, message, data);
        break;
      case 'debug':
        console.debug(`[${timestamp}] DEBUG:`, message, data);
        break;
      default:
        console.log(`[${timestamp}] ${level.toUpperCase()}:`, message, data);
    }

    // Store in local storage for debugging
    const logs = this.getLocalStorage('arka_logs') || [];
    logs.push(logEntry);
    if (logs.length > 100) logs.shift(); // Keep only last 100 logs
    this.setLocalStorage('arka_logs', logs, 86400000); // 24 hours
  }

  logError(message, error) {
    this.log('error', message, {
      error: error.message,
      stack: error.stack,
      url: window.location.href
    });
  }

  logInfo(message, data) {
    this.log('info', message, data);
  }

  // ======================
  // 🎨 UI Utilities
  // ======================
  createElement(tag, options = {}) {
    const element = document.createElement(tag);
    
    if (options.className) element.className = options.className;
    if (options.id) element.id = options.id;
    if (options.textContent) element.textContent = options.textContent;
    if (options.innerHTML) element.innerHTML = options.innerHTML;
    if (options.style) Object.assign(element.style, options.style);
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    
    return element;
  }

  showNotification(message, type = 'info', duration = 3000) {
    const notification = this.createElement('div', {
      className: `notification ${type}`,
      style: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#00ff8c' : type === 'error' ? '#ff1a1a' : '#00ffff',
        color: '#000',
        padding: '10px 15px',
        borderRadius: '8px',
        zIndex: '10000',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        fontFamily: 'Vazir, sans-serif',
        fontWeight: '600',
        maxWidth: '300px',
        wordWrap: 'break-word'
      },
      textContent: message
    });

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  // ======================
  // 🎯 Async Utilities
  // ======================
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async retryAsync(fn, maxRetries = 3, delayMs = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.delay(delayMs * (i + 1)); // Exponential backoff
      }
    }
  }

  async timeoutPromise(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Promise timeout')), ms)
      )
    ]);
  }

  // ======================
  // 🔍 Search & Filter
  // ======================
  fuzzySearch(searchTerm, items, key) {
    const term = searchTerm.toLowerCase();
    return items.filter(item => {
      const value = typeof item === 'object' ? item[key] : item;
      return value.toLowerCase().includes(term);
    });
  }

  searchInObject(obj, searchTerm) {
    const results = [];
    const search = (current, path = '') => {
      for (const key in current) {
        const newPath = path ? `${path}.${key}` : key;
        const value = current[key];
        
        if (typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({ path: newPath, value });
        } else if (typeof value === 'object' && value !== null) {
          search(value, newPath);
        }
      }
    };
    search(obj);
    return results;
  }

  // ======================
  // 📋 Array Utilities
  // ======================
  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  uniqueArray(array) {
    return [...new Set(array)];
  }

  groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    }, {});
  }

  // ======================
  // 🧮 Math Utilities
  // ======================
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // ======================
  // 📊 Number Formatting
  // ======================
  formatNumber(num) {
    return new Intl.NumberFormat('fa-IR').format(num);
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  formatTime(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  }

  // ======================
  // 🌐 Network Utilities
  // ======================
  async checkInternetConnection() {
    try {
      const response = await fetch('https://httpbin.org/get', { 
        method: 'HEAD',
        mode: 'no-cors',
        timeout: 5000
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async ping(url, timeout = 5000) {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, { 
        signal: controller.signal,
        mode: 'no-cors'
      });
      
      clearTimeout(timeoutId);
      const end = Date.now();
      return end - start;
    } catch {
      return -1; // Timeout or error
    }
  }

  // ======================
  // 📁 File Utilities
  // ======================
  async readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  async readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ======================
  // 🎨 Color Utilities
  // ======================
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  generateRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  }

  // ======================
  // 🕒 Date & Time Utilities
  // ======================
  formatDate(date, locale = 'fa-IR') {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTimeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return 'چند ثانیه پیش';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} دقیقه پیش`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ساعت پیش`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} روز پیش`;
    
    return this.formatDate(date);
  }

  // ======================
  // 🧠 AI Utilities
  // ======================
  calculateSimilarity(text1, text2) {
    const a = text1.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const b = text2.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    
    if (!a.length && !b.length) return 1;
    if (!a.length || !b.length) return 0;
    if (a === b) return 1;
    
    const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));
    
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    
    const distance = matrix[b.length][a.length];
    return (a.length + b.length - distance) / (a.length + b.length);
  }

  extractKeywords(text, maxKeywords = 10) {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  // ======================
  // 🛡️ Security Utilities
  // ======================
  sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // ======================
  // 📱 Responsive Utilities
  // ======================
  isMobile() {
    return window.innerWidth <= 768;
  }

  isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  }

  isDesktop() {
    return window.innerWidth > 1024;
  }

  // ======================
  // 🎯 DOM Utilities
  // ======================
  waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  animateElement(element, animation, duration = 300) {
    element.style.animation = `${animation} ${duration}ms ease-in-out`;
    setTimeout(() => {
      element.style.animation = '';
    }, duration);
  }

  // ======================
  // 🚀 Performance Monitoring
  // ======================
  monitorPerformance() {
    if ('performance' in window) {
      performance.mark('arka-start');
      
      window.addEventListener('load', () => {
        performance.mark('arka-end');
        performance.measure('arka-total', 'arka-start', 'arka-end');
        
        const measure = performance.getEntriesByName('arka-total')[0];
        if (measure) {
          console.log('⏱️ Arka total load time:', measure.duration, 'ms');
        }
      });
    }
  }

  // ======================
  // 📊 Analytics Utilities
  // ======================
  trackEvent(category, action, label = null, value = null) {
    const event = {
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };
    
    // Store locally for later analysis
    const events = this.getLocalStorage('arka_events') || [];
    events.push(event);
    if (events.length > 1000) events.shift(); // Keep only last 1000 events
    this.setLocalStorage('arka_events', events, 86400000); // 24 hours
    
    console.log('📊 Event tracked:', event);
  }

  getSystemInfo() {
    return {
      browser: this.browser,
      device: this.device,
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth
      },
      window: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      performance: this.performance.metrics,
      timestamp: Date.now()
    };
  }
}

// ======================
// 🏗️ Initialize Utils
// ======================
window.arkaUtils = new Utils();

// Export for modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}

// Global utility functions
window.arka = {
  utils: window.arkaUtils,
  log: (message, data) => window.arkaUtils.logInfo(message, data),
  error: (message, error) => window.arkaUtils.logError(message, error),
  notify: (message, type) => window.arkaUtils.showNotification(message, type),
  performance: () => window.arkaUtils.logPerformance(),
  systemInfo: () => window.arkaUtils.getSystemInfo()
};

console.log('🎯 Arka Utils module loaded successfully');
