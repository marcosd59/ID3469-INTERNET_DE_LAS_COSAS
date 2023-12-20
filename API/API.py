from flask import Flask, jsonify, make_response, request
from flask_socketio import SocketIO
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
import pika
from flask_cors import CORS, cross_origin
import json


stock_actual = 100

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'mysecretkey'
    app.config['JWT_SECRET_KEY'] = 'jwtsecretkey'
    jwt = JWTManager(app)
    return app

app = create_app()
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")
CORS(app, resources={r"/productos_stock": {"origins": "http://localhost:3000"}})

# Configurar encabezados para deshabilitar el almacenamiento en caché
@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

# Configura la conexión a RabbitMQ para publicar mensajes
rabbit_connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
rabbit_channel = rabbit_connection.channel()
rabbit_channel.queue_declare(queue='notificaciones', durable=True)

# Define una ruta para obtener un token JWT
@app.route('/get_token', methods=['POST'])
@cross_origin(origin="http://localhost:3000")
def get_token():
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    if username == 'Marcos' and password == '123456':
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"msg": "Bad username or password"}), 401

# Protege las rutas con @jwt_required
@app.route('/productos_stock', methods=['GET'])
@cross_origin(origin="http://localhost:3000")
@jwt_required()
def obtenerProductos():
    stock_actual = obtenerStockdeProductos()
    if stock_actual is not None:
        if stock_actual <= 20:
            mensaje = {'mensaje': f"Alerta: Stock de productos es bajo ({stock_actual})"}
            rabbit_channel.basic_publish(exchange='', routing_key='notificaciones', body=json.dumps(mensaje))
            socketio.emit('message', mensaje)
        response = jsonify({'producto_stock': stock_actual})
        return make_response(response)
    else:
        return 'No se pudo obtener el stock de productos', 500

# Protege la ruta con @jwt_required
@app.route('/actualizar_stock', methods=['POST'])
@cross_origin(origin="http://localhost:3000")
@jwt_required()
def actualizar_stock():
    nuevo_stock = obtenerStockdeProductos()
    notificacion = obtenerProductos()
    if notificacion:
        notificacion = notificacion.json  # Convierte el objeto Response a un diccionario
    return jsonify({'success': True, 'nuevo_stock': nuevo_stock, 'notificacion': notificacion})

def obtenerStockdeProductos():
    global stock_actual
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
        channel = connection.channel()
        channel.queue_declare(queue='producto', durable=True)

        method_frame, header_frame, body = channel.basic_get(queue='producto')
        while method_frame:
            mensaje = int(body.decode('utf-8'))
            stock_actual = mensaje
            method_frame, header_frame, body = channel.basic_get(queue='producto')
        return stock_actual
    except Exception as e:
        print(f"Error al obtener el stock: {str(e)}")
        return None

@socketio.on('message')
def handle_message(message):
    print(f'Mensaje de Socket.IO: {message}')

if __name__ == '__main__':
    socketio.run(app, host='192.168.22.24', port=5000, allow_unsafe_werkzeug=True)