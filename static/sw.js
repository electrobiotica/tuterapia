/**
 * Tu Terapia AI - Service Worker
 * PWA functionality with offline support
 */

const CACHE_NAME = 'tuterapia-v3'; // <- subir el número
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

const OFFLINE_URL = '/offline.html';

// Archivos críticos para cache
const CRITICAL_CACHE = [
  '/',
  '/chat.html',
  '/dashboard.html',
  '/ejercicios.html',
  '/assets/css/main.css',
  '/assets/js/core/app.js',
  '/assets/js/components/chat.js',
  '/assets/js/components/dashboard.js',
  '/assets/js/components/ejercicios.js',
  '/manifest.json'
];

// Archivos para cache dinámico
const DYNAMIC_CACHE = 'tu-terapia-ai-dynamic-v1';

// Install event
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Cacheando archivos críticos');
        return cache.addAll(CRITICAL_CACHE);
      })
      .then(() => {
        console.log('✅ Service Worker: Instalación completada');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Service Worker: Error en instalación:', error);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activación completada');
        return self.clients.claim();
      })
  );
});

// Fetch event - Network First con Cache Fallback
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }
  
  // Estrategias por tipo de recurso
  if (request.method === 'GET') {
    if (isHTMLRequest(request)) {
      event.respondWith(handleHTMLRequest(request));
    } else if (isAssetRequest(request)) {
      event.respondWith(handleAssetRequest(request));
    } else {
      event.respondWith(handleOtherRequest(request));
    }
  }
});

// Detectar si es request HTML
function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

// Detectar si es asset estático
function isAssetRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/assets/') || 
         url.pathname.includes('.css') || 
         url.pathname.includes('.js') || 
         url.pathname.includes('.png') || 
         url.pathname.includes('.jpg') || 
         url.pathname.includes('.svg');
}

// Manejar requests HTML - Network First
async function handleHTMLRequest(request) {
  try {
    // Intentar red primero
    const response = await fetch(request);
    
    if (response && response.status === 200) {
      // Cachear página exitosa
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
      return response;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('🔄 Service Worker: Red falló, usando cache para:', request.url);
    
    // Buscar en cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback a página offline para HTML
    const offlineResponse = await caches.match(OFFLINE_URL);
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Último recurso: página mínima
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tu Terapia AI - Sin conexión</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              text-align: center; 
              padding: 2rem;
              background: linear-gradient(135deg, #f8fafc, #e2e8f0);
              color: #334155;
            }
            .offline-container {
              max-width: 400px;
              margin: 2rem auto;
              padding: 2rem;
              background: rgba(255,255,255,0.9);
              border-radius: 20px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .btn {
              background: #4f46e5;
              color: white;
              padding: 12px 24px;
              border: none;
              border-radius: 50px;
              cursor: pointer;
              text-decoration: none;
              display: inline-block;
              margin-top: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <h1>🌸 Tu Terapia AI</h1>
            <p>No hay conexión a internet en este momento.</p>
            <p>Tus datos están seguros y la app funcionará cuando te reconectes.</p>
            <button class="btn" onclick="window.location.reload()">
              🔄 Intentar nuevamente
            </button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Manejar assets - Cache First
async function handleAssetRequest(request) {
  try {
    // Buscar en cache primero
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si no está en cache, buscar en red
    const response = await fetch(request);
    
    if (response && response.status === 200) {
      // Cachear asset
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('❌ Service Worker: Error cargando asset:', request.url);
    
    // Para assets críticos, intentar fallback
    if (request.url.includes('main.css')) {
      return new Response('/* Offline mode - CSS not available */', {
        headers: { 'Content-Type': 'text/css' }
      });
    }
    
    if (request.url.includes('.js')) {
      return new Response('console.log("Offline mode - JS not available");', {
        headers: { 'Content-Type': 'application/javascript' }
      });
    }
    
    throw error;
  }
}

// Manejar otros requests
async function handleOtherRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Background Sync (si está disponible)
self.addEventListener('sync', event => {
  console.log('🔄 Service Worker: Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Aquí puedes implementar sincronización de datos
  // Por ejemplo, enviar datos guardados offline cuando vuelva la conexión
  console.log('🔄 Realizando sincronización en background...');
}

// Push notifications (para futuras funcionalidades)
self.addEventListener('push', event => {
  console.log('📱 Service Worker: Push notification recibida');
  
  const options = {
    body: event.data ? event.data.text() : 'Momento para cuidar tu bienestar 🌸',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'terapia-reminder',
    actions: [
      {
        action: 'open-chat',
        title: '💬 Comenzar sesión',
        icon: '/assets/icons/chat-shortcut.png'
      },
      {
        action: 'dismiss',
        title: '✖️ Cerrar'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Tu Terapia AI', options)
  );
});

// Manejar click en notificaciones
self.addEventListener('notificationclick', event => {
  console.log('📱 Click en notificación:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open-chat') {
    event.waitUntil(
      clients.openWindow('/chat.html')
    );
  }
});

// Message event para comunicación con la app
self.addEventListener('message', event => {
  console.log('💬 Service Worker: Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then(cache => cache.addAll(event.data.urls))
    );
  }
});

// Error handling
self.addEventListener('error', event => {
  console.error('❌ Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('❌ Service Worker Unhandled Rejection:', event.reason);
});

console.log('✅ Service Worker: Script cargado correctamente');