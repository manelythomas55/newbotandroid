const express = require('express');
const http = require('http');
const { configureExpress } = require('./expressConfig');
const { configureWebSocket } = require('./webSocketConfig');
const { configureTelegramBot } = require('./telegramBotConfig');

const app = express();
const appServer = http.createServer(app);

configureExpress(app);
configureWebSocket(appServer);
configureTelegramBot();

const PORT = process.env.PORT || 8999;
appServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
