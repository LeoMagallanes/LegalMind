document.getElementById('file-upload-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('file'); // Obtener el archivo del input
    const file = fileInput.files[0];

    if (!file) {
        alert('Por favor, selecciona un archivo para analizar.');
        return;
    }

    const submitButton = document.querySelector('button[type="submit"]');
    const resultText = document.getElementById('result-text');

    // Deshabilitar el botón y mostrar spinner
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Analizando...';

    resultText.textContent = ''; // Limpiar resultados previos

    const formData = new FormData();
    formData.append('file', file);

    try {
        //Enviar el archivo al backend para ser procesado.
        const response = await fetch('/.netlify/functions/server/upload', {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.summary){
            //Mostrar el resumen generado por Google Gemini
            const resultText = document.getElementById('result-text');
            resultText.textContent = data.summary;
            scrollToBottom(resultText); // Desplazar al final del contenido
            console.log(data.summary);
        }else{
            alert('No se generó un análisis.');
        }
    } catch (error){
        console.error('Error al enviar el archivo:', error);
        alert('Hubo un error al cargar el archivo.');
    } finally {
        //Habilitar el botón nuevamente
        submitButton.disabled = false;
        submitButton.innerHTML = 'Analizar';
    }
});

// Función para desplazarse automáticamente al final del contenedor de resultados
function scrollToBottom(element) {
    element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
}