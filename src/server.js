/*Para inicializar el entorno de Node.js e instalar dependencias necesarias.

npm init -y
npm install express dotenv

Para instalar una dependencia usamos npm install*/

//Aqui empieza el backend y la config del servidor
const express = require('express');
const path = require('path');
//Variables de entorno
require('dotenv').config({ path: path.join(__dirname, '../.env') }); 

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Ruta principal (puedes agregar más si es necesario)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
