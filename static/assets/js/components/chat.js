  // Estado global
    let modo = 'texto', ultimaRespuesta = '';
    let currentMood = '😊', sessionStartTime = Date.now();
    let selectedEmotion = '😊', emotionIntensity = 5;
    
    // Función básica de navegación
  function irAEjercicios(ejercicioSugerido = null) {
    const terapiaActual = localStorage.getItem('terapiaPreferida') || 'humanista';
    let url = `/ejercicios?terapia=${terapiaActual}`;
    
    if (ejercicioSugerido) {
      url += `&ejercicio=${ejercicioSugerido}`;
    }
    
    window.location.href = url;
  }
  // ir a dashboard agregado por mi  

  function irADashboard() {
    window.location.href = '/dashboard';
  }

  // Sistema de progreso unificado
  function actualizarProgreso(actividad, datos = {}) {
    const progreso = JSON.parse(localStorage.getItem('progresoGeneral') || '{"actividades": [], "stats": {}}');
    
    const entrada = {
      tipo: actividad, // 'chat', 'respiracion', 'bitacora'
      timestamp: Date.now(),
      fecha: new Date().toDateString(),
      ...datos
    };
    
    progreso.actividades.unshift(entrada);
    
    // Mantener solo los últimos 100 registros
    if (progreso.actividades.length > 100) {
      progreso.actividades.splice(100);
    }
    
    // Actualizar estadísticas
    if (!progreso.stats[actividad]) {
      progreso.stats[actividad] = { total: 0, tiempoTotal: 0, ultimaVez: null };
    }
    
    progreso.stats[actividad].total++;
    progreso.stats[actividad].ultimaVez = Date.now();
    
    if (datos.duracion) {
      progreso.stats[actividad].tiempoTotal += Math.round(datos.duracion / 60000) || 0;
    }
    
    localStorage.setItem('progresoGeneral', JSON.stringify(progreso));
    return progreso;
  }

  function obtenerEstadisticasGenerales() {
    const progreso = JSON.parse(localStorage.getItem('progresoGeneral') || '{"stats": {}}');
    return progreso.stats;
  }

  function calcularBienestarScore() {
    const stats = obtenerEstadisticasGenerales();
    let score = 5; // Base
    
    if (stats.chat?.total > 0) score += 1;
    if (stats.respiracion?.total > 0) score += 1.5;
    if (stats.bitacora?.total > 0) score += 1;
    
    const diasConsecutivos = calcularDiasConsecutivos();
    if (diasConsecutivos > 3) score += 0.5;
    if (diasConsecutivos > 7) score += 0.5;
    
    return Math.min(Math.round(score * 10) / 10, 10);
  }

  function calcularDiasConsecutivos() {
    const progreso = JSON.parse(localStorage.getItem('progresoGeneral') || '{"actividades": []}');
    const actividades = progreso.actividades;
    
    if (actividades.length === 0) return 0;
    
    let diasConsecutivos = 0;
    for (let i = 0; i < 30; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toDateString();
      
      const tieneActividad = actividades.some(act => act.fecha === fechaStr);
      if (tieneActividad) {
        diasConsecutivos++;
      } else if (i > 0) {
        break;
      }
    }
    return diasConsecutivos;
  }
  // Detectar emociones en el texto
  function detectarEmocionEnTexto(texto) {
    const palabrasEmocionales = {
      '😔': ['triste', 'deprimido', 'melancólico', 'bajo', 'decaído'],
      '😰': ['ansioso', 'nervioso', 'preocupado', 'angustiado', 'inquieto'],
      '😊': ['bien', 'feliz', 'contento', 'tranquilo', 'relajado'],
      '🤔': ['confuso', 'dudoso', 'pensativo', 'reflexivo'],
      '💭': ['perdido', 'enredado', 'bloqueado', 'sin claridad']
    };
    
    const textoLower = texto.toLowerCase();
    for (const [emoji, palabras] of Object.entries(palabrasEmocionales)) {
      if (palabras.some(palabra => textoLower.includes(palabra))) {
        return emoji;
      }
    }
    return null;
  }

  // Compartir estado emocional
  function compartirEstadoEmocional(mood, context) {
    const estado = {
      mood: mood,
      context: context,
      timestamp: Date.now(),
      origen: 'chat'
    };
    localStorage.setItem('estadoEmocionalActual', JSON.stringify(estado));
  }

  // Sugerir ejercicio basado en emoción
  function sugerirEjercicio(tipoEmocion, contexto = '') {
    const sugerencias = {
      '😔': { ejercicio: '4-7-8', razon: 'perfecto para calmar la melancolía' },
      '😰': { ejercicio: '4-7-8', razon: 'excelente para reducir la ansiedad' },
      '🤔': { ejercicio: 'box', razon: 'ideal para encontrar claridad mental' },
      '💭': { ejercicio: 'coherent', razon: 'ayuda a organizar pensamientos' },
      '😊': { ejercicio: 'coherent', razon: 'mantiene y profundiza la calma' }
    };
    
    return sugerencias[tipoEmocion] || { ejercicio: 'coherent', razon: 'ideal para bienestar general' };
  }

  // Mostrar tarjeta de sugerencia
  function mostrarSugerenciaEjercicio(tipoEmocion, contexto = '') {
    const sugerencia = sugerirEjercicio(tipoEmocion, contexto);
    
    const sugerenciaHTML = `
      <div class="suggestion-card" style="
        background: linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(99, 102, 241, 0.05));
        border: 1px solid var(--primary-muted);
        border-radius: 20px;
        padding: 1.5rem;
        margin: 1rem 0;
        animation: slideInUp 0.5s ease-out;
      ">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
          <span style="font-size: 2rem;">🧘</span>
          <div>
            <h4 style="color: var(--primary); font-weight: 600; margin: 0;">
              ¿Te gustaría hacer un ejercicio de respiración?
            </h4>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0.25rem 0 0 0;">
              ${sugerencia.razon}
            </p>
          </div>
        </div>
        <div style="display: flex; gap: 1rem; align-items: center;">
          <button onclick="irAEjercicios('${sugerencia.ejercicio}')" 
                  style="background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 50px; font-weight: 500; cursor: pointer;">
            🌟 Comenzar ${sugerencia.ejercicio}
          </button>
          <button onclick="this.closest('.suggestion-card').remove()" 
                  style="background: transparent; color: var(--text-muted); border: 1px solid var(--border-soft); padding: 0.75rem 1rem; border-radius: 50px; cursor: pointer;">
            Tal vez después
          </button>
        </div>
      </div>
    `;
    
    const chat = document.getElementById('chat');
    chat.insertAdjacentHTML('beforeend', sugerenciaHTML);
    setTimeout(() => chat.scrollTop = chat.scrollHeight, 100);
  }
  function mostrarEstadoSection() {
    mostrar('estadoSection');
// Helpers seguros (si no los tenés ya)
const $ = (id) => document.getElementById(id);
const setText = (id, val) => { const el = $(id); if (el) el.textContent = val; };

function mostrarEstadoSection() {
  // Si estoy en /chat y no existen los elementos del dashboard, redirijo
  const enChat = location.pathname.includes('/chat');
  const idsNecesarios = ['estado-actual','bienestarScore','streakDays','sesionesCompletadas','tiempoReflexion','ejerciciosRealizados'];
  const faltantes = idsNecesarios.filter(id => !$(id));

  if (enChat && faltantes.length) {
    // Evita el TypeError y lleva a la vista correcta
    location.href = '/dashboard#estado';
    return;
  }

  // Mostrar sección si existe en esta página (SPA)
  if ($('estadoSection') && typeof mostrar === 'function') {
    mostrar('estadoSection');
  }

  // Esperar a que DOM de la sección esté visible
  setTimeout(() => {
    // Estado actual (todo null-safe)
    const estado = JSON.parse(localStorage.getItem('estadoEmocionalActual') || '{}');
    const mood = estado.mood || '🌱';
    const contexto = estado.context || 'sin contexto registrado';
    setText('estado-actual', `Estado emocional actual: ${mood} – ${contexto}`);

    // Stats
    const stats = obtenerEstadisticasGenerales();
    const bienestarScore = calcularBienestarScore();
    const diasConsecutivos = calcularDiasConsecutivos();

    setText('bienestarScore', `${bienestarScore}/10`);
    setText('streakDays', `${diasConsecutivos} días`);
    setText('sesionesCompletadas', ((stats.chat?.total || 0) + (stats.respiracion?.total || 0)));

    const minTot = (stats.chat?.tiempoTotal || 0) + (stats.respiracion?.tiempoTotal || 0); // minutos acumulados
    const horas = Math.floor(minTot / 60);
    const mins = minTot % 60;
    setText('tiempoReflexion', `${horas}h ${mins}min`);

    setText('ejerciciosRealizados', (stats.respiracion?.total || 0));
  }, 120); // un poquito más de margen
}

    // Esperar un momento a que el DOM esté visible si venís de otra sección
    setTimeout(() => {
      const estadoElement = document.getElementById("estado-actual");
      if (estadoElement) {
        const estado = JSON.parse(localStorage.getItem('estadoEmocionalActual') || '{}');
        const mood = estado.mood || '🌱';
        const contexto = estado.context || 'sin contexto registrado';
        estadoElement.textContent = `Estado emocional actual: ${mood} – ${contexto}`;
      } else {
        console.warn("⚠️ No se encontró #estado-actual en el DOM.");
      }
    }, 100);
    
    // Actualizar estadísticas reales
    const stats = obtenerEstadisticasGenerales();
    const bienestarScore = calcularBienestarScore();
    const diasConsecutivos = calcularDiasConsecutivos();

    // Actualizar interfaz
    document.getElementById('bienestarScore').textContent = bienestarScore + '/10';
    document.getElementById('streakDays').textContent = diasConsecutivos + ' días';
    document.getElementById('sesionesCompletadas').textContent = (stats.chat?.total || 0) + (stats.respiracion?.total || 0);
    document.getElementById('tiempoReflexion').textContent = Math.round(((stats.chat?.tiempoTotal || 0) + (stats.respiracion?.tiempoTotal || 0)) / 60) + 'h ' + ((stats.chat?.tiempoTotal || 0) + (stats.respiracion?.tiempoTotal || 0)) % 60 + 'min';
    document.getElementById('ejerciciosRealizados').textContent = stats.respiracion?.total || 0;
  } 
    
    // Auto-resize textarea
    function autoResize(textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // Timer de sesión
    function updateSessionTimer() {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      document.getElementById('sessionTimer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    setInterval(updateSessionTimer, 1000);

    // Navegación
    function mostrar(id) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      document.querySelector(`[data-section="${id}"]`)?.classList.add('active');
    }

    // Estados de ánimo
    function setMood(emoji, mood, event) {
      currentMood = emoji;
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      updateQuickResponses(mood);
    }
  const originalSetMood = setMood;
window.setMood = function(emoji, mood, ev) {
  originalSetMood(emoji, mood, ev);
  compartirEstadoEmocional(emoji, mood);
};
// Pasá el evento explícitamente en los handlers HTML: onclick="setMood('😊','tranquilo', event)"
function escucharMicrofono(ev) {
  // ...
  const btn = ev?.target || document.activeElement;
  // ...
}

function guardarEntrada(ev) {
  // ...
  const btn = ev?.target;
  // ...
}
    function updateQuickResponses(mood) {
      const responses = {
        'tranquilo': [
          'Me siento en paz pero quiero profundizar',
          '¿Cómo puedo mantener esta serenidad?',
          'Quiero explorar esta calma interior'
        ],
        'melancólico': [
          'Siento una tristeza que necesito comprender',
          'Todo parece más pesado hoy',
          'Necesito acompañamiento en este momento'
        ],
        'inquieto': [
          'Mi mente no encuentra quietud',
          'Siento una energía nerviosa',
          'Necesito encontrar mi centro'
        ],
        'reflexivo': [
          'Estoy procesando algunas experiencias',
          'Quiero entender mejor lo que siento',
          'Necesito claridad sobre algo importante'
        ],
        'confuso': [
          'No logro entender qué me sucede',
          'Todo parece muy enredado',
          'Busco orientación y claridad'
        ]
      };
      
      const container = document.getElementById('quickResponses');
      container.innerHTML = '';
      responses[mood]?.forEach(response => {
        const btn = document.createElement('button');
        btn.className = 'quick-response';
        btn.textContent = response;
        btn.onclick = () => sendQuickResponse(response);
        container.appendChild(btn);
      });
    }

    function sendQuickResponse(text) {
      document.getElementById('mensaje').value = text;
      enviarMensaje();
    }

    // Dark mode mejorado
    function toggleModo() {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      document.getElementById('themeIcon').textContent = isDark ? '☀️' : '🌙';
      localStorage.setItem('darkMode', isDark);
    }

    // Cargar preferencias
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
      document.getElementById('themeIcon').textContent = '☀️';
    }

    // TTS con configuración suave
    function reproducirUltima() {
      if (!ultimaRespuesta) return;
      const utterance = new SpeechSynthesisUtterance(ultimaRespuesta);
      utterance.lang = 'es-AR';
      utterance.rate = 0.85;
      utterance.pitch = 1.05;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }

    // Typing indicator
    function typing(show) {
      document.getElementById('typing').classList.toggle('hidden', !show);
      if (show) {
        setTimeout(() => {
          document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
        }, 100);
      }
    }

    // Render mensaje con animación suave
    function render(remitente, txt) {
      const container = document.createElement('div');
      container.className = `message-container ${remitente === 'Yo' ? 'message-user' : ''}`;
      
      if (remitente === 'Yo') {
        container.innerHTML = `
          <div class="bubble-me">${txt}</div>
          <div class="avatar avatar-user">${currentMood}</div>
        `;
      } else {
        container.innerHTML = `
          <div class="avatar avatar-bot">✨</div>
          <div class="bubble-bot">${txt}</div>
        `;
      }
      
      document.getElementById('chat').appendChild(container);
      setTimeout(() => {
        document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
      }, 100);
    }

    // Enviar mensaje con contexto emocional
    async function enviarMensaje() {
      const inp = document.getElementById('mensaje');
      const txt = inp.value.trim();
      if (!txt) return;
      // Detectar emoción en el texto
  const emocionDetectada = detectarEmocionEnTexto(txt);
  if (emocionDetectada && emocionDetectada !== currentMood) {
    currentMood = emocionDetectada;
    compartirEstadoEmocional(emocionDetectada, txt);
  }

      render('Yo', txt);
      inp.value = '';
      inp.style.height = 'auto';
      typing(true);

      try {
        await new Promise(r => {
          const w = () => window.puter?.ai?.chat ? r() : setTimeout(w, 50);
          w();
        });
        
        const context = `Eres un terapeuta humanista especializado, cálido y empático. El usuario se siente ${currentMood} actualmente. 

        Tu rol es:
        - Crear un espacio seguro y de aceptación incondicional
        - Usar técnicas de escucha activa y validación emocional
        - Hacer preguntas abiertas que faciliten la autoexploración
        - Responder con genuina calidez humana, no como una IA
        - Adaptar tu lenguaje al estado emocional del usuario
        - Ser conciso pero profundo, evitar respuestas muy largas
        - Usar un lenguaje naturalmente terapéutico, sin jerga técnica
        
        Responde de manera que el usuario sienta que está siendo verdaderamente escuchado y comprendido.`;
        
        const raw = await puter.ai.chat([
          {role: 'system', content: context},
          {role: 'user', content: txt}
        ], {model: 'gpt-4o'});
        
        const rsp = raw?.message?.content || 'Disculpa, en este momento no puedo procesar tu mensaje. ¿Podrías intentar de nuevo?';
        ultimaRespuesta = rsp;
        document.getElementById('btnLeer').classList.remove('hidden');
        
        typing(false);
        render('Bot', rsp);
        guardarConversacion(txt, rsp);
        // Analizar para sugerir ejercicios
  setTimeout(() => {
    analizarParaSugerirEjercicio(txt, rsp);
  }, 2000);
  // Actualizar progreso
  actualizarProgreso('chat', {
    mensajes: 1,
    duracion: Date.now() - sessionStartTime,
    mood: currentMood
  });
  // Analizar cuándo sugerir ejercicios
  function analizarParaSugerirEjercicio(mensajeUsuario, respuestaBot) {
    const palabrasClave = [
      'ansioso', 'ansiedad', 'nervioso', 'preocupado',
      'estresado', 'estrés', 'tenso', 'agobiado',
      'no puedo dormir', 'insomnio', 'cansado',
      'confuso', 'bloqueado', 'sin claridad',
      'necesito calmarme', 'relajarme'
    ];
    
    const textoCompleto = (mensajeUsuario + ' ' + respuestaBot).toLowerCase();
    
    // Si el bot sugiere técnicas de respiración
    if (respuestaBot.toLowerCase().includes('respiración') || 
        respuestaBot.toLowerCase().includes('respira') ||
        respuestaBot.toLowerCase().includes('calma')) {
      mostrarSugerenciaEjercicio(currentMood, mensajeUsuario);
      return;
    }
    
    // Si el usuario menciona palabras clave emocionales
    const palabraEncontrada = palabrasClave.find(palabra => textoCompleto.includes(palabra));
    if (palabraEncontrada) {
      setTimeout(() => {
        mostrarSugerenciaEjercicio(currentMood, palabraEncontrada);
      }, 3000);
    }
  }
        
      } catch (error) {
        typing(false);
        render('Bot', 'Ha ocurrido un inconveniente técnico. Tu espacio sigue siendo seguro, por favor intenta nuevamente.');
        console.error('Error:', error);
      }
    }

    // STT mejorado
    function escucharMicrofono() {
      if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        alert('🎙️ Tu navegador no soporta reconocimiento de voz');
        return;
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-AR';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      // Feedback visual
      const btn = event.target;
      btn.style.background = 'var(--primary)';
      btn.style.color = 'white';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('mensaje').value = transcript;
        autoResize(document.getElementById('mensaje'));
      };
      
      recognition.onend = () => {
        btn.style.background = '';
        btn.style.color = '';
      };
      
      recognition.onerror = (event) => {
        btn.style.background = '';
        btn.style.color = '';
        console.error('Error en reconocimiento de voz:', event.error);
      };
      
      recognition.start();
    }

    // LocalStorage con contexto emocional
    function guardarConversacion(q, r) {
      const log = JSON.parse(localStorage.getItem('chatAI') || '[]');
      log.push({
        q, r, 
        timestamp: Date.now(),
        mood: currentMood,
        sessionId: sessionStartTime
      });
      localStorage.setItem('chatAI', JSON.stringify(log));
    }

    // Bitácora emocional
    function selectEmotion(event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
      const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2);
      const sector = Math.floor(normalizedAngle / (Math.PI / 4));
      
      const emotions = ['😊', '🌸', '✨', '🌱', '💙', '🤔', '😔', '😰'];
      selectedEmotion = emotions[sector];
      document.getElementById('selectedEmotion').textContent = selectedEmotion;
    }

    function updateIntensity(value) {
      emotionIntensity = value;
      document.getElementById('intensityValue').textContent = value;
    }

    function guardarEntrada() {
      const txt = document.getElementById('logInput').value.trim();
      if (!txt) return;
      
      const entrada = {
        fecha: new Date().toLocaleString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        timestamp: Date.now(),
        texto: txt,
        emocion: selectedEmotion,
        intensidad: emotionIntensity,
        mood: currentMood
      };
      
      const bitacora = JSON.parse(localStorage.getItem('bitacoraAI') || '[]');
      bitacora.unshift(entrada);
      localStorage.setItem('bitacoraAI', JSON.stringify(bitacora));
      
      document.getElementById('logInput').value = '';
      cargarBitacora();
      // Actualizar progreso
  actualizarProgreso('bitacora', {
    palabras: txt.length,
    emocion: selectedEmotion,
    intensidad: emotionIntensity
  });
      
      // Feedback visual elegante
      const btn = event.target;
      const originalText = btn.textContent;
      btn.textContent = '✨ Guardado con amor';
      btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 2000);
    }

    function cargarBitacora() {
      const datos = JSON.parse(localStorage.getItem('bitacoraAI') || '[]');
      const lista = document.getElementById('logList');
      
      if (datos.length === 0) {
        lista.innerHTML = `
          <div class="stats-card text-center" style="color: var(--text-secondary);">
            <div class="text-4xl mb-3">📖</div>
            <p>Tu diario emocional está esperando tus primeras reflexiones</p>
          </div>`;
        return;
      }
      
      lista.innerHTML = '';
      datos.forEach((entrada, index) => {
        const div = document.createElement('div');
        div.className = 'stats-card';
        div.innerHTML = `
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${entrada.emocion || '🌸'}</span>
              <div>
                <div class="font-medium" style="color: var(--text-primary);">${entrada.fecha}</div>
                <div class="text-xs" style="color: var(--text-muted);">Intensidad emocional: ${entrada.intensidad || 5}/10</div>
              </div>
            </div>
            <button onclick="eliminarEntrada(${index})" 
                    class="text-red-400 hover:text-red-600 text-sm transition-colors p-1">🗑️</button>
          </div>
          <p class="text-sm leading-relaxed whitespace-pre-wrap" style="color: var(--text-secondary);">${entrada.texto}</p>
        `;
        lista.appendChild(div);
      });
    }

    function eliminarEntrada(index) {
      if (!confirm('¿Estás seguro de eliminar esta reflexión personal?')) return;
      
      const bitacora = JSON.parse(localStorage.getItem('bitacoraAI') || '[]');
      bitacora.splice(index, 1);
      localStorage.setItem('bitacoraAI', JSON.stringify(bitacora));
      cargarBitacora();
    }

    function exportBitacora() {
      const datos = JSON.parse(localStorage.getItem('bitacoraAI') || '[]');
      if (datos.length === 0) {
        alert('Aún no tienes reflexiones para exportar');
        return;
      }
      
      let contenido = `✨ Mi Diario de Bienestar Emocional\n`;
      contenido += `📅 Exportado el ${new Date().toLocaleDateString('es-AR')}\n`;
      contenido += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      
      datos.forEach((entrada, index) => {
        contenido += `${entrada.emocion} ${entrada.fecha}\n`;
        contenido += `💫 Intensidad emocional: ${entrada.intensidad}/10\n\n`;
        contenido += `${entrada.texto}\n\n`;
        if (index < datos.length - 1) contenido += `・ ・ ・\n\n`;
      });
      
      contenido += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      contenido += `💙 Recuerda: cada reflexión es un paso hacia tu bienestar`;
      
      const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mi-diario-emocional-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }

    // Configuración
    function cambiarTerapia(tipo) {
      const terapias = {
        'humanista': { emoji: '🌱', nombre: 'Espacio de Crecimiento' },
        'gestalt': { emoji: '🌀', nombre: 'Conciencia Presente' },
        'cognitivo': { emoji: '🧩', nombre: 'Claridad Mental' },
        'mindfulness': { emoji: '🧘', nombre: 'Atención Plena' },
        'transpersonal': { emoji: '✨', nombre: 'Conexión Profunda' }
      };
      
      const terapia = terapias[tipo];
      if (terapia) {
        document.getElementById('therapyEmoji').textContent = terapia.emoji;
        document.getElementById('tituloTerapia').textContent = terapia.nombre;
        localStorage.setItem('terapiaPreferida', tipo);
      }
    }

    function limpiarDatos() {
      if (!confirm('⚠️ Esta acción eliminará todas tus conversaciones, reflexiones y configuraciones. ¿Estás completamente seguro?')) return;
      
      const confirmacion = prompt('Para confirmar, escribe "ELIMINAR TODO" (en mayúsculas):');
      if (confirmacion !== 'ELIMINAR TODO') {
        alert('Operación cancelada por seguridad.');
        return;
      }
      
      localStorage.removeItem('chatAI');
      localStorage.removeItem('bitacoraAI');
      localStorage.removeItem('terapiaPreferida');
      localStorage.removeItem('darkMode');
      localStorage.removeItem('mensajeTemporal');
      
      alert('✅ Todos los datos han sido eliminados. La aplicación se reiniciará.');
      location.reload();
    }

    // Ayuda contextual
    function showQuickHelp() {
      const helpModal = document.createElement('div');
      helpModal.className = 'fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-6';
      helpModal.style.backdropFilter = 'blur(8px)';
      helpModal.innerHTML = `
        <div class="surface-elevated max-w-lg w-full p-8 max-h-96 overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold" style="color: var(--text-primary);">💡 Cómo usar tu espacio de bienestar</h3>
            <button onclick="this.closest('.fixed').remove()" 
                    class="control-button text-lg">&times;</button>
          </div>
          <div class="space-y-4 text-sm leading-relaxed" style="color: var(--text-secondary);">
            <div class="flex gap-3">
              <span class="text-lg">💬</span>
              <div>
                <strong style="color: var(--text-primary);">Conversación:</strong> 
                Expresa libremente tus sentimientos, el AI responderá con calidez terapéutica
              </div>
            </div>
            <div class="flex gap-3">
              <span class="text-lg">😊</span>
              <div>
                <strong style="color: var(--text-primary);">Estados emocionales:</strong> 
                Selecciona cómo te sientes para personalizar la experiencia
              </div>
            </div>
            <div class="flex gap-3">
              <span class="text-lg">📖</span>
              <div>
                <strong style="color: var(--text-primary);">Diario emocional:</strong> 
                Registra tus reflexiones diarias con la rueda de emociones
              </div>
            </div>
            <div class="flex gap-3">
              <span class="text-lg">🌸</span>
              <div>
                <strong style="color: var(--text-primary);">Seguimiento:</strong> 
                Observa tu crecimiento emocional a través del tiempo
              </div>
            </div>
            <div class="flex gap-3">
              <span class="text-lg">🎙️</span>
              <div>
                <strong style="color: var(--text-primary);">Modo voz:</strong> 
                Habla naturalmente y escucha las respuestas terapéuticas
              </div>
            </div>
          </div>
          <div class="mt-6 p-4 rounded-2xl" style="background: rgba(79, 70, 229, 0.1); border: 1px solid rgba(79, 70, 229, 0.2);">
            <p class="text-xs leading-relaxed" style="color: var(--text-primary);">
              <strong>💙 Recordatorio importante:</strong> Esta aplicación complementa, no reemplaza, la atención profesional de salud mental. En situaciones de crisis, contacta servicios de emergencia o profesionales cualificados.
            </p>
          </div>
        </div>
      `;
      document.body.appendChild(helpModal);
    }

    // Inicialización elegante
    document.addEventListener('DOMContentLoaded', function() {
      // Cargar configuración
      const terapiaGuardada = localStorage.getItem('terapiaPreferida');
      if (terapiaGuardada) {
        cambiarTerapia(terapiaGuardada);
      }
      
      // Enter para enviar
      document.getElementById('mensaje').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          enviarMensaje();
        }
      });

      
      // Mensaje de bienvenida terapéutico
      setTimeout(() => {
        if (document.getElementById('chat').children.length === 0) {
          render('Bot', `Hola, es un gusto acompañarte en este espacio. Veo que te sientes ${currentMood} en este momento. ¿Qué te gustaría explorar juntos hoy?`);
        }
      }, 1500);
      
      // Configurar respuestas rápidas iniciales
      updateQuickResponses('tranquilo');
    });

    // Funcionalidades UX adicionales

    // Auto-save temporal
    let autoSaveTimeout;
    document.getElementById('mensaje').addEventListener('input', function() {
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = setTimeout(() => {
        if (this.value.trim()) {
          localStorage.setItem('mensajeTemporal', this.value);
        }
      }, 1000);
    });

    // Restaurar mensaje temporal
    window.addEventListener('load', function() {
      const mensajeTemporal = localStorage.getItem('mensajeTemporal');
      if (mensajeTemporal && mensajeTemporal.trim()) {
        document.getElementById('mensaje').value = mensajeTemporal;
        autoResize(document.getElementById('mensaje'));
        localStorage.removeItem('mensajeTemporal');
      }
    });

    // Detección de inactividad con mensaje empático
    let inactivityTimer;
    function resetInactivityTimer() {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (document.getElementById('chatSection').classList.contains('active')) {
          const mensajesEmpaticos = [
            'Tómate el tiempo que necesites. Estaré aquí cuando estés listo para continuar. 💙',
            'No hay prisa. Tu proceso es único y lo respeto completamente. ✨',
            'Este espacio es tuyo. Si necesitas una pausa, está bien. Regresa cuando sientas que es el momento. 🌸'
          ];
          const mensaje = mensajesEmpaticos[Math.floor(Math.random() * mensajesEmpaticos.length)];
          render('Bot', mensaje);
        }
      }, 600000); // 10 minutos
    }

    document.addEventListener('click', resetInactivityTimer);
    document.addEventListener('keypress', resetInactivityTimer);
    resetInactivityTimer();