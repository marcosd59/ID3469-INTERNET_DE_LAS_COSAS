# Sistema de Gestión de Inventarios con Notificaciones

## Descripción
Este proyecto implementa un sistema de gestión de inventarios para empresas, utilizando tecnología de Internet de las Cosas (IoT) con RabbitMQ. El sistema permite monitorear el stock de productos en tiempo real y enviar notificaciones automáticas cuando el inventario es bajo o excesivo.

## Componentes
El sistema se compone de varios módulos, incluyendo:
- API: Un servicio web construido con Flask para gestionar las solicitudes y enviar notificaciones.
- Notificaciones: Un módulo para enviar notificaciones por correo electrónico cuando se detectan cambios críticos en el inventario.
- Sensor: Un script para simular la entrada de datos de inventario desde un sensor IoT.
- Cliente Web: Una aplicación React para visualizar el estado del inventario y recibir notificaciones en tiempo real.

## Requisitos Previos
- Python 3.x
- Node.js
- RabbitMQ Server
- Base de datos SQL Server

## Instalación y Configuración

### API
1. Instale las dependencias de Python: `pip install flask flask_socketio flask_jwt_extended pika`
2. Configure las variables de entorno y ejecute `API.py`.

### Notificaciones
1. Configure el servidor SMTP y las credenciales en `NOTIFICACIONES.py`.
2. Ejecute el script para iniciar la escucha de mensajes de RabbitMQ.

### Sensor
1. Instale las dependencias: `pip install pika pyodbc`.
2. Configure la conexión a la base de datos y ejecute `SENSOR.py`.

### Cliente Web
1. Instale Node.js y las dependencias de React: `npm install`.
2. Ejecute la aplicación React con `npm start`.

## Uso
Una vez que todos los componentes están en funcionamiento:
1. El módulo Sensor simula la entrada de datos de inventario y los envía a RabbitMQ.
2. La API recibe estos datos, actualiza el inventario y verifica si es necesario enviar notificaciones.
3. Las notificaciones se envían por correo electrónico y a través de la aplicación web en tiempo real.
4. El cliente web permite visualizar el estado actual del inventario y recibir alertas.
