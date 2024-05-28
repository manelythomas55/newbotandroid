const WebSocket = require('ws');
const uuid4 = require('uuid');
const { sendDeviceMessage, sendDeviceDisconnectedMessage } = require('./telegramBotConfig');

const appClients = new Map();

function configureWebSocket(server) {
    const appSocket = new WebSocket.Server({ server });

    appSocket.on('connection', (ws, req) => {
        const uuid = uuid4.v4();
        const { model, battery, version, brightness, audio_mode, provider } = req.headers;

        ws.uuid = uuid;
        appClients.set(uuid, { model, battery, version, brightness, audio_mode, provider });

        sendDeviceMessage(model, battery, version, brightness, audio_mode, provider);

        ws.on('close', () => {
            sendDeviceDisconnectedMessage(model, battery, version, brightness, audio_mode, provider);
            appClients.delete(ws.uuid);
        });
    });

    setInterval(() => {
        appSocket.clients.forEach((ws) => ws.send('ping'));
    }, 5000);
}

module.exports = { configureWebSocket, appClients };
