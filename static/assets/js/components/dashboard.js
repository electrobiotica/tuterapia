// Variables globales
    let progressChart, activitiesChart;
    
    // Inicialización
    document.addEventListener('DOMContentLoaded', function() {
      loadDashboardData();
      createCharts();
      generateInsights();
      updateWelcomeMessage();
    });

    // Cargar datos del dashboard
    function loadDashboardData() {
      const chatData = JSON.parse(localStorage.getItem('chatAI') || '[]');
      const breathingData = JSON.parse(localStorage.getItem('breathingSessions') || '[]');
      const journalData = JSON.parse(localStorage.getItem('bitacoraAI') || '[]');
      const progressData = JSON.parse(localStorage.getItem('progresoGeneral') || '{"stats": {}}');
      
      // Actualizar estadísticas principales
      updateMainStats(chatData, breathingData, journalData, progressData);
      
      // Cargar timeline de actividades
      loadActivityTimeline(chatData, breathingData, journalData);
      
      // Cargar calendario emocional
      loadMoodCalendar(journalData, chatData);
    }

    // Actualizar estadísticas principales
    function updateMainStats(chatData, breathingData, journalData, progressData) {
      const stats = progressData.stats || {};
      
      // Bienestar score (calculado dinámicamente)
      const bienestarScore = calculateWellnessScore(chatData, breathingData, journalData);
      document.getElementById('bienestarScore').textContent = bienestarScore;
      
      // Días consecutivos
      const streak = calculateCurrentStreak(chatData, breathingData, journalData);
      document.getElementById('streakDays').textContent = streak;
      
      // Sesiones totales
      const totalSessions = (stats.chat?.total || 0) + (stats.respiracion?.total || 0) + (stats.bitacora?.total || 0);
      document.getElementById('totalSessions').textContent = totalSessions;
      
      // Tiempo total
      const totalMinutes = (stats.chat?.tiempoTotal || 0) + (stats.respiracion?.tiempoTotal || 0);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      document.getElementById('totalTime').textContent = `${hours}.${Math.floor(minutes/6)}h`;
    }

    // Calcular score de bienestar
    function calculateWellnessScore(chatData, breathingData, journalData) {
      let score = 5.0; // Base
      
      // Factores positivos
      if (chatData.length > 0) score += 1.0;
      if (breathingData.length > 0) score += 1.5;
      if (journalData.length > 0) score += 1.0;
      
      // Bonificación por actividad reciente (últimos 3 días)
      const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
      const recentActivity = [
        ...chatData.filter(item => item.timestamp > threeDaysAgo),
        ...breathingData.filter(item => item.timestamp > threeDaysAgo),
        ...journalData.filter(item => item.timestamp > threeDaysAgo)
      ];
      
      if (recentActivity.length > 0) score += 0.5;
      if (recentActivity.length > 5) score += 0.5;
      
      // Bonificación por diversidad de actividades
      const hasChat = chatData.some(item => item.timestamp > threeDaysAgo);
      const hasBreathing = breathingData.some(item => item.timestamp > threeDaysAgo);
      const hasJournal = journalData.some(item => item.timestamp > threeDaysAgo);
      
      if ([hasChat, hasBreathing, hasJournal].filter(Boolean).length >= 2) {
        score += 0.5;
      }
      
      return Math.min(Math.round(score * 10) / 10, 10.0);
    }

    // Calcular racha actual
    function calculateCurrentStreak(chatData, breathingData, journalData) {
      const allActivities = [
        ...chatData.map(item => ({ date: new Date(item.timestamp).toDateString() })),
        ...breathingData.map(item => ({ date: new Date(item.timestamp).toDateString() })),
        ...journalData.map(item => ({ date: new Date(item.timestamp).toDateString() }))
      ];
      
      // Obtener fechas únicas y ordenarlas
      const uniqueDates = [...new Set(allActivities.map(item => item.date))].sort((a, b) => new Date(b) - new Date(a));
      
      let streak = 0;
      const today = new Date().toDateString();
      
      for (let i = 0; i < uniqueDates.length; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toDateString();
        
        if (uniqueDates.includes(dateStr)) {
          streak++;
        } else {
          break;
        }
      }
      
      return streak;
    }

    // Cargar timeline de actividades
    function loadActivityTimeline(chatData, breathingData, journalData) {
      const timeline = document.getElementById('activityTimeline');
      
      // Combinar todas las actividades
      const activities = [
        ...chatData.slice(0, 5).map(item => ({
          type: 'chat',
          timestamp: item.timestamp,
          title: 'Sesión de chat terapéutico',
          mood: item.mood || '💬'
        })),
        ...breathingData.slice(0, 5).map(item => ({
          type: 'breathing',
          timestamp: item.timestamp,
          title: `Ejercicio: ${item.exercise}`,
          mood: '🧘'
        })),
        ...journalData.slice(0, 5).map(item => ({
          type: 'journal',
          timestamp: item.timestamp,
          title: 'Entrada en diario emocional',
          mood: item.emocion || '📖'
        }))
      ];
      
      // Ordenar por timestamp
      activities.sort((a, b) => b.timestamp - a.timestamp);
      
      // Mostrar solo los últimos 8
      timeline.innerHTML = activities.slice(0, 8).map(activity => {
        const timeAgo = getTimeAgo(activity.timestamp);
        const iconClass = `timeline-${activity.type}`;
        
        return `
          <div class="timeline-item">
            <div class="timeline-icon ${iconClass}">
              ${activity.mood}
            </div>
            <div class="timeline-content">
              <div class="timeline-title">${activity.title}</div>
              <div class="timeline-time">${timeAgo}</div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Función auxiliar para tiempo relativo
    function getTimeAgo(timestamp) {
      const now = Date.now();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
      if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
      if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
      return 'Ahora mismo';
    }

    // Cargar calendario emocional
    function loadMoodCalendar(journalData, chatData) {
      const calendar = document.getElementById('moodCalendar');
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      
      // Crear mapa de emociones por día
      const emotionMap = {};
      
      journalData.forEach(entry => {
        const date = new Date(entry.timestamp);
        const day = date.getDate();
        if (date.getMonth() === now.getMonth()) {
          emotionMap[day] = entry.emocion || '😊';
        }
      });
      
      chatData.forEach(entry => {
        const date = new Date(entry.timestamp);
        const day = date.getDate();
        if (date.getMonth() === now.getMonth() && !emotionMap[day]) {
          emotionMap[day] = entry.mood || '💬';
        }
      });
      
      // Generar días del calendario
      let calendarHTML = '';
      for (let day = 1; day <= daysInMonth; day++) {
        const emotion = emotionMap[day] || '';
        const isToday = day === now.getDate();
        const dayClass = isToday ? 'calendar-day today' : 'calendar-day';
        
        calendarHTML += `
          <div class="${dayClass}" title="Día ${day}${emotion ? `: ${emotion}` : ''}">
            ${emotion || day}
          </div>
        `;
      }
      
      calendar.innerHTML = calendarHTML;
    }

    // Crear gráficos
    function createCharts() {
      createProgressChart();
      createActivitiesChart();
    }

    // Gráfico de progreso semanal
    function createProgressChart() {
      const ctx = document.getElementById('progressChart').getContext('2d');
      
      // Datos de ejemplo (en una implementación real, serían datos reales)
      const last7Days = [];
      const bienestarData = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('es', { weekday: 'short' }));
        
        // Simular datos de bienestar (en realidad calcularías esto)
        bienestarData.push(Math.random() * 2 + 7); // Entre 7 y 9
      }
      
      progressChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: last7Days,
          datasets: [{
            label: 'Bienestar',
            data: bienestarData,
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#4f46e5',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              min: 5,
              max: 10,
              grid: {
                color: 'rgba(148, 163, 184, 0.1)'
              },
              ticks: {
                color: '#64748b'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#64748b'
              }
            }
          }
        }
      });
    }

    // Gráfico de distribución de actividades
    function createActivitiesChart() {
      const ctx = document.getElementById('activitiesChart').getContext('2d');
      
      const chatSessions = JSON.parse(localStorage.getItem('chatAI') || '[]').length;
      const breathingSessions = JSON.parse(localStorage.getItem('breathingSessions') || '[]').length;
      const journalEntries = JSON.parse(localStorage.getItem('bitacoraAI') || '[]').length;
      
      activitiesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Chat Terapéutico', 'Ejercicios', 'Diario Emocional'],
          datasets: [{
            data: [chatSessions, breathingSessions, journalEntries],
            backgroundColor: [
              '#4f46e5',
              '#10b981',
              '#f59e0b'
            ],
            borderWidth: 0,
            cutout: '70%'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#64748b',
                padding: 20,
                usePointStyle: true
              }
            }
          }
        }
      });
    }

    // Generar insights personalizados
    function generateInsights() {
      const container = document.getElementById('insightsContainer');
      const insights = calculateInsights();
      
      container.innerHTML = insights.map(insight => `
        <div class="insight-card">
          <div class="insight-icon">${insight.icon}</div>
          <div class="insight-title">${insight.title}</div>
          <div class="insight-text">${insight.text}</div>
        </div>
      `).join('');
    }

    // Calcular insights basados en datos reales
    function calculateInsights() {
      const chatData = JSON.parse(localStorage.getItem('chatAI') || '[]');
      const breathingData = JSON.parse(localStorage.getItem('breathingSessions') || '[]');
      const journalData = JSON.parse(localStorage.getItem('bitacoraAI') || '[]');
      
      const insights = [];
      
      // Insight sobre actividad más frecuente
      const activities = {
        chat: chatData.length,
        breathing: breathingData.length,
        journal: journalData.length
      };
      
      const mostActive = Object.keys(activities).reduce((a, b) => 
        activities[a] > activities[b] ? a : b
      );
      
      const activityNames = {
        chat: 'el chat terapéutico',
        breathing: 'los ejercicios de respiración',
        journal: 'tu diario emocional'
      };
      
      insights.push({
        icon: '🎯',
        title: 'Tu fortaleza',
        text: `Has mostrado mayor constancia en ${activityNames[mostActive]}. ¡Sigue así y considera integrar más las otras herramientas!`
      });
      
      // Insight sobre racha
      const streak = calculateCurrentStreak(chatData, breathingData, journalData);
      if (streak >= 3) {
        insights.push({
          icon: '🔥',
          title: 'Constancia admirable',
          text: `Llevas ${streak} días consecutivos cuidando tu bienestar. Esta dedicación es la clave del crecimiento personal.`
        });
      }
      
      // Insight sobre equilibrio
      const activitiesCount = Object.values(activities).filter(count => count > 0).length;
      if (activitiesCount >= 3) {
        insights.push({
          icon: '⚖️',
          title: 'Enfoque integral',
          text: 'Has utilizado todas las herramientas disponibles. Este enfoque holístico potencia tu desarrollo emocional.'
        });
      } else {
        insights.push({
          icon: '🌱',
          title: 'Oportunidad de crecimiento',
          text: 'Considera explorar las herramientas que aún no has utilizado. Cada una ofrece beneficios únicos para tu bienestar.'
        });
      }
      
      // Insight sobre progresión temporal
      const recentData = [...chatData, ...breathingData, ...journalData]
        .filter(item => item.timestamp > Date.now() - (7 * 24 * 60 * 60 * 1000));
      
      if (recentData.length > 5) {
        insights.push({
          icon: '📈',
          title: 'Momento de crecimiento',
          text: 'Has estado especialmente activo esta semana. Tu compromiso con el bienestar está dando frutos.'
        });
      }
      
      return insights.slice(0, 3); // Mostrar máximo 3 insights
    }

    // Actualizar mensaje de bienvenida
    function updateWelcomeMessage() {
      const messages = [
        'Tu viaje de bienestar en una vista completa',
        'Celebrando cada paso hacia tu equilibrio emocional',
        'Tu progreso es único y valioso',
        'Cada día de práctica cuenta en tu crecimiento'
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      document.getElementById('welcomeMessage').textContent = randomMessage;
    }

    // Funciones de exportación
    function exportarProgreso(formato) {
      const data = {
        chat: JSON.parse(localStorage.getItem('chatAI') || '[]'),
        breathing: JSON.parse(localStorage.getItem('breathingSessions') || '[]'),
        journal: JSON.parse(localStorage.getItem('bitacoraAI') || '[]'),
        progress: JSON.parse(localStorage.getItem('progresoGeneral') || '{}'),
        exportDate: new Date().toISOString(),
        bienestarScore: document.getElementById('bienestarScore').textContent,
        streak: document.getElementById('streakDays').textContent
      };
      
      switch(formato) {
        case 'json':
          exportJSON(data);
          break;
        case 'csv':
          exportCSV(data);
          break;
        case 'pdf':
          exportPDF(data);
          break;
      }
    }

    function exportJSON(data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mi-progreso-bienestar-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    function exportCSV(data) {
      const activities = [
        ...data.chat.map(item => ({ tipo: 'Chat', fecha: new Date(item.timestamp), mood: item.mood })),
        ...data.breathing.map(item => ({ tipo: 'Respiración', fecha: new Date(item.timestamp), ejercicio: item.exercise })),
        ...data.journal.map(item => ({ tipo: 'Diario', fecha: new Date(item.timestamp), emocion: item.emocion }))
      ].sort((a, b) => b.fecha - a.fecha);
      
      let csv = 'Fecha,Tipo,Detalles\n';
      activities.forEach(activity => {
        const fecha = activity.fecha.toLocaleDateString();
        const detalles = activity.mood || activity.ejercicio || activity.emocion || '';
        csv += `${fecha},${activity.tipo},${detalles}\n`;
      });
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estadisticas-bienestar-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    function exportPDF(data) {
      // Crear contenido del reporte
      const reportContent = `
        🌟 REPORTE DE BIENESTAR PERSONAL
        ================================
        
        📅 Generado: ${new Date().toLocaleDateString('es-AR')}
        
        📊 ESTADÍSTICAS GENERALES
        -------------------------
        • Bienestar General: ${data.bienestarScore}/10
        • Días Consecutivos: ${data.streak}
        • Sesiones de Chat: ${data.chat.length}
        • Ejercicios de Respiración: ${data.breathing.length}
        • Entradas de Diario: ${data.journal.length}
        
        🎯 ACTIVIDAD RECIENTE
        ---------------------
        ${generateRecentActivityText(data)}
        
        💭 REFLEXIONES DEL DIARIO
        -------------------------
        ${data.journal.slice(0, 5).map(entry => 
          `${new Date(entry.timestamp).toLocaleDateString()}: ${entry.texto.substring(0, 100)}...`
        ).join('\n')}
        
        🌱 CRECIMIENTO PERSONAL
        ----------------------
        Has demostrado un compromiso admirable con tu bienestar emocional.
        Cada sesión, cada respiración consciente, cada reflexión escrita
        contribuye a tu crecimiento personal.
        
        ¡Continúa este hermoso camino hacia el equilibrio!
        
        ---
        Generado por Tu Terapia AI
      `;
      
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-bienestar-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
      // Mostrar confirmación
      setTimeout(() => {
        alert('📄 Tu reporte de bienestar ha sido descargado!\n\nContiene un resumen completo de tu progreso y reflexiones.');
      }, 500);
    }

    function generateRecentActivityText(data) {
      const recentActivities = [
        ...data.chat.slice(0, 3).map(item => `• Chat: ${new Date(item.timestamp).toLocaleDateString()}`),
        ...data.breathing.slice(0, 3).map(item => `• Respiración (${item.exercise}): ${new Date(item.timestamp).toLocaleDateString()}`),
        ...data.journal.slice(0, 3).map(item => `• Diario: ${new Date(item.timestamp).toLocaleDateString()}`)
      ];
      
      return recentActivities.slice(0, 8).join('\n');
    }

    // Animaciones de entrada
    window.addEventListener('load', function() {
      const elements = document.querySelectorAll('.animate-fade-in');
      elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          el.style.transition = 'all 0.6s ease-out';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, index * 100);
      });
    });