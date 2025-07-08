import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

// Configuración inicial
const GRADIO_URL = "https://ed3bd0b951c47f5a1d.gradio.live/";
let gradioClient;

// Inicializar conexión con Gradio
async function initializeChatbot() {
    try {
        gradioClient = await Client.connect(GRADIO_URL);
        console.log("Conexión con el chatbot establecida");
        
        // Configurar evento de envío
        document.getElementById('sendButton').addEventListener('click', sendMessage);
        document.getElementById('userInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    } catch (error) {
        console.error("Error al conectar con el chatbot:", error);
        showErrorMessage("No se pudo conectar con el servicio de chatbot. Por favor, intenta más tarde.");
    }
}

// Enviar mensaje al chatbot
async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Mostrar mensaje del usuario
    appendMessage(message, 'user');
    userInput.value = '';
    
    try {
        // Mostrar indicador de carga
        const loadingId = showLoadingIndicator();
        
        // Llamar a la API de Gradio
        const response = await gradioClient.predict("/generate_response_json", {
            user_input: message
        });
        
        // Ocultar indicador de carga y mostrar respuesta
        removeLoadingIndicator(loadingId);
        appendMessage(response.data, 'bot');
    } catch (error) {
        console.error("Error al obtener respuesta:", error);
        appendMessage("Lo siento, ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.", 'bot');
    }
}

// Funciones auxiliares para la interfaz
function appendMessage(content, sender) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">${content}</div>
        <div class="message-time">${timeString}</div>
    `;
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showLoadingIndicator() {
    const id = 'loading-' + Date.now();
    const chatBox = document.getElementById('chatBox');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = id;
    loadingDiv.className = 'chat-message bot-message loading-message';
    loadingDiv.innerHTML = '<div class="message-content"><i class="fas fa-spinner fa-spin"></i> Procesando tu pregunta...</div>';
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}

function removeLoadingIndicator(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
}

function showErrorMessage(message) {
    const chatBox = document.getElementById('chatBox');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'chat-message system-message';
    errorDiv.innerHTML = `<div class="message-content text-danger"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
    chatBox.appendChild(errorDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeChatbot);