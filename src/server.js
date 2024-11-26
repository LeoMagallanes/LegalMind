/*Para inicializar el entorno de Node.js e instalar dependencias necesarias.

npm init -y
npm install express dotenv

Para instalar una dependencia usamos npm install*/

//Aqui empieza el backend y la config del servidor
import express from 'express';
import path from 'path';
import fs from 'fs'; 
import multer from 'multer'; 
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import dotenv from 'dotenv';

//Variables de entorno
//require('dotenv').config({ path: path.join(__dirname, '../.env') }); 
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Obtén el equivalente de __dirname en ESM
const __dirname = path.dirname(new URL(import.meta.url).pathname);
console.log(__dirname);
//Sirve los archivos estáticos (HTML, CSS, JS) desde 'public'
app.use(express.static(path.join(__dirname, '..','public')));

// Ruta principal (cuando accedes a "/")
app.get('/', (req, res) => {
    const indexPath = path.resolve(__dirname, '../public', 'index.html');
    res.sendFile(indexPath);
    //res.sendFile(path.join(__dirname, '../public', 'index.html')); // Sirve el archivo HTML
});

// Middleware para parsear JSON
app.use(express.json());

// Configurar Multer para carga de archivos
const upload = multer({ dest: 'uploads/' });

// Inicializar GoogleGenerativeAI y GoogleAIFileManager con la clave API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY);

//Ruta para cargar archivo
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if(!req.file){
            return res.status(400).json({error:'No file uploaded' });
        }

        //cargar el archivo para enviarlo a la API de Google Gemini
        //que es __dirname.
        //Checar que el filepath este correcto. ***********
        const filePath = path.join(__dirname, 'uploads', req.file.filename);

        //Subir archivo a Google Gemini
        const uploadResponse = await fileManager.uploadFile(filePath, {
            mimeType: req.file.mimetype,
            displayName: req.file.originalname,
        });

        console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

        //Usae el modelo de Google Gemini para generar contenido basado en el archivo.
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash', //Aquí podemos cambiar el modelo.
        });

        //generar contenido con el archivo y el prompt.
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri,
                },
            },
            { text: 'Analyze this contract and identify abusive, unfair, ambiguous, or bad-faith clauses. Explain why they are problematic and suggest improvements to make them clear and fair.'},
        ]);

        //Enviar el resultado generado al frontend
        res.json({summary: result.response.text() });
    }catch(error){
        console.log('Error processing the file:', error);
        res.status(500).json({error: 'Error processing the file'});
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
