from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return '''
    <html>
    <head>
        <title>Tu Terapia AI</title>
        <style>
            body { 
                font-family: system-ui, sans-serif; 
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white; 
                text-align: center; 
                padding: 50px;
                margin: 0;
            }
            .container {
                background: rgba(255,255,255,0.1);
                padding: 40px;
                border-radius: 20px;
                max-width: 600px;
                margin: 0 auto;
                backdrop-filter: blur(10px);
            }
            h1 { font-size: 3rem; margin-bottom: 20px; }
            p { font-size: 1.2rem; margin: 20px 0; }
            .status {
                background: rgba(16, 185, 129, 0.2);
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                border: 1px solid rgba(16, 185, 129, 0.3);
            }
            a {
                color: #10b981;
                text-decoration: none;
                background: rgba(255,255,255,0.1);
                padding: 10px 20px;
                border-radius: 25px;
                display: inline-block;
                margin: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🧠 Tu Terapia AI</h1>
            <p>Tu espacio seguro para el bienestar mental</p>
            
            <div class="status">
                ✅ <strong>Deploy exitoso!</strong><br>
                Sistema operativo en Vercel
            </div>
            
            <a href="/chat">💬 Chat</a>
            <a href="/health">🔍 Health Check</a>
        </div>
    </body>
    </html>
    '''

@app.route('/chat')
def chat():
    return '''
    <html>
    <head><title>Chat - Tu Terapia AI</title></head>
    <body style="font-family: system-ui; padding: 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; min-height: 100vh;">
        <h1>💬 Chat Terapéutico</h1>
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
            <strong>Tu Terapia AI:</strong> ¡Hola! Sistema de chat funcionando correctamente. 
            Próximamente integraremos la IA avanzada para conversaciones terapéuticas completas.
        </div>
        <a href="/" style="color: #10b981;">← Volver</a>
    </body>
    </html>
    '''

@app.route('/health')
def health():
    return {
        'status': 'ok',
        'message': 'Tu Terapia AI funcionando!',
        'version': '1.0.0'
    }

# Esto es CRÍTICO para Vercel
def handler(environ, start_response):
    return app(environ, start_response)