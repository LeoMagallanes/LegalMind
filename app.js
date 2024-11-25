document.getElementById('file-upload-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Obtener el archivo del input
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];

    if (!file) {
        alert('Por favor, selecciona un archivo para analizar.');
        return;
    }

    if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF en este momento.');
        return;
    }

    // Leer el archivo PDF con PDF.js
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    fileReader.onload = async function () {
        const typedArray = new Uint8Array(fileReader.result);

        // Cargar el PDF con PDF.js
        console.log("Antes de cargar el pdf.");
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let extractedText = '';
        console.log("Despues de cargar el pdf.");

        // Extraer texto de cada página
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();

            // Concatenar el texto extraído
            extractedText += textContent.items.map(item => item.str).join(' ') + '\n';
        }

        console.log(extractedText);

        // Simulación de análisis del texto
        const analysisResponse = await simulatePostRequest('/api/analyze-document', {
            text: extractedText
        });

        // Mostrar el análisis en la interfaz
        const resultText = document.getElementById('result-text');
        resultText.textContent = JSON.stringify(analysisResponse.analysis, null, 2);
    };

    fileReader.onerror = function () {
        alert('Error al leer el archivo PDF. Inténtalo nuevamente.');
    };

    // Simular la conversión del archivo a base64
    /*
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async function () {
        const fileBase64 = reader.result.split(',')[1]; // Obtener solo la parte del base64

        // Simulación de solicitud POST para subir archivo
        const response = await simulatePostRequest('/api/upload', {
            file: fileBase64
        });

        if (response.status === 'success') {
            // Simular análisis del archivo
            const analysisResponse = await simulatePostRequest('/api/analyze-document', {
                text: "Este es el texto legal simulado extraído del archivo."
            });

            // Mostrar el resultado en la interfaz
            const resultText = document.getElementById('result-text');
            resultText.textContent = JSON.stringify(analysisResponse.analysis, null, 2);
        } else {
            alert('Error al subir el archivo. Inténtalo nuevamente.');
        }
    };
    */
});

// Simulador de una petición POST para el análisis
async function simulatePostRequest(url, body) {
    console.log(`POST request a: ${url}`);
    console.log('Cuerpo de la solicitud:', body);

    // Simular la respuesta
    if (url === '/api/upload') {
        return {
            status: 'success',
            file_id: '12345'
        };
    }

    if (url === '/api/analyze-document') {
        return {
            status: 'success',
            analysis: {
                potential_issues: [
                    "Los términos permiten cambios unilaterales sin previo aviso.",
                    "La política de privacidad menciona compartir datos con terceros."
                ]
            }
        };
    }

    return { status: 'error' };
}
