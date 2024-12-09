
// const express = require('express');
// const multer = require('multer');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const { removeBackgroundFromImageBase64 } = require('@imgly/background-removal');
// // const { Rembg , removeBackgroundFromImageBase64} = require('rembg');

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 5000;

// console.log(`Server running on port ${port}`);

// // Configure CORS
// app.use(cors({
//     origin: ['http://bgrm.dreamik.com', `http://localhost:${port}`,'http://localhost:5173','https://bg-frontend.onrender.com'], // Allow requests from specific origins
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
// }));

// // Configure multer for memory storage
// const upload = multer({ storage: multer.memoryStorage() });

// // Route for background removal
// app.post('/remove-bg', upload.single('image'), async (req, res) => {

//     try {
//         const inputBuffer = req.file.buffer;
//         const inputBase64 = inputBuffer.toString('base64');

//         const result = await removeBackgroundFromImageBase64(inputBase64, {
//             model: "u2net", // Model used for background removal
//             scale: 1,       // Scale factor
//         });

//         const outputBuffer = Buffer.from(result, 'base64');
//         res.set('Content-Type', 'image/png');
//         res.send(outputBuffer);
//     } catch (error) {
//         console.error('Error while processing the image:', error);
//         res.status(500).json({ error: 'Failed to process the image.' });
//     }

// });

// // Start the server
// app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));




const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv')
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const { removeBackgroundFromImageFile } = require('remove.bg');

dotenv.config();

const app = express();

const port = process.env.PORT || 5000;

console.log(port);

const __dir = path.resolve();

app.use(cors({ origin: 'http://bgrm.dreamik.com/' }));

console.log('working');

app.use(express.static(path.join(__dir, "/frontend/dist")));
app.get('*',(req,res)=>{
    console.log('done');
    console.log(__dir);
    res.sendFile(path.resolve(__dir ,'frontend','dist','index.html'));
});

app.use(cors({
    origin: `http://localhost:${port}`, // Allow requests from frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }));


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});



// Configure multer for file uploads
const upload = multer({ dest: '/' });

// Route for background removal
app.post('/remove-bg', upload.single('image'), async (req, res) => {
    const localFile = req.file.path;
    const outputFile = `uploads/processed-${Date.now()}.png`;

    try {
        const result = await removeBackgroundFromImageFile({
            path: localFile,
            apiKey: process.env.API_KEY,
            size: 'regular',
            type: 'auto',
            outputFile
        });
        console.log('removed');
        fs.unlinkSync(localFile); // Clean up the original file
        res.download(outputFile, () => fs.unlinkSync(outputFile)); // Send the processed file and delete it after download
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Background removal failed.' });
    }
});

app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));



