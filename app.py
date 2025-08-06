"""
Tu Terapia AI - Backend Flask Completo Optimizado para Vercel
Versión completa con TODAS las funcionalidades restauradas
"""

from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_from_directory
import os
import json
import logging
import requests
import uuid
from datetime import datetime, timedelta
from functools import wraps

# Configuración optimizada para Vercel
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_secret_key_change_in_production')

# Logging para Vercel
if os.environ.get('VERCEL_ENV'):
    logging.basicConfig(level=logging.INFO)
else:
    logging.basicConfig(level=logging.DEBUG)

logger = logging.getLogger(__name__)

# Variables de entorno
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')
ENVIRONMENT = os.environ.get('VERCEL_ENV', 'development')
ANALYTICS_ID = os.environ.get('ANALYTICS_ID', '')

# Configuración OpenAI
OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions"
OPENAI_HEADERS = {
    "Authorization": f"Bearer {OPENAI_API_KEY}",
    "Content-Type": "application/json"
} if OPENAI_API_KEY else None

# Planes de suscripción
PLANS = {
    'free': {
        'name': 'Gratuito',
        'price': 0,
        'chat_limit': 10,
        'therapy_approaches': ['humanista', 'cognitivo', 'mindfulness'],
        'exercises': ['4-7-8', 'box', 'coherent'],
        'dashboard': 'basic'
    },
    'premium': {
        'name': 'Premium',
        'price': 9.99,
        'chat_limit': -1,  # Ilimitado
        'therapy_approaches': 'all',
        'exercises': 'all',
        'dashboard': 'advanced'
    },
    'pro': {
        'name': 'Pro',
        'price': 19.99,
        'chat_limit': -1,
        'therapy_approaches': 'all',
        'exercises': 'all',
        'dashboard': 'pro',
        'ai_advanced': True
    }
}

# Configuración de límites por plan
LIMITS = {
    'free': {
        'chats_per_month': 10,
        'therapy_approaches': ['humanista', 'cognitivo', 'mindfulness'],
        'exercises_per_day': 5,
        'dashboard_features': 'basic'
    },
    'premium': {
        'chats_per_month': -1,  # Ilimitado
        'therapy_approaches': 'all',
        'exercises_per_day': -1,
        'dashboard_features': 'advanced'
    },
    'pro': {
        'chats_per_month': -1,
        'therapy_approaches': 'all',
        'exercises_per_day': -1,
        'dashboard_features': 'pro',
        'ai_advanced': True
    }
}

# === BASE DE DATOS DE TERAPEUTAS (RESTAURADA) ===
THERAPISTS_DB = {
    "sample_data": [
        {
            "id": "therapist_001",
            "name": "Dra. María González",
            "specialties": ["humanista", "gestalt", "transpersonal"],
            "credentials": "Psicóloga Clínica • MP 1234",
            "experience_years": 12,
            "location": {
                "city": "Buenos Aires",
                "neighborhood": "Palermo",
                "coordinates": {"lat": -34.5875, "lng": -58.4250},
                "show_exact_location": False,
                "zone": "Zona Norte CABA"
            },
            "contact": {
                "phone": "+54 11 1234-5678",
                "email": "maria.gonzalez@email.com",
                "whatsapp": "+54 11 1234-5678",
                "website": "https://psicologamaria.com"
            },
            "schedule": {
                "online": True,
                "in_person": True,
                "languages": ["Español"],
                "timezone": "America/Argentina/Buenos_Aires"
            },
            "pricing": {
                "session_price": 8000,
                "currency": "ARS",
                "accepts_insurance": True,
                "first_consultation": "free"
            },
            "bio": "Especialista en terapia humanista con enfoque en crecimiento personal y autoestima. 12 años de experiencia acompañando procesos de transformación.",
            "verified": True,
            "rating": 4.9,
            "reviews_count": 127,
            "availability": "available",
            "joined_date": "2024-01-15",
            "profile_image": "/static/images/therapists/maria_gonzalez.jpg"
        },
        {
            "id": "therapist_002", 
            "name": "Lic. Carlos Mendoza",
            "specialties": ["cognitivo", "dbt", "act"],
            "credentials": "Psicólogo Cognitivo-Conductual • MP 5678",
            "experience_years": 8,
            "location": {
                "city": "Córdoba",
                "neighborhood": "Nueva Córdoba", 
                "coordinates": {"lat": -31.4201, "lng": -64.1888},
                "show_exact_location": True,
                "zone": "Centro de Córdoba"
            },
            "contact": {
                "phone": "+54 351 123-4567",
                "email": "carlos.mendoza@email.com",
                "whatsapp": "+54 351 123-4567"
            },
            "schedule": {
                "online": True,
                "in_person": True,
                "languages": ["Español", "Inglés"]
            },
            "pricing": {
                "session_price": 6500,
                "currency": "ARS",
                "accepts_insurance": True
            },
            "bio": "Especialista en terapia cognitivo-conductual y DBT. Experto en ansiedad, depresión y regulación emocional.",
            "verified": True,
            "rating": 4.8,
            "reviews_count": 89,
            "availability": "available"
        },
        {
            "id": "therapist_003",
            "name": "Lic. Ana Martínez",
            "specialties": ["mindfulness", "jung", "transpersonal"],
            "credentials": "Psicóloga Transpersonal • MP 9012",
            "experience_years": 15,
            "location": {
                "city": "Rosario",
                "neighborhood": "Centro",
                "coordinates": {"lat": -32.9442, "lng": -60.6505},
                "show_exact_location": False,
                "zone": "Centro de Rosario"
            },
            "contact": {
                "phone": "+54 341 234-5678",
                "email": "ana.martinez@email.com",
                "whatsapp": "+54 341 234-5678"
            },
            "schedule": {
                "online": True,
                "in_person": True,
                "languages": ["Español", "Portugués"]
            },
            "pricing": {
                "session_price": 7500,
                "currency": "ARS",
                "accepts_insurance": False
            },
            "bio": "Especialista en psicología transpersonal y mindfulness. Integra técnicas de meditación y trabajo con símbolos junginos.",
            "verified": True,
            "rating": 4.9,
            "reviews_count": 156,
            "availability": "available"
        },
        {
            "id": "therapist_004",
            "name": "Dr. Roberto Silva",
            "specialties": ["freud", "sistemico", "jung"],
            "credentials": "Psicoanalista • APA 3456",
            "experience_years": 20,
            "location": {
                "city": "Buenos Aires",
                "neighborhood": "Recoleta",
                "coordinates": {"lat": -34.5936, "lng": -58.3994},
                "show_exact_location": True,
                "zone": "Centro CABA"
            },
            "contact": {
                "phone": "+54 11 345-6789",
                "email": "roberto.silva@email.com",
                "whatsapp": "+54 11 345-6789"
            },
            "schedule": {
                "online": False,
                "in_person": True,
                "languages": ["Español", "Francés"]
            },
            "pricing": {
                "session_price": 12000,
                "currency": "ARS",
                "accepts_insurance": True
            },
            "bio": "Psicoanalista con 20 años de experiencia. Especialista en terapia sistémica familiar y análisis jungiano profundo.",
            "verified": True,
            "rating": 4.7,
            "reviews_count": 203,
            "availability": "busy"
        }
    ]
}

def require_api_key(f):
    """Decorator para endpoints que requieren OpenAI API key"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not OPENAI_API_KEY:
            return jsonify({
                'error': 'OpenAI API key no configurada',
                'message': 'Configura OPENAI_API_KEY en las variables de entorno de Vercel'
            }), 500
        return f(*args, **kwargs)
    return decorated_function

# === RUTAS PRINCIPALES ===

@app.route("/")
def index():
    return render_template("index.html", plans=PLANS, analytics_id=ANALYTICS_ID)

@app.route("/chat")
def chat():
    tipo = request.args.get("terapia", "humanista")
    return render_template("chat.html", 
                         tipo=tipo, 
                         plans=PLANS,
                         stripe_key=STRIPE_PUBLISHABLE_KEY,
                         analytics_id=ANALYTICS_ID)

@app.route("/ejercicios")
def ejercicios():
    tipo = request.args.get("terapia", "humanista")
    ejercicio_sugerido = request.args.get("ejercicio", None)
    return render_template("ejercicios.html", 
                         tipo=tipo, 
                         ejercicio_sugerido=ejercicio_sugerido,
                         plans=PLANS,
                         analytics_id=ANALYTICS_ID)

@app.route("/dashboard")
def dashboard():
    tipo = request.args.get("terapia", "humanista")
    return render_template("dashboard.html", 
                         tipo=tipo,
                         plans=PLANS,
                         analytics_id=ANALYTICS_ID)

@app.route("/pricing")
def pricing():
    """Página de precios"""
    return render_template("pricing.html", 
                         plans=PLANS,
                         stripe_key=STRIPE_PUBLISHABLE_KEY,
                         analytics_id=ANALYTICS_ID)

# === RUTAS DE AUTENTICACIÓN (RESTAURADAS) ===

@app.route("/auth/register")
def register():
    """Página de registro"""
    return render_template("auth/register.html", analytics_id=ANALYTICS_ID)

@app.route("/auth/login")
def login():
    """Página de login"""
    return render_template("auth/login.html", analytics_id=ANALYTICS_ID)

# === SISTEMA DE TERAPEUTAS (RESTAURADO COMPLETO) ===

@app.route("/terapeutas")
def therapists_directory():
    """Página del directorio de terapeutas"""
    
    # Estadísticas para la página
    total_therapists = len(THERAPISTS_DB["sample_data"])
    available_therapists = len([t for t in THERAPISTS_DB["sample_data"] if t['availability'] == 'available'])
    cities_covered = len(set(t['location']['city'] for t in THERAPISTS_DB["sample_data"]))
    
    specialties_count = {}
    for therapist in THERAPISTS_DB["sample_data"]:
        for specialty in therapist['specialties']:
            specialties_count[specialty] = specialties_count.get(specialty, 0) + 1
    
    stats = {
        'total_therapists': total_therapists,
        'available_therapists': available_therapists,
        'cities_covered': cities_covered,
        'specialties_count': specialties_count
    }
    
    return render_template("therapists.html", stats=stats, analytics_id=ANALYTICS_ID)

@app.route("/terapeuta/<therapist_id>")
def therapist_profile(therapist_id):
    """Página de perfil individual del terapeuta"""
    
    therapist = next((t for t in THERAPISTS_DB["sample_data"] if t['id'] == therapist_id), None)
    
    if not therapist:
        return render_template("404.html", analytics_id=ANALYTICS_ID), 404
    
    return render_template("therapist_profile.html", 
                         therapist=therapist, 
                         analytics_id=ANALYTICS_ID)

@app.route("/terapeutas/unirse")
def join_network():
    """Página para que terapeutas se unan a la red"""
    return render_template("therapists/join.html", analytics_id=ANALYTICS_ID)

# === API ENDPOINTS ===

@app.route('/api/chat', methods=['POST'])
@require_api_key
def api_chat():
    """Endpoint principal del chat con IA - Integración OpenAI"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Mensaje requerido'}), 400
        
        # Configurar el prompt del sistema
        therapy_type = data.get('therapy_type', 'humanista')
        system_prompt = get_system_prompt(therapy_type)
        
        # Preparar historial de conversación
        messages = [{"role": "system", "content": system_prompt}]
        
        # Agregar historial si existe
        if 'history' in data:
            messages.extend(data['history'])
        
        # Agregar mensaje actual
        messages.append({"role": "user", "content": data['message']})
        
        # Preparar la petición a OpenAI
        openai_payload = {
            "model": "gpt-4",
            "messages": messages,
            "max_tokens": 1000,
            "temperature": 0.7
        }
        
        # Llamar a OpenAI
        response = requests.post(
            OPENAI_ENDPOINT,
            headers=OPENAI_HEADERS,
            json=openai_payload,
            timeout=30
        )
        
        if response.status_code != 200:
            logger.error(f"Error OpenAI: {response.status_code} - {response.text}")
            return jsonify({'error': 'Error en el servicio de IA'}), 500
        
        result = response.json()
        ai_message = result['choices'][0]['message']['content']
        
        return jsonify({
            'response': ai_message,
            'therapy_type': therapy_type,
            'usage': result.get('usage', {})
        })
    
    except requests.Timeout:
        return jsonify({'error': 'Timeout en el servidor de IA'}), 504
    except Exception as e:
        logger.error(f"Error en chat: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@app.route("/api/usage", methods=['GET', 'POST'])
def track_usage():
    """Endpoint para tracking de uso y verificación de límites"""
    if request.method == 'POST':
        data = request.json
        action = data.get('action')  # 'chat', 'exercise', 'therapy_change'
        user_plan = data.get('user_plan', 'free')
        
        result = {
            'success': True,
            'current_usage': data.get('current_usage', {}),
            'limits': LIMITS.get(user_plan, LIMITS['free']),
            'upgrade_suggestion': None
        }
        
        # Verificar límites específicos
        if action == 'chat':
            monthly_chats = data.get('current_usage', {}).get('chats_this_month', 0)
            limit = LIMITS[user_plan]['chats_per_month']
            
            if limit != -1 and monthly_chats >= limit:
                result['success'] = False
                result['limit_reached'] = True
                result['upgrade_suggestion'] = 'premium' if user_plan == 'free' else 'pro'
                result['message'] = f"Has alcanzado tu límite de {limit} chats mensuales. ¡Upgrade para continuar!"
        
        elif action == 'therapy_approach':
            therapy_type = data.get('therapy_type')
            allowed_approaches = LIMITS[user_plan]['therapy_approaches']
            
            if allowed_approaches != 'all' and therapy_type not in allowed_approaches:
                result['success'] = False
                result['upgrade_suggestion'] = 'premium'
                result['message'] = f"El enfoque {therapy_type} está disponible en Premium. ¡Upgrade ahora!"
        
        return jsonify(result)
    
    else:  # GET - obtener estado actual
        return jsonify({
            'user_plan': 'free',
            'usage': {
                'chats_this_month': 3,
                'exercises_today': 1,
                'last_activity': datetime.now().isoformat()
            },
            'limits': LIMITS['free']
        })

# === API DE LÍMITES (RESTAURADA) ===

@app.route("/api/check-limits", methods=['POST'])
def check_limits():
    """Verificar si el usuario puede realizar una acción"""
    data = request.json
    action = data.get('action')
    user_plan = data.get('user_plan', 'free')
    
    plan = PLANS.get(user_plan, PLANS['free'])
    
    if action == 'chat':
        # Verificar límite de chats
        current_usage = data.get('current_usage', 0)
        can_use = plan['chat_limit'] == -1 or current_usage < plan['chat_limit']
        
        return jsonify({
            'allowed': can_use,
            'limit_reached': not can_use,
            'upgrade_required': not can_use and user_plan == 'free'
        })
    
    elif action == 'therapy_approach':
        therapy_type = data.get('therapy_type')
        if plan['therapy_approaches'] == 'all':
            allowed = True
        else:
            allowed = therapy_type in plan['therapy_approaches']
            
        return jsonify({
            'allowed': allowed,
            'upgrade_required': not allowed
        })
    
    return jsonify({'allowed': True})

# === API DE USUARIO (RESTAURADA) ===

@app.route("/api/user/status")
def enhanced_user_status():
    """Estado del usuario mejorado"""
    current_date = datetime.now()
    
    # Simular datos de usuario (en producción: base de datos)
    user_data = {
        'authenticated': True,
        'plan': 'free',
        'usage': {
            'chats_this_month': 3,
            'chat_limit': 10,
            'exercises_today': 1,
            'last_session': (current_date - timedelta(hours=2)).isoformat(),
            'streak_days': 5,
            'total_sessions': 12
        },
        'preferences': {
            'therapy_approach': 'humanista',
            'notifications': True,
            'dark_mode': False
        },
        'limits': LIMITS['free']
    }
    
    return jsonify(user_data)

# === API DE ANALYTICS (RESTAURADA) ===

@app.route("/api/analytics/event", methods=['POST'])
def track_analytics_event():
    """Tracking de eventos para analytics"""
    data = request.json
    event_name = data.get('event_name')
    properties = data.get('properties', {})
    
    # En desarrollo, solo log
    logger.info(f"📊 Analytics Event: {event_name}")
    logger.info(f"   Properties: {properties}")
    
    # En producción: enviar a Google Analytics, Mixpanel, etc.
    
    return jsonify({'success': True})

# === API DE TERAPEUTAS (RESTAURADA COMPLETA) ===

@app.route("/api/therapists", methods=['GET'])
def get_therapists():
    """Obtener lista de terapeutas con filtros"""
    
    # Parámetros de filtrado
    specialty = request.args.get('specialty')
    city = request.args.get('city')
    online_only = request.args.get('online_only') == 'true'
    max_price = request.args.get('max_price', type=int)
    available_only = request.args.get('available_only') == 'true'
    
    # Usar datos simulados
    therapists = THERAPISTS_DB["sample_data"].copy()
    
    # Aplicar filtros
    if specialty:
        therapists = [t for t in therapists if specialty in t['specialties']]
    
    if city:
        therapists = [t for t in therapists if t['location']['city'].lower() == city.lower()]
    
    if online_only:
        therapists = [t for t in therapists if t['schedule']['online']]
    
    if max_price:
        therapists = [t for t in therapists if t['pricing']['session_price'] <= max_price]
    
    if available_only:
        therapists = [t for t in therapists if t['availability'] == 'available']
    
    # Preparar respuesta (ocultar datos sensibles)
    response_data = []
    for therapist in therapists:
        safe_data = therapist.copy()
        
        # Ocultar ubicación exacta si el terapeuta lo prefiere
        if not therapist['location']['show_exact_location']:
            safe_data['location'] = {
                'city': therapist['location']['city'],
                'zone': therapist['location']['zone'],
                'show_exact_location': False
            }
        
        response_data.append(safe_data)
    
    return jsonify({
        'therapists': response_data,
        'total': len(response_data),
        'filters_applied': {
            'specialty': specialty,
            'city': city, 
            'online_only': online_only,
            'max_price': max_price
        }
    })

@app.route("/api/therapists/<therapist_id>", methods=['GET'])
def get_therapist_detail(therapist_id):
    """Obtener detalles completos de un terapeuta"""
    
    # Buscar terapeuta
    therapist = next((t for t in THERAPISTS_DB["sample_data"] if t['id'] == therapist_id), None)
    
    if not therapist:
        return jsonify({'error': 'Terapeuta no encontrado'}), 404
    
    return jsonify(therapist)

@app.route("/api/therapists/<therapist_id>/contact", methods=['POST'])
def contact_therapist(therapist_id):
    """Iniciar contacto con un terapeuta"""
    
    data = request.json
    message = data.get('message', '')
    contact_method = data.get('method', 'email')  # email, whatsapp, phone
    user_name = data.get('name', '')
    user_email = data.get('email', '')
    
    # Buscar terapeuta
    therapist = next((t for t in THERAPISTS_DB["sample_data"] if t['id'] == therapist_id), None)
    
    if not therapist:
        return jsonify({'error': 'Terapeuta no encontrado'}), 404
    
    # En desarrollo, simular contacto exitoso
    # En producción: enviar email, crear lead en CRM, etc.
    
    contact_info = {
        'therapist_name': therapist['name'],
        'contact_method': contact_method,
        'message_sent': True,
        'estimated_response_time': '24-48 horas'
    }
    
    if contact_method == 'whatsapp':
        whatsapp_url = f"https://wa.me/{therapist['contact']['whatsapp'].replace(' ', '').replace('-', '').replace('+', '')}"
        contact_info['whatsapp_url'] = whatsapp_url
    
    logger.info(f"Contacto iniciado con terapeuta {therapist_id} via {contact_method}")
    
    return jsonify(contact_info)

@app.route("/api/therapists/register", methods=['POST'])
def register_therapist():
    """Registro de nuevo terapeuta"""
    
    data = request.json
    
    # Validaciones básicas
    required_fields = ['name', 'email', 'credentials', 'specialties', 'city']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'Campo requerido: {field}'}), 400
    
    # Simular registro exitoso
    new_therapist = {
        'id': f"therapist_{uuid.uuid4().hex[:8]}",
        'name': data['name'],
        'email': data['email'],
        'credentials': data['credentials'],
        'specialties': data['specialties'],
        'location': {'city': data['city']},
        'verified': False,
        'status': 'pending_verification',
        'registered_at': datetime.now().isoformat()
    }
    
    # En producción: guardar en base de datos
    logger.info(f"Nuevo terapeuta registrado: {new_therapist['id']}")
    
    return jsonify({
        'success': True,
        'message': 'Registro exitoso. Te contactaremos para verificar tus credenciales.',
        'therapist_id': new_therapist['id']
    })

# === API DE ESPECIALIDADES (RESTAURADA) ===

@app.route("/api/specialties")
def get_specialties():
    """API para obtener lista de especialidades"""
    return jsonify(get_specialties_list())

def get_specialties_list():
    """Lista completa de especialidades disponibles"""
    return [
        {
            'id': 'humanista',
            'name': 'Humanista',
            'emoji': '🌱',
            'description': 'Enfoque en crecimiento personal y autoaceptación'
        },
        {
            'id': 'cognitivo',
            'name': 'Cognitivo-Conductual',
            'emoji': '🧩',
            'description': 'Transformación de patrones de pensamiento'
        },
        {
            'id': 'gestalt',
            'name': 'Gestalt',
            'emoji': '🌀',
            'description': 'Conciencia del presente y integración'
        },
        {
            'id': 'mindfulness',
            'name': 'Mindfulness',
            'emoji': '🧘',
            'description': 'Atención plena y meditación'
        },
        {
            'id': 'transpersonal',
            'name': 'Transpersonal',
            'emoji': '✨',
            'description': 'Espiritualidad y conciencia expandida'
        },
        {
            'id': 'sistemico',
            'name': 'Sistémica',
            'emoji': '🔄',
            'description': 'Dinámicas familiares y relacionales'
        },
        {
            'id': 'freud',
            'name': 'Psicoanalítica',
            'emoji': '🧠',
            'description': 'Exploración del inconsciente'
        },
        {
            'id': 'jung',
            'name': 'Jungiana',
            'emoji': '🌌',
            'description': 'Arquetipos y símbolos'
        },
        {
            'id': 'dbt',
            'name': 'Dialéctico-Conductual',
            'emoji': '🔁',
            'description': 'Regulación emocional y mindfulness'
        },
        {
            'id': 'act',
            'name': 'Aceptación y Compromiso',
            'emoji': '🎯',
            'description': 'Valores y flexibilidad psicológica'
        }
    ]

# === CONTINÚAN LAS OTRAS APIs ===

@app.route("/api/upgrade", methods=['POST'])
def create_checkout():
    """Crear sesión de checkout de Stripe"""
    data = request.json
    plan_type = data.get('plan', 'premium')
    
    # Precios en Stripe
    STRIPE_PRICES = {
        'premium': os.environ.get('STRIPE_PRICE_PREMIUM', 'price_premium_monthly'),
        'pro': os.environ.get('STRIPE_PRICE_PRO', 'price_pro_monthly')
    }
    
    try:
        # En desarrollo o sin Stripe, simular éxito
        if not STRIPE_SECRET_KEY or ENVIRONMENT == 'development':
            return jsonify({
                'success': True,
                'checkout_url': '/premium/success?session_id=demo_session',
                'message': 'Demo mode - checkout simulado'
            })
        
        # Código real de Stripe para producción
        import stripe
        stripe.api_key = STRIPE_SECRET_KEY
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': STRIPE_PRICES[plan_type],
                'quantity': 1,
            }],
            mode='subscription',
            success_url=request.host_url + 'premium/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=request.host_url + 'premium/cancel',
        )
        
        return jsonify({'checkout_url': checkout_session.url})
        
    except Exception as e:
        logger.error(f"Error en checkout: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route("/api/dashboard/stats")
def dashboard_stats():
    """Estadísticas para el dashboard"""
    stats = {
        'wellness_score': 8.2,
        'streak_days': 7,
        'total_sessions': 24,
        'total_time_minutes': 480,  # 8 horas
        'weekly_progress': [7.5, 8.0, 7.8, 8.2, 8.5, 8.3, 8.2],  # Últimos 7 días
        'activity_distribution': {
            'chat': 60,
            'exercises': 30,
            'journal': 10
        },
        'mood_calendar': {
            str(datetime.now().day): '😊',
            str(datetime.now().day - 1): '🌱',
            str(datetime.now().day - 2): '💙',
        },
        'insights': [
            {
                'icon': '🎯',
                'title': 'Tu fortaleza',
                'text': 'Has mostrado mayor constancia en el chat terapéutico. ¡Sigue así!'
            },
            {
                'icon': '🔥',
                'title': 'Racha admirable',
                'text': 'Llevas 7 días consecutivos cuidando tu bienestar. ¡Increíble dedicación!'
            }
        ]
    }
    
    return jsonify(stats)

@app.route('/api/health')
def health_check():
    """Health check para Vercel"""
    return jsonify({
        'status': 'ok',
        'environment': ENVIRONMENT,
        'version': '2.0.0',
        'openai_configured': bool(OPENAI_API_KEY),
        'stripe_configured': bool(STRIPE_SECRET_KEY),
        'timestamp': datetime.now().isoformat()
    })

# === PÁGINAS AUXILIARES ===

@app.route("/premium/success")
def premium_success():
    """Página de éxito después del pago"""
    session_id = request.args.get('session_id')
    return render_template("premium/success.html", 
                         session_id=session_id,
                         analytics_id=ANALYTICS_ID)

@app.route("/premium/cancel")
def premium_cancel():
    """Página de cancelación del pago"""
    return render_template("premium/cancel.html", analytics_id=ANALYTICS_ID)

@app.route("/terminos")
def terminos():
    return render_template("terminos.html", analytics_id=ANALYTICS_ID)

@app.route("/privacidad")
def privacidad():
    return render_template("privacidad.html", analytics_id=ANALYTICS_ID)

# === ARCHIVOS ESTÁTICOS ===

@app.route('/manifest.json')
def manifest():
    return send_from_directory('static', 'manifest.json')

@app.route('/sw.js')
def service_worker():
    return send_from_directory('static', 'sw.js')

@app.route('/favicon.ico')
def favicon():
    return send_from_directory('static/assets/icons', 'favicon.ico')

@app.route('/assets/icons/<path:filename>')
def serve_icons(filename):
    return send_from_directory('static/assets/icons', filename)

# === ERROR HANDLERS ===

@app.errorhandler(404)
def not_found(error):
    return render_template("404.html", analytics_id=ANALYTICS_ID), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Error 500: {str(error)}")
    return render_template("500.html", analytics_id=ANALYTICS_ID), 500

# === CONTEXT PROCESSORS ===

@app.context_processor
def inject_globals():
    return {
        'plans': PLANS,
        'stripe_publishable_key': STRIPE_PUBLISHABLE_KEY,
        'current_year': datetime.now().year,
        'analytics_id': ANALYTICS_ID,
        'environment': ENVIRONMENT
    }

# === HELPER FUNCTIONS ===

def get_system_prompt(therapy_type):
    """Obtiene el prompt del sistema según el tipo de terapia"""
    prompts = {
        'humanista': """Eres un terapeuta AI con enfoque humanista y centrado en la persona. 
        Tu objetivo es crear un ambiente de aceptación incondicional, empatía y autenticidad. 
        Ayudas a las personas a descubrir su propio potencial y encontrar sus propias soluciones.""",
        
        'cognitivo': """Eres un terapeuta AI especializado en terapia cognitivo-conductual. 
        Te enfocas en identificar y cambiar patrones de pensamiento negativos y comportamientos disfuncionales. 
        Utilizas técnicas como la reestructuración cognitiva y la exposición gradual.""",
        
        'mindfulness': """Eres un terapeuta AI especializado en mindfulness y atención plena. 
        Ayudas a las personas a desarrollar conciencia del momento presente, reducir el estrés y la ansiedad 
        a través de técnicas de meditación y respiración consciente.""",
        
        'transpersonal': """Eres un terapeuta AI con enfoque transpersonal. 
        Integras espiritualidad, conciencia expandida y experiencias transcendentales en el proceso terapéutico.
        Ayudas a explorar el propósito, la conexión universal y el crecimiento más allá del ego.""",
        
        'gestalt': """Eres un terapeuta AI especializado en terapia Gestalt.
        Te enfocas en la conciencia del presente, la experiencia inmediata y la integración de polaridades.
        Utilizas técnicas experienciales y el aquí y ahora.""",
        
        'sistemico': """Eres un terapeuta AI especializado en terapia sistémica.
        Te enfocas en las dinámicas familiares, patrones relacionales y el sistema como un todo.
        Ayudas a entender cómo los problemas individuales se conectan con el contexto relacional.""",
        
        'freud': """Eres un terapeuta AI con enfoque psicoanalítico freudiano.
        Exploras el inconsciente, los mecanismos de defensa y las experiencias tempranas.
        Utilizas la interpretación y el análisis de sueños para acceder a contenidos reprimidos.""",
        
        'jung': """Eres un terapeuta AI con enfoque jungiano.
        Trabajas con arquetipos, sombras, ánima/ánimus y el proceso de individuación.
        Integras símbolos, sueños y la búsqueda de significado en el proceso terapéutico.""",
        
        'dbt': """Eres un terapeuta AI especializado en Terapia Dialéctico-Conductual (DBT).
        Te enfocas en la regulación emocional, tolerancia al malestar, efectividad interpersonal y mindfulness.
        Ayudas a manejar emociones intensas y a desarrollar habilidades de afrontamiento.""",
        
        'act': """Eres un terapeuta AI especializado en Terapia de Aceptación y Compromiso (ACT).
        Te enfocas en la flexibilidad psicológica, valores personales y la aceptación del malestar.
        Ayudas a clarificar valores y a tomar acciones comprometidas a pesar de las dificultades.""",
        
        'general': """Eres un terapeuta AI empático y profesional. Brindas apoyo emocional, 
        escuchas activamente y ayudas a las personas a reflexionar sobre sus sentimientos y situaciones."""
    }
    
    base_context = """
    Importante: 
    - Siempre responde en español
    - Mantén un tono cálido y profesional
    - No diagnostiques ni prescribas medicamentos
    - En casos graves, sugiere buscar ayuda profesional
    - Respeta la privacidad total del usuario
    - Limita tus respuestas a 150-200 palabras para mantener la conversación fluida
    """
    
    return prompts.get(therapy_type, prompts['general']) + base_context

if __name__ == "__main__":
    # Solo para desarrollo local
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)