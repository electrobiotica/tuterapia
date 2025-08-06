// Añadir al inicio del script
let ambientSound = null;
// Navegación al chat
function volverAlChat() {
  window.location.href = '/chat';
}
// Volver al chat con experiencia del ejercicio
function volverAlChatConExperiencia() {
  // Guardar experiencia del ejercicio para el chat
  const experiencia = {
    ejercicio: currentExercise?.name || 'ejercicio de respiración',
    completado: true,
    ciclos: completedCycles,
    duracion: sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 60000) : 0,
    timestamp: Date.now(),
    estado: '✨' // Estado post-ejercicio
  };
  
  localStorage.setItem('experienciaEjercicio', JSON.stringify(experiencia));
  
  // Ir al chat con parámetro especial
  window.location.href = '/chat?from=ejercicios';
}

// Registrar experiencia en bitácora
function registrarEnBitacora() {
  const entradaBitacora = {
    texto: `Completé un ejercicio de ${currentExercise?.name}. ${completedCycles} ciclos en ${sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 60000) : 0} minutos. Me siento más centrado y relajado.`,
    emocion: '✨',
    intensidad: 8,
    fecha: new Date().toLocaleString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    timestamp: Date.now(),
    mood: '✨',
    tipo: 'ejercicio_respiracion'
  };
  
  const bitacora = JSON.parse(localStorage.getItem('bitacoraAI') || '[]');
  bitacora.unshift(entradaBitacora);
  localStorage.setItem('bitacoraAI', JSON.stringify(bitacora));
  
  // Mostrar confirmación
  alert('✨ Tu experiencia ha sido registrada en tu diario emocional');
  
  // Opción de ir al chat
  if (confirm('¿Te gustaría continuar la conversación en el chat terapéutico?')) {
    volverAlChatConExperiencia();
  }
}
// Función para controlar sonidos ambientales
function toggleAmbientSound(type) {
  if (!audioEnabled) return;
  
  if (ambientSound) {
    ambientSound.pause();
    ambientSound = null;
    return;
  }
  
  // Puedes añadir archivos de audio o usar sonidos generados
  const soundUrls = {
    'rain': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
    'ocean': 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
  };
  
  if (soundUrls[type]) {
    ambientSound = new Audio(soundUrls[type]);
    ambientSound.loop = true;
    ambientSound.volume = 0.2;
    ambientSound.play();
  }
}
// Mensajes cálidos y empáticos
const warmMessages = {
  '4-7-8': {
    start: "Hola, querido... bienvenido a este espacio sagrado... vamos a crear juntos un oasis de calma... respira conmigo...",
    inhale: "Inhala suavemente por la nariz... como si estuvieras recibiendo un abrazo del universo... uno... dos... tres... cuatro...",
    hold: "Ahora sostén esa respiración preciosa... déjala que te llene de paz... uno... dos... tres... cuatro... cinco... seis... siete...",
    exhale: "Y exhala lentamente por la boca... liberando todo lo que no necesitas... uno... dos... tres... cuatro... cinco... seis... siete... ocho... hermoso...",
    complete: "Qué maravilloso... siente cómo tu corazón se serena... tu cuerpo se relaja... continúas haciéndolo bellamente...",
    final: "Has creado algo hermoso en tu interior... esta paz que sientes ahora... es tuya para siempre... llévala contigo..."
  },
  'box': {
    start: "Respira conmigo, alma hermosa... vamos a encontrar tu equilibrio natural... imagina que estás dibujando un cuadrado de luz...",
    inhale: "Inhala con amor... subiendo por el primer lado de tu cuadrado luminoso... uno... dos... tres... cuatro...",
    hold: "Sostén esta respiración dorada... cruzando la parte superior con serenidad... uno... dos... tres... cuatro...",
    exhale: "Exhala con ternura... bajando por el otro lado... liberando cualquier tensión... uno... dos... tres... cuatro...",
    rest: "Pausa suave en la base... preparando el siguiente ciclo con amor... uno... dos... tres... cuatro...",
    complete: "Qué equilibrio tan hermoso has creado... tu sistema nervioso te lo agradece...",
    final: "Tu mente y cuerpo están en perfecta armonía... siente esta serenidad que has cultivado..."
  },
  'coherent': {
    start: "Coloca una mano en tu corazón... siente su ritmo... vamos a crear coherencia entre tu corazón y tu respiración...",
    inhale: "Inhala con el corazón... como si fueras una ola suave del océano... uno... dos... tres... cuatro... cinco...",
    exhale: "Exhala desde el alma... liberando cualquier preocupación... uno... dos... tres... cuatro... cinco...",
    complete: "Siente cómo tu corazón y tu respiración danzan juntos en perfecta armonía...",
    final: "Has creado coherencia en tu ser... esta sincronía es un regalo que te haces a ti mismo..."
  }
};
    // Estado del ejercicio
    let currentExercise = null;
    let isRunning = false;
    let isPaused = false;
    let currentPhase = 0;
    let currentCycle = 1;
    let totalCycles = 4;
    let phaseTimer = 0;
    let sessionStartTime = null;
    let completedCycles = 0;
    
    // Definición de ejercicios
    const exercises = {
      '4-7-8': {
        name: '4-7-8 Relajante',
        phases: [
          { name: 'Inhala suavemente', duration: 4, type: 'inhale', instruction: 'por la nariz' },
          { name: 'Sostén con calma', duration: 7, type: 'hold', instruction: 'sin tensión' },
          { name: 'Exhala completamente', duration: 8, type: 'exhale', instruction: 'por la boca' }
        ],
        cycles: 4,
        description: 'Perfecto para relajarte antes de dormir o calmar la ansiedad',
        instructions: [
          '🌟 Siéntate cómodamente con la espalda recta',
          '👃 Inhala por la nariz durante 4 segundos',
          '⏸️ Sostén la respiración por 7 segundos',
          '👄 Exhala completamente por la boca durante 8 segundos',
          '🔁 Repite el ciclo 4 veces'
        ]
      },
      'box': {
        name: 'Respiración Cuadrada',
        phases: [
          { name: 'Inhala profundo', duration: 4, type: 'inhale', instruction: 'llenando los pulmones' },
          { name: 'Sostén firme', duration: 4, type: 'hold', instruction: 'mantén la calma' },
          { name: 'Exhala lento', duration: 4, type: 'exhale', instruction: 'vaciando completamente' },
          { name: 'Pausa natural', duration: 4, type: 'rest', instruction: 'antes del siguiente ciclo' }
        ],
        cycles: 6,
        description: 'Equilibra tu sistema nervioso y mejora la concentración',
        instructions: [
          '🧘 Encuentra una posición cómoda y estable',
          '📦 Visualiza un cuadrado mientras respiras',
          '⬆️ Inhala subiendo por un lado (4 segundos)',
          '➡️ Sostén cruzando la parte superior (4 segundos)',
          '⬇️ Exhala bajando por el otro lado (4 segundos)',
          '⬅️ Pausa cruzando la base (4 segundos)'
        ]
      },
      'coherent': {
        name: 'Respiración Coherente',
        phases: [
          { name: 'Inhala armonioso', duration: 5, type: 'inhale', instruction: 'con el corazón' },
          { name: 'Exhala en paz', duration: 5, type: 'exhale', instruction: 'liberando tensión' }
        ],
        cycles: 10,
        description: 'Sincroniza corazón y mente para un bienestar profundo',
        instructions: [
          '💙 Coloca una mano en el corazón, otra en el abdomen',
          '🌊 Respira como si fuera una ola suave y constante',
          '💖 Inhala sintiendo cómo se expande tu corazón (5 segundos)',
          '🌸 Exhala liberando cualquier tensión (5 segundos)',
          '🎵 Mantén un ritmo suave y natural durante 10 ciclos'
        ]
      }
    };
    
    // Elementos del DOM
    const elements = {
      selector: document.getElementById('exerciseSelector'),
      instructions: document.getElementById('instructionsPanel'),
      instructionsList: document.getElementById('instructionsList'),
      main: document.getElementById('exerciseMain'),
      setupScreen: document.getElementById('setupScreen'),
      exerciseScreen: document.getElementById('exerciseScreen'),
      completionScreen: document.getElementById('completionScreen'),
      phaseIndicator: document.getElementById('phaseIndicator'),
      breathingCircle: document.getElementById('breathingCircle'),
      circleContent: document.getElementById('circleContent'),
      timerDisplay: document.getElementById('timerDisplay'),
      progressFill: document.getElementById('progressFill'),
      cycleCounter: document.getElementById('cycleCounter'),
      startBtn: document.getElementById('startBtn'),
      pauseBtn: document.getElementById('pauseBtn'),
      stopBtn: document.getElementById('stopBtn'),
      statsDisplay: document.getElementById('statsDisplay')
    };
    
    // Seleccionar ejercicio
  // Modificar la función selectExercise para incluir una bienvenida más cálida
function selectExercise(exerciseKey) {
  currentExercise = exercises[exerciseKey];
  totalCycles = currentExercise.cycles;
  
  // Actualizar UI
  document.querySelectorAll('.exercise-card').forEach(card => {
    card.classList.remove('active');
  });
  document.querySelector(`[data-exercise="${exerciseKey}"]`).classList.add('active');
  
  // Mostrar instrucciones
  elements.instructionsList.innerHTML = '';
  currentExercise.instructions.forEach(instruction => {
    const li = document.createElement('li');
    li.innerHTML = `${instruction.split(' ')[0]}${instruction.substring(instruction.indexOf(' ') + 1)}`;
    elements.instructionsList.appendChild(li);
  });
  elements.instructions.classList.remove('hidden');
  
  // Cambiar a pantalla de ejercicio
  elements.setupScreen.classList.add('hidden');
  elements.exerciseScreen.classList.remove('hidden');
  
  // Reset estado
  resetExercise();
  updateUI();
  
  // Mensaje de bienvenida mejorado
if (audioEnabled) {
  const messages = warmMessages[exerciseKey];
  if (messages) {
    speak(messages.start);
  }
}
}

    // Resetear ejercicio
    function resetExercise() {
      isRunning = false;
      isPaused = false;
      currentPhase = 0;
      currentCycle = 1;
      phaseTimer = 0;
      completedCycles = 0;
      
      elements.breathingCircle.className = 'breathing-circle rest';
      elements.circleContent.textContent = 'Preparado';
      elements.phaseIndicator.textContent = 'Preparándote...';
      elements.timerDisplay.textContent = '0';
      elements.progressFill.style.width = '0%';
      
      elements.startBtn.disabled = false;
      elements.pauseBtn.disabled = true;
      elements.stopBtn.disabled = true;
    }
    
    // Actualizar UI
    function updateUI() {
      elements.cycleCounter.textContent = `Ciclo ${currentCycle} de ${totalCycles}`;
      
      if (currentExercise && isRunning) {
        const phase = currentExercise.phases[currentPhase];
        elements.phaseIndicator.textContent = `${phase.name} ${phase.instruction}`;
        elements.circleContent.textContent = phase.name.split(' ')[0];
        elements.breathingCircle.className = `breathing-circle ${phase.type}`;
        elements.timerDisplay.textContent = Math.ceil(phase.duration - phaseTimer);
        
        // Progress bar
        const totalPhaseTime = currentExercise.phases.reduce((sum, p) => sum + p.duration, 0);
        const currentPhaseTime = currentExercise.phases.slice(0, currentPhase).reduce((sum, p) => sum + p.duration, 0) + phaseTimer;
        const cycleProgress = (currentPhaseTime / totalPhaseTime) * 100;
        const totalProgress = ((currentCycle - 1) / totalCycles * 100) + (cycleProgress / totalCycles);
        elements.progressFill.style.width = `${totalProgress}%`;
      }
    }
    
    // Iniciar ejercicio
    function startExercise() {
      if (!currentExercise) return;
      
      isRunning = true;
      isPaused = false;
      sessionStartTime = sessionStartTime || Date.now();
      
      elements.startBtn.disabled = true;
      elements.pauseBtn.disabled = false;
      elements.stopBtn.disabled = false;
      
      runExercise();
    }
    
    // Pausar ejercicio
    function pauseExercise() {
      isPaused = !isPaused;
      
      elements.pauseBtn.textContent = isPaused ? '▶️ Continuar' : '⏸️ Pausar';
      elements.breathingCircle.classList.toggle('pulsing', isPaused);
      
      if (isPaused) {
        elements.phaseIndicator.textContent = 'Pausado - Respira naturalmente';
        elements.circleContent.textContent = 'Pausa';
      } else {
        runExercise();
      }
    }
    
    // Detener ejercicio
    function stopExercise() {
      isRunning = false;
      isPaused = false;
      
      // Mostrar pantalla de finalización temprana
      showCompletionScreen(false);
    }
    
    // Ejecutar ejercicio
    function runExercise() {
      if (!isRunning || isPaused) return;
      
      const phase = currentExercise.phases[currentPhase];
      
      updateUI();
      
      if (phaseTimer >= phase.duration) {
        // Pasar a la siguiente fase
        phaseTimer = 0;
        currentPhase++;
        
        if (currentPhase >= currentExercise.phases.length) {
          // Completar ciclo
          currentPhase = 0;
          currentCycle++;
          completedCycles++;
          
          if (currentCycle > totalCycles) {
            // Ejercicio completado
            isRunning = false;
            showCompletionScreen(true);
            return;
          }
        }
      }
      
      // Continuar con el timer
      setTimeout(() => {
        if (isRunning && !isPaused) {
          phaseTimer += 0.1;
          runExercise();
        }
      }, 100);
    }
    
    // Mostrar pantalla de finalización
    function showCompletionScreen(completed) {
      elements.exerciseScreen.classList.add('hidden');
      elements.completionScreen.classList.remove('hidden');
      
      const sessionDuration = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : 0;
      const minutes = Math.floor(sessionDuration / 60);
      const seconds = sessionDuration % 60;
      
      // Actualizar estadísticas
      elements.statsDisplay.innerHTML = `
        
          ${completedCycles}
          Ciclos completados

          ${minutes}:${seconds.toString().padStart(2, '0')}
          Tiempo total

          ${currentExercise ? currentExercise.name.split(' ')[0] : 'N/A'}
          Técnica usada

          ${completed ? '100' : Math.round((completedCycles / totalCycles) * 100)}%
          Progreso
        
      `;
      
      // Actualizar mensaje
      const message = completed 
        ? '✨ ¡Excelente trabajo!' 
        : '🌟 ¡Buen intento!';
      const text = completed
        ? 'Has completado tu sesión de respiración. Tómate un momento para notar cómo se siente tu cuerpo y mente ahora.'
        : 'Cada momento de práctica cuenta. Has dado un paso importante hacia tu bienestar.';
      
      document.querySelector('.completion-title').textContent = message;
      document.querySelector('.completion-text').textContent = text;
      
      // Guardar en localStorage
      saveSession({
        exercise: currentExercise?.name || 'Desconocido',
        completedCycles,
        totalCycles,
        duration: sessionDuration,
        completed,
        timestamp: Date.now()
      });
    }
    
    // Nueva sesión
    function startNewSession() {
      sessionStartTime = null;
      resetExercise();
      elements.completionScreen.classList.add('hidden');
      elements.exerciseScreen.classList.remove('hidden');
    }
    
    // Volver al menú
    function goBack() {
      currentExercise = null;
      sessionStartTime = null;
      
      document.querySelectorAll('.exercise-card').forEach(card => {
        card.classList.remove('active');
      });
      
      elements.instructions.classList.add('hidden');
      elements.exerciseScreen.classList.add('hidden');
      elements.completionScreen.classList.add('hidden');
      elements.setupScreen.classList.remove('hidden');
    }
    
    // Guardar sesión
    function saveSession(session) {
      const sessions = JSON.parse(localStorage.getItem('breathingSessions') || '[]');
      sessions.unshift(session);
      
      // Mantener solo las últimas 50 sesiones
      if (sessions.length > 50) {
        sessions.splice(50);
      }
      
      localStorage.setItem('breathingSessions', JSON.stringify(sessions));
      
      // Actualizar estadísticas globales
      updateGlobalStats(session);
    }
    
    // Actualizar estadísticas globales
    function updateGlobalStats(session) {
      const stats = JSON.parse(localStorage.getItem('breathingStats') || '{}');
      
      stats.totalSessions = (stats.totalSessions || 0) + 1;
      stats.totalMinutes = (stats.totalMinutes || 0) + Math.round(session.duration / 60);
      stats.totalCycles = (stats.totalCycles || 0) + session.completedCycles;
      stats.completedSessions = (stats.completedSessions || 0) + (session.completed ? 1 : 0);
      stats.lastSession = session.timestamp;
      
      // Racha actual
      const today = new Date().toDateString();
      const lastSessionDate = stats.lastSessionDate || '';
      
      if (today === lastSessionDate) {
        // Misma fecha, no cambiar racha
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastSessionDate === yesterday.toDateString()) {
          stats.currentStreak = (stats.currentStreak || 0) + 1;
        } else {
          stats.currentStreak = 1;
        }
        
        stats.lastSessionDate = today;
      }
      
      stats.bestStreak = Math.max(stats.bestStreak || 0, stats.currentStreak || 0);
      
      localStorage.setItem('breathingStats', JSON.stringify(stats));
    }
    
    // Cargar estadísticas al inicio
    function loadStats() {
      const stats = JSON.parse(localStorage.getItem('breathingStats') || '{}');
      return stats;
    }
    
    // Mostrar notificación de progreso
    function showProgressNotification() {
      const stats = loadStats();
      
      if (stats.totalSessions && stats.totalSessions % 5 === 0) {
        // Cada 5 sesiones mostrar celebración
        setTimeout(() => {
          showCelebration(`¡${stats.totalSessions} sesiones completadas! 🎉`);
        }, 2000);
      }
      
      if (stats.currentStreak && stats.currentStreak % 3 === 0) {
        // Cada 3 días de racha
        setTimeout(() => {
          showCelebration(`¡${stats.currentStreak} días consecutivos! 🔥`);
        }, 3000);
      }
    }
    
    // Mostrar celebración
    function showCelebration(message) {
      const celebration = document.createElement('div');
      celebration.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #d1fae5, #a7f3d0);
        border: 2px solid #10b981;
        border-radius: 12px;
        padding: 1rem 1.5rem;
        color: #047857;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.5s ease-out;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      
      celebration.textContent = message;
      document.body.appendChild(celebration);
      
      setTimeout(() => {
        celebration.style.animation = 'slideOut 0.5s ease-in';
        setTimeout(() => celebration.remove(), 500);
      }, 4000);
    }
    
    // Añadir estilos para las animaciones
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    // Inicialización
    document.addEventListener('DOMContentLoaded', function() {
      // Cargar estadísticas de ejemplo si es la primera vez
      const stats = loadStats();
      if (!stats.totalSessions) {
        console.log('¡Bienvenido a los ejercicios de respiración!');
      }
      
      // Mostrar hint inicial
      setTimeout(() => {
        if (!currentExercise) {
          elements.phaseIndicator.textContent = '👆 Selecciona un ejercicio arriba para comenzar';
        }
      }, 2000);
    });
    
    // Atajos de teclado
    document.addEventListener('keydown', function(event) {
      if (!currentExercise) return;
      
      switch(event.code) {
        case 'Space':
          event.preventDefault();
          if (!isRunning) {
            startExercise();
          } else {
            pauseExercise();
          }
          break;
        case 'Escape':
          event.preventDefault();
          if (isRunning) {
            stopExercise();
          } else {
            goBack();
          }
          break;
        case 'KeyR':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            startNewSession();
          }
          break;
      }
    });
    
    // Prevenir que el usuario se vaya accidentalmente durante una sesión
    window.addEventListener('beforeunload', function(event) {
      if (isRunning && !isPaused) {
        event.preventDefault();
        event.returnValue = '¿Estás seguro de que quieres salir durante tu sesión de respiración?';
        return event.returnValue;
      }
    });
    
    // Integración con el chat principal (si existe)
    function integrateWithMainApp() {
      // Función para ser llamada desde la app principal
      window.startBreathingExercise = function(exerciseType = '4-7-8') {
        if (exercises[exerciseType]) {
          selectExercise(exerciseType);
          setTimeout(startExercise, 1000);
        }
      };
      
      // Función para obtener estadísticas
      window.getBreathingStats = function() {
        return loadStats();
      };
      
      // Función para obtener sesiones recientes
      window.getRecentBreathingSessions = function(limit = 10) {
        const sessions = JSON.parse(localStorage.getItem('breathingSessions') || '[]');
        return sessions.slice(0, limit);
      };
    }
    
    // Wake Lock API para mantener la pantalla encendida durante los ejercicios
    let wakeLock = null;
    
    async function requestWakeLock() {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('Wake Lock activado para mantener la pantalla encendida');
        } catch (err) {
          console.log('No se pudo activar Wake Lock:', err);
        }
      }
    }
    
    function releaseWakeLock() {
      if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
        console.log('Wake Lock liberado');
      }
    }
    
    // Activar Wake Lock al iniciar ejercicio
    const originalStartExercise = startExercise;
    startExercise = function() {
      requestWakeLock();
      originalStartExercise();
    };
    
    // Liberar Wake Lock al terminar
    // Modificar la función showCompletionScreen
const originalShowCompletionScreen = showCompletionScreen;
showCompletionScreen = function(completed) {
  releaseWakeLock();
  
  if (completed && audioEnabled) {
    const exerciseType = currentExercise?.name?.split(' ')[0] || '';
    const finalMessages = {
      '4-7-8': "Hermoso trabajo... has completado tu sesión de 4-7-8... siente la profunda calma que ahora habita en ti... este estado de paz te acompañará el resto del día...",
      'box': "Excelente práctica... tu sistema nervioso está más equilibrado... lleva esta sensación de armonía a tus actividades diarias...",
      'coherent': "Magnífico... has creado una hermosa coherencia entre tu corazón y tu respiración... este estado de bienestar es un regalo que te haces a ti mismo..."
    };
    
    // Pequeña pausa antes del mensaje final
    setTimeout(() => {
      speak(finalMessages[exerciseType] || "Excelente trabajo... has completado tu sesión...");
    }, 1000);
  }
  
  originalShowCompletionScreen(completed);
  showProgressNotification();
};
    
    // Inicializar integración
    integrateWithMainApp();
// Estado del audio
let audioEnabled = false;
let speechSettings = {
  rate: 0.9,
  pitch: 1.0,
  lang: 'es-AR'
};

// Función para alternar audio
function toggleAudio() {
  audioEnabled = !audioEnabled;
  const btn = document.getElementById('audioBtn');
  const settings = document.getElementById('audioSettings');
  
  if (audioEnabled) {
    btn.classList.add('active');
    btn.textContent = '🔇';
    settings.classList.remove('hidden');
    
    // Mensaje inicial
    speak("Comenzamos. Encuentra una posición cómoda y relaja tus hombros.");
  } else {
    btn.classList.remove('active');
    btn.textContent = '🔊';
    settings.classList.add('hidden');
    
    // Detener cualquier voz en curso
    speechSynthesis.cancel();
  }
}

// Función para hablar
// Reemplazar la función speak con esta versión mejorada
// Reemplazar la función speak con esta versión mejorada
function speak(text) {
  if (!audioEnabled || !('speechSynthesis' in window)) return;
  
  speechSynthesis.cancel();
  
  // Seleccionar mejor voz disponible
  const voices = speechSynthesis.getVoices();
  let bestVoice = voices.find(voice => 
    voice.lang.includes('es') && (
      voice.name.includes('female') ||
      voice.name.includes('mujer') ||
      voice.name.includes('premium') ||
      voice.name.includes('neural') ||
      voice.name.includes('Siri')
    )
  );
  
  // Si no encuentra voz premium, usar la primera femenina en español
  if (!bestVoice) {
    bestVoice = voices.find(voice => 
      voice.lang.includes('es') && voice.name.toLowerCase().includes('female')
    );
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  if (bestVoice) utterance.voice = bestVoice;
  
  // Configuración más cálida y natural
  utterance.lang = 'es-AR';
  utterance.rate = 0.75;    // Más lento = más cálido
  utterance.pitch = 0.9;    // Ligeramente más grave
  utterance.volume = 0.7;   // Más suave
  
  // Pausas naturales para mayor calidez
  utterance.onboundary = function(event) {
    if (event.name === 'word') {
      const char = text[event.charIndex - 1];
      if (char === '.' || char === '...') {
        speechSynthesis.pause();
        setTimeout(() => speechSynthesis.resume(), 600);
      }
    }
  };
  
  speechSynthesis.speak(utterance);
   
// Indicador visual más suave
  const phaseIndicator = document.getElementById('phaseIndicator');
  phaseIndicator.innerHTML += '';
  
  setTimeout(() => {
    const indicator = phaseIndicator.querySelector('.speaking-indicator');
    if (indicator) indicator.remove();
  }, 1500);
}

// Actualizar configuración de voz
function updateSpeechSettings() {
  speechSettings.rate = parseFloat(document.getElementById('speechRate').value);
  speechSettings.pitch = parseFloat(document.getElementById('speechPitch').value);
  
  document.getElementById('rateValue').textContent = speechSettings.rate;
  document.getElementById('pitchValue').textContent = speechSettings.pitch;
  
  // Guardar preferencias
  localStorage.setItem('speechSettings', JSON.stringify(speechSettings));
}

// Cargar configuración guardada
function loadSpeechSettings() {
  const saved = localStorage.getItem('speechSettings');
  if (saved) {
    speechSettings = JSON.parse(saved);
    document.getElementById('speechRate').value = speechSettings.rate;
    document.getElementById('speechPitch').value = speechSettings.pitch;
    document.getElementById('rateValue').textContent = speechSettings.rate;
    document.getElementById('pitchValue').textContent = speechSettings.pitch;
  }
}
// Añadir esta función después de las existentes
function playEncouragementMessage() {
  if (!audioEnabled || !isRunning) return;
  
  const encouragements = [
    "Estás haciendo un excelente trabajo... sigue respirando con calma...",
    "Cada respiración te acerca a la paz interior... muy bien...",
    "Siente cómo tu cuerpo se relaja con cada ciclo... continúa así...",
    "Bien hecho... estás creando un espacio de calma en tu interior...",
    "Tu mente y cuerpo te lo agradecen... sigue así...",
    "Siente la calma que se expande en ti... hermoso trabajo..."
  ];
  
  const randomMessage = encouragements[Math.floor(Math.random() * encouragements.length)];
  speak(randomMessage);
}
// Modificar la función runExercise para incluir audio
// Modificar la función runExercise para una experiencia más fluida
const originalRunExercise = runExercise;
runExercise = function() {
  if (!isRunning || isPaused) return;
  
  const phase = currentExercise.phases[currentPhase];
  
  // Audio guía mejorado
  if (audioEnabled && phaseTimer === 0) {
  const exerciseType = currentExercise?.name?.split(' ')[0]?.toLowerCase();
  const messages = warmMessages[exerciseType] || warmMessages['coherent'];
  
  const phaseMessages = {
    'inhale': messages.inhale,
    'hold': messages.hold, 
    'exhale': messages.exhale,
    'rest': messages.rest
  };
  
  const message = phaseMessages[phase.type] || phase.name;
  speak(message);
}
  
  // Llamar a la función original
  originalRunExercise();
};

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  loadSpeechSettings();
  // Verificar si viene con ejercicio sugerido desde el chat
const urlParams = new URLSearchParams(window.location.search);
const ejercicioSugerido = urlParams.get('ejercicio');

if (ejercicioSugerido && exercises[ejercicioSugerido]) {
  // Auto-seleccionar el ejercicio sugerido
  setTimeout(() => {
    selectExercise(ejercicioSugerido);
    
    // Mostrar mensaje especial
    const mensajeSugerencia = document.createElement('div');
    mensajeSugerencia.style.cssText = `
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(99, 102, 241, 0.05));
      border: 1px solid var(--primary-muted);
      border-radius: 20px;
      padding: 1rem;
      margin-bottom: 1rem;
      text-align: center;
      animation: slideInUp 0.5s ease-out;
    `;
    
    mensajeSugerencia.innerHTML = `
      
        🎯 Ejercicio Sugerido

        Este ejercicio fue seleccionado específicamente para ti basado en nuestra conversación
      
    `;
    
    document.querySelector('.exercise-container').insertBefore(
      mensajeSugerencia, 
      document.querySelector('.exercise-selector')
    );
  }, 500);
}
  // Esperar a que las voces estén cargadas
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadSpeechSettings;
  }
});