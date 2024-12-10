import express from 'express';
import awsServerlessExpress from 'aws-serverless-express';
import cors from 'cors';
import fs from 'fs'; 
import os from 'os';
import path from 'path';
import multer from 'multer'; 
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import dotenv from 'dotenv';

dotenv.config(); //Variables de entorno
const app = express();

app.use(cors({
    origin: '*', //Especificar el origen del frontend.

    //https://legal-mind.netlify.app
    methods: ['GET', 'POST'],
    allowedHeaders: '*',
}));

// Middleware para parsear JSON
app.use(express.json());

// Configurar Multer para carga de archivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Inicializar GoogleGenerativeAI y GoogleAIFileManager con la clave API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY);

//Ruta para cargar archivo
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        console.log('Request received'); 
        if(!req.file || !req.file.buffer || !req.file.mimetype){
            console.error('Invalid file:', req.file);
            return res.status(400).json({error:'Invalid file uploaded' });
        }
        console.log('File received:', req.file);

        //Guardar el archivo temporalmente al sistema de archivos locales.
        const tempPath = path.join(os.tmpdir(), req.file.originalname);
        fs.writeFileSync(tempPath, req.file.buffer);
        console.log("Temporary file created:", tempPath);

        //Subir el archivo a gemini.
        const uploadResponse = await fileManager.uploadFile(tempPath, {
            mimeType: req.file.mimetype,
            displayName: req.file.originalname,
        });
        console.log(`File uploaded to Gemini API as: ${uploadResponse.file.uri}`);

        //Borrar el archivo temporal.
        fs.unlinkSync(tempPath);
        console.log('Temporary file deleted:', tempPath);

        //Usar el modelo de Google Gemini para generar contenido basado en el archivo.
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash', //Aquí podemos cambiar el modelo.
            //Angel trol: tunedModels/prompts-legales-hwflztytvn7v
        });

        //generar contenido con el archivo y el prompt.
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri,
                },
            },
            { text: 'Respond in the same language as the analyzed document. Analyze this contract and identify abusive, unfair, ambiguous, or bad-faith clauses, do not add improvements! nor suggestions nor pleasantries for improvements! to the bad clauses. Explain why they are problematics. Write the response on the same language as the document is, important to write the response in the language of the document.'},
        ]);

        //Enviar el resultado generado al frontend
        res.json({summary: result.response.text() });
    }catch(error){
        console.log('Error processing the file:', error);
        res.status(500).json({error: 'Error processing the file'});
    }
});


const server = awsServerlessExpress.createServer(app);

export const handler = (event, context) => {
    event.path = event.path.replace('/.netlify/functions/server', '');
    awsServerlessExpress.proxy(server, event, context);
};