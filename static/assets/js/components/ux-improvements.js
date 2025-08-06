// Añadir a /static/assets/js/components/ux-improvements.js

class UXEnhancements {
  constructor() {
    this.userPlan = 'free'; // Se actualizará dinámicamente
    this.usage = {};
    this.init();
  }

  async init() {
    // Cargar estado del usuario
    await this.loadUserStatus();
    
    // Inicializar mejoras UX
    this.initWelcomeModal();
    this.initUpgradeModals();
    this.initFeedbackLoops();
    this.initContextualSuggestions();
    this.initProgressCelebrations();
  }

  async loadUserStatus() {
    try {
      const response = await fetch('/api/user/status');
      const data = await response.json();
      
      this.userPlan = data.plan;
      this.usage = data.usage;
      
      console.log('📊 User status loaded:', data);
    } catch (error) {
      console.error('Error loading user status:', error);
    }
  }

  // 1. MODAL DE BIENVENIDA
  initWelcomeModal() {
    // Solo mostrar en primera visita
    const hasVisited = localStorage.getItem('hasVisited');
    
    if (!hasVisited && window.location.pathname === '/') {
      setTimeout(() => {
        this.showWelcomeModal();
        localStorage.setItem('hasVisited', 'true');
      }, 2000);
    }
  }

  showWelcomeModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6';
    modal.style.backdropFilter = 'blur(8px)';
    
    modal.innerHTML = `
      <div class="surface-elevated max-w-lg w-full p-8 rounded-3xl shadow-2xl animate-fade-in">
        <div class="text-center mb-6">
          <div class="text-6xl mb-4">🌸</div>
          <h3 class="text-2xl font-semibold mb-2" style="color: var(--text-primary);">
            Bienvenido a Tu Terapia AI
          </h3>
          <p class="text-base" style="color: var(--text-secondary);">
            Tu espacio personal de bienestar emocional
          </p>
        </div>
        
        <div class="space-y-4 mb-6">
          <div class="flex items-start gap-3">
            <span class="text-2xl">🧠</span>
            <div>
              <h4 class="font-semibold" style="color: var(--text-primary);">10 Enfoques Terapéuticos</h4>
              <p class="text-sm" style="color: var(--text-secondary);">
                Desde Humanista hasta Transpersonal, encuentra el que resuene contigo
              </p>
            </div>
          </div>
          
          <div class="flex items-start gap-3">
            <span class="text-2xl">🔒</span>
            <div>
              <h4 class="font-semibold" style="color: var(--text-primary);">100% Privado</h4>
              <p class="text-sm" style="color: var(--text-secondary);">
                Tus conversaciones nunca salen de tu navegador
              </p>
            </div>
          </div>
          
          <div class="flex items-start gap-3">
            <span class="text-2xl">💙</span>
            <div>
              <h4 class="font-semibold" style="color: var(--text-primary);">Siempre Disponible</h4>
              <p class="text-sm" style="color: var(--text-secondary);">
                24/7 para acompañarte en tu crecimiento personal
              </p>
            </div>
          </div>
        </div>
        
        <div class="flex gap-3">
          <button onclick="this.closest('.fixed').remove(); window.location.href='/chat'" 
                  class="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-2xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all">
            🚀 Comenzar Ahora
          </button>
          <button onclick="this.closest('.fixed').remove()" 
                  class="px-6 py-3 rounded-2xl border border-gray-300 hover:bg-gray-50 transition-colors">
            Explorar Primero
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  // 2. MODALES DE UPGRADE
  initUpgradeModals() {
    this.createUpgradeModalStyle();
  }

  createUpgradeModalStyle() {
    const style = document.createElement('style');
    style.textContent = `
      .upgrade-modal {
        background: linear-gradient(135deg, rgba(79, 70, 229, 0.95), rgba(99, 102, 241, 0.95));
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .upgrade-feature {
        padding: 1rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .pulse-button {
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    `;
    document.head.appendChild(style);
  }

  async showUpgradeModal(context = 'general') {
    // Verificar límites primero
    const limitCheck = await this.checkLimits('chat');
    
    if (limitCheck.success) return; // No mostrar modal si puede continuar
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6';
    
    const contextMessages = {
      'chat_limit': {
        title: '💬 Has alcanzado tu límite de chats',
        subtitle: 'Continúa tu crecimiento personal sin restricciones'
      },
      'therapy_locked': {
        title: '🔐 Enfoque Premium',
        subtitle: 'Desbloquea todos los enfoques terapéuticos especializados'
      },
      'general': {
        title: '✨ Lleva tu bienestar al siguiente nivel',
        subtitle: 'Acceso completo a todas las herramientas'
      }
    };
    
    const message = contextMessages[context] || contextMessages['general'];
    
    modal.innerHTML = `
      <div class="upgrade-modal max-w-md w-full p-8 rounded-3xl shadow-2xl text-white">
        <div class="text-center mb-6">
          <div class="text-5xl mb-4">💎</div>
          <h3 class="text-2xl font-bold mb-2">${message.title}</h3>
          <p class="text-blue-100">${message.subtitle}</p>
        </div>
        
        <div class="space-y-3 mb-6">
          <div class="upgrade-feature">
            <div class="flex items-center gap-3">
              <span class="text-xl">💬</span>
              <span class="font-medium">Chats ilimitados</span>
            </div>
          </div>
          
          <div class="upgrade-feature">
            <div class="flex items-center gap-3">
              <span class="text-xl">🧠</span>
              <span class="font-medium">Todos los enfoques terapéuticos</span>
            </div>
          </div>
          
          <div class="upgrade-feature">
            <div class="flex items-center gap-3">
              <span class="text-xl">📊</span>
              <span class="font-medium">Dashboard avanzado</span>
            </div>
          </div>
          
          <div class="upgrade-feature">
            <div class="flex items-center gap-3">
              <span class="text-xl">🧘</span>
              <span class="font-medium">50+ ejercicios exclusivos</span>
            </div>
          </div>
        </div>
        
        <div class="text-center mb-6">
          <div class="text-3xl font-bold mb-1">$9.99</div>
          <div class="text-blue-200 text-sm">por mes • cancela cuando quieras</div>
        </div>
        
        <div class="flex flex-col gap-3">
          <button onclick="this.upgradeNow('premium')" 
                  class="pulse-button w-full bg-white text-blue-600 py-4 px-6 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-colors">
            🚀 Upgradeaar Ahora
          </button>
          <button onclick="this.closest('.fixed').remove()" 
                  class="w-full py-3 px-6 rounded-2xl border border-white border-opacity-30 hover:bg-white hover:bg-opacity-10 transition-colors">
            Continuar Gratis
          </button>
        </div>
        
        <div class="text-center mt-4">
          <p class="text-xs text-blue-200">
            🔒 Pago seguro • 30 días de garantía
          </p>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Método para upgrade
    modal.querySelector('button[onclick*="upgradeNow"]').onclick = () => {
      this.upgradeNow('premium');
    };
  }

  async upgradeNow(plan) {
    try {
      const response = await fetch('/api/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan })
      });
      
      const data = await response.json();
      
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.error('Error en upgrade:', error);
      alert('Error procesando el upgrade. Inténtalo nuevamente.');
    }
  }

  // 3. FEEDBACK LOOPS POST-CONVERSACIÓN
  initFeedbackLoops() {
    // Escuchar eventos de fin de conversación
    document.addEventListener('conversationEnded', () => {
      setTimeout(() => {
        this.showFeedbackModal();
      }, 2000);
    });
  }

  showFeedbackModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-6';
    
    modal.innerHTML = `
      <div class="surface-elevated max-w-sm w-full p-6 rounded-3xl shadow-2xl">
        <div class="text-center mb-4">
          <div class="text-4xl mb-3">🌟</div>
          <h3 class="text-lg font-semibold mb-2" style="color: var(--text-primary);">
            ¿Cómo te sientes ahora?
          </h3>
          <p class="text-sm" style="color: var(--text-secondary);">
            Tu feedback nos ayuda a mejorar
          </p>
        </div>
        
        <div class="flex justify-center gap-2 mb-4">
          <button onclick="this.sendFeedback(5)" class="text-3xl hover:scale-110 transition-transform">😊</button>
          <button onclick="this.sendFeedback(4)" class="text-3xl hover:scale-110 transition-transform">🙂</button>
          <button onclick="this.sendFeedback(3)" class="text-3xl hover:scale-110 transition-transform">😐</button>
          <button onclick="this.sendFeedback(2)" class="text-3xl hover:scale-110 transition-transform">🙁</button>
          <button onclick="this.sendFeedback(1)" class="text-3xl hover:scale-110 transition-transform">😔</button>
        </div>
        
        <button onclick="this.closest('.fixed').remove()" 
                class="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
          Saltar por ahora
        </button>
      </div>
    `;
    
    // Añadir función de feedback
    modal.querySelectorAll('button[onclick*="sendFeedback"]').forEach(btn => {
      btn.onclick = (e) => {
        const rating = parseInt(e.target.getAttribute('onclick').match(/\d+/)[0]);
        this.sendFeedback(rating);
        modal.remove();
      };
    });
    
    document.body.appendChild(modal);
  }

  sendFeedback(rating) {
    // Enviar feedback a analytics
    this.trackEvent('session_feedback', { rating });
    
    // Mostrar agradecimiento
    this.showToast(rating >= 4 ? '💙 ¡Gracias! Nos alegra haberte ayudado' : '🌱 Gracias por tu feedback. Seguiremos mejorando');
  }

  // 4. SUGERENCIAS CONTEXTUALES
  initContextualSuggestions() {
    // Observar patrones de uso para sugerencias inteligentes
    this.observeUserBehavior();
  }

  observeUserBehavior() {
    // Sugerir ejercicios después de conversaciones emotivas
    // Sugerir diferentes enfoques terapéuticos
    // Recordatorios suaves de actividad
    
    // Ejemplo: Después de 3 chats en el mismo día, sugerir ejercicios
    const todayChats = this.getTodayActivity('chat');
    if (todayChats >= 3) {
      setTimeout(() => {
        this.suggestBreathingExercise();
      }, 5000);
    }
  }

  suggestBreathingExercise() {
    const suggestion = document.createElement('div');
    suggestion.className = 'fixed bottom-20 right-6 surface-elevated p-4 rounded-2xl shadow-2xl max-w-sm z-40';
    suggestion.style.animation = 'slideInUp 0.5s ease-out';
    
    suggestion.innerHTML = `
      <div class="flex items-start gap-3">
        <span class="text-2xl">🧘</span>
        <div class="flex-1">
          <h4 class="font-semibold text-sm mb-1" style="color: var(--text-primary);">
            ¿Un momento de calma?
          </h4>
          <p class="text-xs mb-3" style="color: var(--text-secondary);">
            Has tenido una sesión intensa. ¿Te gustaría un ejercicio de respiración?
          </p>
          <div class="flex gap-2">
            <button onclick="window.location.href='/ejercicios'" 
                    class="bg-blue-500 text-white px-3 py-1 rounded-full text-xs hover:bg-blue-600">
              Sí, vamos 🌟
            </button>
            <button onclick="this.closest('.fixed').remove()" 
                    class="text-gray-500 px-3 py-1 rounded-full text-xs hover:text-gray-700">
              Ahora no
            </button>
          </div>
        </div>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
          ×
        </button>
      </div>
    `;
    
    document.body.appendChild(suggestion);
    
    // Auto-remover después de 10 segundos
    setTimeout(() => {
      if (suggestion.parentElement) {
        suggestion.remove();
      }
    }, 10000);
  }

  // 5. CELEBRACIONES DE PROGRESO
  initProgressCelebrations() {
    this.checkMilestones();
  }

  checkMilestones() {
    const totalSessions = this.usage.total_sessions || 0;
    const streakDays = this.usage.streak_days || 0;
    
    // Celebrar hitos importantes
    if (totalSessions === 5) {
      this.celebrateMilestone('🎉 ¡5 sesiones completadas!', 'Estás construyendo un hábito saludable');
    } else if (totalSessions === 10) {
      this.celebrateMilestone('⭐ ¡10 sesiones!', 'Tu dedicación al bienestar es admirable');
    } else if (streakDays === 7) {
      this.celebrateMilestone('🔥 ¡Una semana consecutiva!', 'La constancia es la clave del crecimiento');
    }
  }

  celebrateMilestone(title, message) {
    const celebration = document.createElement('div');
    celebration.className = 'fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-6';
    
    celebration.innerHTML = `
      <div class="surface-elevated max-w-sm w-full p-8 rounded-3xl shadow-2xl text-center">
        <div class="text-6xl mb-4">🎊</div>
        <h3 class="text-xl font-bold mb-2" style="color: var(--text-primary);">
          ${title}
        </h3>
        <p class="text-sm mb-6" style="color: var(--text-secondary);">
          ${message}
        </p>
        <button onclick="this.closest('.fixed').remove()" 
                class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-2xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all">
          ¡Continuar creciendo! 🌱
        </button>
      </div>
    `;
    
    document.body.appendChild(celebration);
    
    // Confetti effect (opcional)
    this.showConfetti();
  }

  // UTILIDADES
  async checkLimits(action) {
    try {
      const response = await fetch('/api/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          user_plan: this.userPlan,
          current_usage: this.usage
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error checking limits:', error);
      return { success: true }; // Fallback: permitir acción
    }
  }

  trackEvent(eventName, properties = {}) {
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_name: eventName,
        properties: {
          ...properties,
          timestamp: Date.now(),
          user_plan: this.userPlan
        }
      })
    });
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-6 right-6 surface-elevated p-4 rounded-2xl shadow-2xl z-50';
    toast.style.animation = 'slideInDown 0.3s ease-out';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOutUp 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  getTodayActivity(type) {
    // Simular conteo de actividad del día
    return Math.floor(Math.random() * 5);
  }

  showConfetti() {
    // Implementación opcional de confetti
    console.log('🎊 Confetti!');
  }
}

// Inicializar automáticamente
document.addEventListener('DOMContentLoaded', () => {
  window.uxEnhancements = new UXEnhancements();
});

// CSS adicional para animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideInDown {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideOutUp {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(-100%); opacity: 0; }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.6s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);