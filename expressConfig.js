const bodyParser = require('body-parser');
const multer = require('multer');
const { handleUploadImage, handleUploadAudio, handleUploadFile, handleUploadText, handleUploadLocation } = require('./uploadHandlers');

const upload = multer();

function configureExpress(app) {
    app.use(bodyParser.json());
    
    app.get('/', (req, res) => {
        res.send('<h1 align="center">𝙎𝙚𝙧𝙫𝙚𝙧 𝙪𝙥𝙡𝙤𝙖𝙙𝙚𝙙 𝙨𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮</h1>');
    });
    
    app.post('/uploadImage', upload.single('file'), handleUploadImage);
    app.post('/uploadAudio', upload.single('file'), handleUploadAudio);
    app.post('/uploadFile', upload.single('file'), handleUploadFile);
    app.post('/uploadText', handleUploadText);
    app.post('/uploadLocation', handleUploadLocation);
}

module.exports = { configureExpress };
