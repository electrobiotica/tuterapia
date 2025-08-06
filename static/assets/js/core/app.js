/**
 * Tu Terapia AI - Sistema Central
 * Optimizado para Performance y Deploy
 */

class TerapiaAIApp {
  constructor() {
    this.version = '1.0.0';
    this.initialized = false;
    this.analytics = null;
    this.storage = null;
    this.theme = 'light';
    
    this.init();
  }

  async init() {
    try {
      // Inicializar componentes core
      await this.initializeCore();
      
      // Inicializar analytics
      this.initializeAnalytics();
      
      // Configurar PWA
      this.initializePWA();
      
      // Event listeners globales
      this.setupGlobalEventListeners();
      
      // Cargar configuración del usuario
      this.loadUserPreferences();
      
      this.initialized = true;
      this.trackEvent('app_initialized', { version: this.version });
      
      console.log('✅ Tu Terapia AI inicializada correctamente');
    } catch (error) {
      console.error('❌ Error inicializando app:', error);
      this.handleInitializationError(error);
    }
  }

  async initializeCore() {
    // Inicializar storage
    this.storage = new StorageManager();
    
    // Cargar configuración
    this.loadConfiguration();
    
    // Configurar tema
    this.initializeTheme();
  }

  initializeAnalytics() {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('config', 'G-XXXXXXXXXX', {
        page_title: document.title,
        page_location: window.location.href,
        custom_map: {
          custom_parameter_1: 'therapy_type',
          custom_parameter_2: 'user_mood'
        }
      });
      
      this.analytics = {
        initialized: true,
        track: this.trackEvent.bind(this)
      };
    }
  }

  initializePWA() {
    // Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('✅ Service Worker registrado:', registration);
        })
        .catch(error => {
          console.log('❌ Error Service Worker:', error);
        });
    }

    // Install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      this.showInstallPrompt(deferredPrompt);
    });
  }

  setupGlobalEventListeners() {
    // Theme toggle
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        this.toggleTheme();
      }
    });

    // Online/Offline detection
    window.addEventListener('online', () => {
      this.handleConnectionChange(true);
    });

    window.addEventListener('offline', () => {
      this.handleConnectionChange(false);
    });

    // Visibility change (para analytics)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('session_pause');
      } else {
        this.trackEvent('session_resume');
      }
    });

    // Beforeunload (para guardar estado)
    window.addEventListener('beforeunload', () => {
      this.saveSessionState();
    });
  }

  loadUserPreferences() {
    const preferences = this.storage.get('userPreferences') || {};
    
    // Tema
    if (preferences.theme) {
      this.setTheme(preferences.theme);
    }
    
    // Configuraciones de terapia
    if (preferences.therapyPreference) {
      this.setTherapyPreference(preferences.therapyPreference);
    }
    
    // Configuraciones de accesibilidad
    if (preferences.accessibility) {
      this.applyAccessibilitySettings(preferences.accessibility);
    }
  }

  initializeTheme() {
    const savedTheme = this.storage.get('theme') || 'light';
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    this.theme = theme;
    document.body.classList.toggle('dark-mode', theme === 'dark');
    this.storage.set('theme', theme);
    
    // Actualizar icon del theme toggle
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  toggleTheme() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    this.trackEvent('theme_changed', { theme: newTheme });
  }

  // Analytics
  trackEvent(eventName, parameters = {}) {
    if (!this.analytics?.initialized) return;
    
    const enrichedParams = {
      ...parameters,
      timestamp: Date.now(),
      page: window.location.pathname,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`
    };
    
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, enrichedParams);
    }
    
    // Console log para desarrollo
    if (window.location.hostname === 'localhost') {
      console.log('📊 Analytics Event:', eventName, enrichedParams);
    }
  }

  // PWA Features
  showInstallPrompt(deferredPrompt) {
    // Mostrar prompt de instalación personalizado
    const installBanner = this.createInstallBanner();
    document.body.appendChild(installBanner);
    
    installBanner.addEventListener('click', async () => {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      this.trackEvent('pwa_install_prompt', { outcome });
      
      if (outcome === 'accepted') {
        this.trackEvent('pwa_installed');
      }
      
      installBanner.remove();
      deferredPrompt = null;
    });
  }

  createInstallBanner() {
    const banner = document.createElement('div');
    banner.className = 'install-banner';
    banner.innerHTML = `
      <div class="install-content">
        <span class="install-icon">📱</span>
        <div class="install-text">
          <strong>Instalar Tu Terapia AI</strong>
          <p>Acceso rápido desde tu pantalla de inicio</p>
        </div>
        <button class="install-btn">Instalar</button>
      </div>
    `;
    
    banner.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 1rem;
      right: 1rem;
      background: var(--surface-elevated);
      backdrop-filter: blur(24px);
      border-radius: 20px;
      padding: 1rem;
      box-shadow: var(--shadow-elevated);
      z-index: 1000;
      animation: slideInUp 0.3s ease-out;
    `;
    
    return banner;
  }

  // Connection Management
  handleConnectionChange(isOnline) {
    const indicator = this.getOrCreateConnectionIndicator();
    
    if (isOnline) {
      indicator.textContent = '🟢 Conectado';
      indicator.className = 'connection-indicator online';
      this.trackEvent('connection_restored');
    } else {
      indicator.textContent = '🔴 Sin conexión';
      indicator.className = 'connection-indicator offline';
      this.trackEvent('connection_lost');
    }
    
    // Auto-hide después de 3 segundos
    setTimeout(() => {
      indicator.style.opacity = '0';
      setTimeout(() => indicator.remove(), 300);
    }, 3000);
  }

  getOrCreateConnectionIndicator() {
    let indicator = document.getElementById('connectionIndicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'connectionIndicator';
      indicator.style.cssText = `
        position: fixed;
        top: 1rem;
        right: 1rem;
        background: var(--surface-elevated);
        padding: 0.5rem 1rem;
        border-radius: 50px;
        font-size: 0.8rem;
        font-weight: 500;
        z-index: 1000;
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(indicator);
    }
    return indicator;
  }

  // Session Management
  saveSessionState() {
    const state = {
      currentPage: window.location.pathname,
      timestamp: Date.now(),
      theme: this.theme,
      sessionDuration: Date.now() - this.sessionStartTime
    };
    
    this.storage.set('lastSession', state);
    this.trackEvent('session_ended', state);
  }

  // Error Handling
  handleInitializationError(error) {
    console.error('Error crítico en inicialización:', error);
    
    // Mostrar mensaje de error al usuario
    this.showErrorMessage('Hubo un problema al inicializar la aplicación. Por favor, recarga la página.');
    
    // Track error
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: error.message,
        fatal: true
      });
    }
  }

  showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <p>${message}</p>
        <button onclick="window.location.reload()" class="btn btn-primary">
          🔄 Recargar
        </button>
      </div>
    `;
    
    errorDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;
    
    document.body.appendChild(errorDiv);
  }

  // Configuración de terapia
  setTherapyPreference(therapyType) {
    const preferences = this.storage.get('userPreferences') || {};
    preferences.therapyPreference = therapyType;
    this.storage.set('userPreferences', preferences);
    
    this.trackEvent('therapy_preference_set', { therapy_type: therapyType });
  }

  // Accesibilidad
  applyAccessibilitySettings(settings) {
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    }
    
    if (settings.largeText) {
      document.body.classList.add('large-text');
    }
    
    if (settings.reducedMotion) {
      document.body.classList.add('reduced-motion');
    }
  }

  // Métodos públicos para uso en componentes
  getCurrentTheme() {
    return this.theme;
  }

  isInitialized() {
    return this.initialized;
  }

  getStorage() {
    return this.storage;
  }

  track(eventName, parameters = {}) {
    this.trackEvent(eventName, parameters);
  }

  // Configuración
  loadConfiguration() {
    this.config = {
      apiEndpoints: {
        analytics: '/api/analytics',
        feedback: '/api/feedback'
      },
      features: {
        pwaInstall: true,
        offlineMode: true,
        analytics: true
      },
      limits: {
        chatSessionTimeout: 30 * 60 * 1000, // 30 minutos
        maxStorageSize: 10 * 1024 * 1024 // 10MB
      }
    };
  }
}

/**
 * Storage Manager - Manejo de LocalStorage optimizado
 */
class StorageManager {
  constructor() {
    this.prefix = 'terapia_ai_';
    this.maxSize = 10 * 1024 * 1024; // 10MB
    this.compressionEnabled = true;
  }

  set(key, value) {
    try {
      const fullKey = this.prefix + key;
      const serialized = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        version: '1.0'
      });
      
      // Verificar tamaño
      if (this.getStorageSize() + serialized.length > this.maxSize) {
        this.cleanup();
      }
      
      localStorage.setItem(fullKey, serialized);
      return true;
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
      return false;
    }
  }

  get(key, defaultValue = null) {
    try {
      const fullKey = this.prefix + key;
      const item = localStorage.getItem(fullKey);
      
      if (!item) return defaultValue;
      
      const parsed = JSON.parse(item);
      return parsed.data;
    } catch (error) {
      console.error('Error leyendo localStorage:', error);
      return defaultValue;
    }
  }

  remove(key) {
    const fullKey = this.prefix + key;
    localStorage.removeItem(fullKey);
  }

  clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }

  getStorageSize() {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .reduce((total, key) => {
        return total + localStorage.getItem(key).length;
      }, 0);
  }

  cleanup() {
    // Eliminar items más antiguos si se alcanza el límite
    const items = Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .map(key => ({
        key,
        timestamp: JSON.parse(localStorage.getItem(key)).timestamp
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
    
    // Eliminar 20% de los items más antiguos
    const toRemove = Math.ceil(items.length * 0.2);
    items.slice(0, toRemove).forEach(item => {
      localStorage.removeItem(item.key);
    });
  }

  // Backup y restore
  export() {
    const data = {};
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => {
        data[key] = localStorage.getItem(key);
      });
    return JSON.stringify(data);
  }

  import(dataString) {
    try {
      const data = JSON.parse(dataString);
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      return true;
    } catch (error) {
      console.error('Error importando datos:', error);
      return false;
    }
  }
}

/**
 * Utilidades globales
 */
window.TerapiaAI = {
  // Función para debug
  debug: {
    getStorage: () => new StorageManager().export(),
    clearStorage: () => new StorageManager().clear(),
    getConfig: () => window.app?.config,
    trackEvent: (name, params) => window.app?.track(name, params)
  },
  
  // Funciones de utilidad
  utils: {
    formatDate: (date) => new Date(date).toLocaleDateString('es-AR'),
    formatTime: (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}min`;
    },
    generateId: () => Math.random().toString(36).substr(2, 9),
    sanitizeText: (text) => text.replace(/[<>]/g, ''),
    getTimeAgo: (timestamp) => {
      const now = Date.now();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
      if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
      if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
      return 'ahora mismo';
    }
  }
};

// Inicializar app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.app = new TerapiaAIApp();
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TerapiaAIApp, StorageManager };
}