def handler(request):
    """Handler ultra-simple para /api/health"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        'body': '{"status":"ok","message":"Tu Terapia AI funcionando","version":"1.0.0"}'
    }