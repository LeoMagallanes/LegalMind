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
            resultText.textContent = data.summary;
            console.log(data.summary);
        }else{
            alert('No se generó un análisis.');
        }
    } catch (error){
        console.error('Error al enviar el archivo:', error);
        alert('Hubo un error al cargar el archivo.');
    }
});