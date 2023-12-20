const SmeeClient = require('smee-client');
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const simpleGit = require('simple-git');

const app = express();
app.use(bodyParser.json());

// Define tus secretos aquí para cada webhook (los mismos que configuraste en GitHub)
const webhookSecrets = {
  APP_React: 'REACT',
  Sensor: 'SENSOR',
  Notificaciones: 'CORREO',
  API: 'API_M',
};

const gitRepos = {
  APP_React: 'C:/Users/gabri/Desktop/inventario/APP-React',
  Sensor: 'C:/Users/gabri/Desktop/inventario/Sensor',
  Notificaciones: 'C:/Users/gabri/Desktop/inventario/Notificaciones',
  API: 'C:/Users/gabri/Desktop/inventario/API',
};

const APP_React = new SmeeClient({
  source: 'https://smee.io/FC65JJo3QLS60r9M',
  target: 'http://localhost:8000/events/APP_React',
  logger: console
});

const Sensor = new SmeeClient({
  source: 'https://smee.io/A7aTStKT5yqE0NBc',
  target: 'http://localhost:8000/events/Sensor',
  logger: console
});

const Notificaciones = new SmeeClient({
  source: 'https://smee.io/k5KXV88vpwusJu',
  target: 'http://localhost:8000/events/Notificaciones',
  logger: console
});

const API = new SmeeClient({
  source: 'https://smee.io/vdY7Ps6fiPSQ4HqV',
  target: 'http://localhost:8000/events/API',
  logger: console
})

// Define las rutas para cada webhook
app.post('/events/APP_React', createWebhookHandler('APP_React', webhookSecrets.APP_React, gitRepos.APP_React));
app.post('/events/Sensor', createWebhookHandler('Sensor', webhookSecrets.Sensor, gitRepos.Sensor));
app.post('/events/Notificaciones', createWebhookHandler('Notificaciones', webhookSecrets.Notificaciones, gitRepos.Notificaciones));
app.post('/events/API', createWebhookHandler('API', webhookSecrets.API, gitRepos.API));

function createWebhookHandler(webhookName, secret, repoPath) {
  return async (req, res) => {
    const payload = req.body;

    // Verificar la firma del webhook
    const signature = req.get('X-Hub-Signature-256');
    if (!verifyGitHubSignature(secret, JSON.stringify(payload), signature)) {
      console.error(`Firma no válida para ${webhookName}. Abortando.`);
      res.status(403).send(`Firma no válida para ${webhookName}`);
      return;
    }

    console.log(`Evento recibido de ${webhookName}:`);
    console.log(`Repositorio: ${repoPath}`);

    // Realizar git pull en el repositorio correspondiente
    try {
      await pullGitRepo(repoPath);
      console.log(`Git pull exitoso en ${repoPath}`);
    } catch (error) {
      console.error(`Error al hacer git pull en ${repoPath}: ${error}`);
    }

    // Mostrar información adicional del commit si está disponible
    if (payload.head_commit) {
      const commitInfo = payload.head_commit;

      console.log('\nInformación del commit:');
      console.log(`ID: ${commitInfo.id}`);
      console.log(`Mensaje: ${commitInfo.message}`);
      console.log(`Autor: ${commitInfo.author.name} <${commitInfo.author.email}>`);
      console.log(`Fecha: ${commitInfo.timestamp}`);
      console.log(`URL del commit: ${commitInfo.url}`);
      
      if (commitInfo.modified.length > 0) {
        console.log('Archivos modificados:');
        commitInfo.modified.forEach((file) => {
          console.log(`- ${file}`);
        });
      } else {
        console.log('No hay archivos modificados en este commit.');
      }
    } else {
      console.log('No hay información de commit disponible en este evento.');
    }

    res.sendStatus(200); // Responde al evento
  };
}

async function pullGitRepo(repoPath) {
  return new Promise((resolve, reject) => {
    simpleGit(repoPath)
      .pull((err, update) => {
        if (err) {
          return reject(err);
        }
        resolve(update);
      });
  });
}

const server = app.listen(8000, () => console.log('Los servidores se encuentran listos.'));
const eventsAPP_React= APP_React.start();
const eventsSensor = Sensor.start();
const eventsNotificaciones = Notificaciones.start();
const eventsAPI = API.start();

// Detener cuando quieras
process.on('SIGINT', () => {
  server.close();
  eventsAPP_React.close();
  eventsSensor.close();
  eventsNotificaciones.close();
  eventsAPI.close();
});

function verifyGitHubSignature(secret, payload, signature) {
  const computedSignature = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')}`;

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}
