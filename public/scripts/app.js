document.getElementById('file-upload-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Obtener el archivo del input
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];

    if (!file) {
        alert('Por favor, selecciona un archivo para analizar.');
        return;
    }

    /*if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF en este momento.');
        return;
    }*/

    const formData = new FormData();
    formData.append('file', file);

    try {
        //Enviar el archivo al backend para ser procesado.
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data.summary){
            //Mostrar el resumen generado por Google Gemini
            const resultText = document.getElementById('result-text');
            resultText.textContent = 'Análisis: \n${data.summary}';
        }else{
            alert('No se generó un análisis.');
        }
    } catch (error){
        console.error('Error al enviar el archivo:', error);
        alert('Hubo un error al cargar el archivo.');
    }

    /*
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
    };*/

    /*fileReader.onerror = function () {
        alert('Error al leer el archivo PDF. Inténtalo nuevamente.');
    };*/
});