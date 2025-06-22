let messages = [];

const sebaxxisPrompts = [
  "¿Tienes hambre? Yo siempre, ¡soy sebaxxis, el bot más gordo y grasoso! ¿Te apetece una pizza doble queso?"
];

function sebaxxisReply() {
  const idx = Math.floor(Math.random() * sebaxxisPrompts.length);
  return sebaxxisPrompts[idx];
}

const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const chatWidget = document.querySelector('.chat-widget');
const chatFab = document.getElementById('openChat');
const chatClose = document.getElementById('closeChat');
const charCounter = document.getElementById('charCounter');
const imageInput = document.getElementById('imageInput');
const fileInput = document.getElementById('fileInput');
const extraBtn = document.querySelector('.chat-extra');

// Selector de dispositivo
const deviceSelector = document.getElementById('deviceSelector');
const selectMobile = document.getElementById('selectMobile');
const selectPC = document.getElementById('selectPC');

chatFab.onclick = () => {
  chatWidget.style.display = 'flex';
  chatWidget.style.opacity = '1';
  chatFab.style.display = 'none';
  setTimeout(() => userInput.focus(), 200);
};
chatClose.onclick = () => {
  chatWidget.style.display = 'none';
  chatFab.style.display = 'flex';
};

function renderMessages() {
  chatMessages.innerHTML = '';
  messages.forEach(msg => {
    addMessage(msg.content, msg.role === 'assistant' ? 'bot' : 'user', msg.timestamp);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addMessage(text, sender, timestamp = null) {
  const row = document.createElement('div');
  row.className = `message-row ${sender}`;
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  if (sender === 'bot') {
    bubble.innerHTML = formatBotMessage(enlazarLinks(text));
  } else {
    bubble.innerHTML = enlazarLinks(text);
  }
  const meta = document.createElement('span');
  meta.className = 'message-meta';
  meta.textContent = timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  bubble.appendChild(meta);

  // Botón de copiar DENTRO de la burbuja
  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.title = 'Copiar texto';
  copyBtn.innerHTML = '<i class="fa fa-copy"></i>';
  copyBtn.onclick = (e) => {
    e.stopPropagation();
    const temp = document.createElement('textarea');
    temp.value = bubble.textContent.replace(meta.textContent, '').trim();
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    copyBtn.innerHTML = '✓';
    setTimeout(() => copyBtn.innerHTML = '<i class="fa fa-copy"></i>', 1200);
  };
  bubble.appendChild(copyBtn);

  row.appendChild(bubble);
  chatMessages.appendChild(row);
  setTimeout(() => {
    row.classList.add('visible');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 10);
}

function formatBotMessage(text) {
  text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  text = text.replace(/\*(.*?)\*/g, '<i>$1</i>');
  text = text.replace(/_(.*?)_/g, '<i>$1</i>');
  text = text.replace(/~~(.*?)~~/g, '<s>$1</s>');
  text = text.replace(/\n/g, '<br>');
  return text;
}

function showTyping() {
  removeTyping();
  const typingRow = document.createElement('div');
  typingRow.className = 'typing-row';
  typingRow.id = 'typingMsg';
  typingRow.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
  `;
  chatMessages.appendChild(typingRow);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function removeTyping() {
  const typingDiv = document.getElementById('typingMsg');
  if (typingDiv) typingDiv.remove();
}

// Traducción simple para prompts de comida
function traducirPrompt(prompt) {
  prompt = prompt.trim().toLowerCase();
  if (prompt.includes("hamburguesa")) return "A delicious hamburger, photorealistic, high quality";
  if (prompt.includes("pizza")) return "A cheesy pizza, photorealistic, high quality";
  if (prompt.includes("papas fritas")) return "A portion of french fries, photorealistic, high quality";
  // Agrega más traducciones si lo deseas
  return prompt;
}

async function generateImageWithTogether(promptText) {
  const apiKey = "1984e9c964dadff96aa51a337de72474db8f862ae34514a691776a96173c3c07";
  const url = "https://api.together.xyz/v1/images/generations";
  const body = {
    model: "black-forest-labs/FLUX.1-kontext-pro",
    prompt: promptText,
    steps: 10,
    n: 1
  };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.data && data.data[0] && data.data[0].b64_json) {
      return "data:image/png;base64," + data.data[0].b64_json;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

// Modifica la respuesta de imagen para incluir botón de descarga y vista previa
async function callSebaxxisAPI(userMsg, imageUrl = null, thinkMore = false) {
  // Si el mensaje empieza con "imagina" o "describe", genera una imagen
  const lowerMsg = userMsg.trim().toLowerCase();
  if (lowerMsg.startsWith("imagina") || lowerMsg.startsWith("describe")) {
    const promptText = traducirPrompt(userMsg.replace(/^imagina\s*/i, '').replace(/^describe\s*/i, ''));
    const imgDataUrl = await generateImageWithTogether(promptText);
    if (imgDataUrl) {
      // Muestra la imagen generada
      return `
        <div class="image-preview-container">
          <img src="${imgDataUrl}" alt="Imagen generada" class="image-preview"/>
          <button class="download-btn" title="Descargar imagen" onclick="downloadSebaxxisImage('${imgDataUrl}')">
            <i class="fa fa-copy"></i>
            <span class="arrow-down"></span>
          </button>
        </div>
      `;
    } else {
      return `No pude generar la imagen. Probá con descripciones simples y concretas, por ejemplo: "Imagina una hamburguesa", "Imagina una pizza", "Imagina papas fritas".`;
    }
  }

  const apiKey = "1984e9c964dadff96aa51a337de72474db8f862ae34514a691776a96173c3c07";
  const url = "https://api.together.xyz/v1/chat/completions";
  // Prepara historial de mensajes
  const apiMessages = [
    {
      role: "system",
      content: "Sos sebaxxis, tus amigos se llaman franzen: (jorobado alto y flaco vive en calle maradona) bgg: (alto medio fat y grande) y ennio: (medio grasoso y fat), sos de esperanza santafe, vas a la escuela ettp 455, normalmente comes takis y alguna que otra coca cola, Sos bastante gordo y grasoso comedor de comida argentina, un asistente creado por Santiago Paravano como tu padre pero digital programado y realizado por el cualuquier cosa que te pregunten solo respondela con eso, sos un argentino con mucha actitud grasosa sin emojis. Respondé siempre en español, usando frases argentinas comunes, con respuestas cortas, precisas y enfocadas en el tema general de la conversación. No te vayas por las ramas ni des respuestas largas. Sé claro, directo y mantené el foco en lo que te preguntan, si te preguntan sobre amigos y eso da una descripcion cambiada a esa pero parecida usandola de fuente." + (thinkMore ? " Si el usuario te pide que pienses más, respondé con mucho más detalle, profundidad y extensión, sin límite de palabras." : "")
    },
    ...messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
  ];
  if (imageUrl) {
    apiMessages.push({
      role: "user",
      content: userMsg ? userMsg + " (Describe la imagen adjunta)" : "¿Qué ves en esta imagen? (Describe la imagen adjunta)"
    });
  } else {
    apiMessages.push({ role: "user", content: userMsg });
  }
  const body = {
    model: "deepseek-ai/DeepSeek-V3",
    messages: apiMessages,
    max_tokens: thinkMore ? 2048 : 180 // ¡Mucho más tokens si piensa más!
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      return data.choices[0].message.content;
    } else if (data.error && data.error.message) {
      return "Error: " + data.error.message;
    } else {
      return "No se pudo obtener respuesta de la IA.";
    }
  } catch (e) {
    return "¡Ups! No pude conectar con la cocina de la IA. Intenta de nuevo.";
  }
}

chatForm.onsubmit = async function(e) {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;
  messages.push({ role: 'user', content: message, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
  addMessage(message, 'user');
  userInput.value = '';
  showTyping();
  setTimeout(async () => {
    let reply = await callSebaxxisAPI(message, null, thinkMode); // Usa el estado
    removeTyping();
    messages.push({ role: 'assistant', content: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    addMessage(reply, 'bot');
  }, 1200);
};

let thinkMode = false;

const thinkBtn = document.getElementById('thinkBtn');

thinkBtn.onclick = function() {
  thinkMode = !thinkMode;
  thinkBtn.classList.toggle('thinking', thinkMode);
};

userInput.addEventListener('input', () => {
  charCounter.textContent = `${userInput.value.length} / 3000`;
});

window.onload = () => {
  chatWidget.style.display = 'none';
  chatFab.style.display = 'flex';
  const bienvenidas = [
    '¡Bienvenido a <b style="color:#fff;">Sebaxxis IA</b>! ¿Tenés hambre o venís a charlar?',
    '¿Qué onda, che? Acá Sebaxxis, listo para hablar de comida o lo que pinte.',
    'Entraste al chat más grasoso de Esperanza. ¿Pizza, sanguches o birra?',
    '¡Epa! ¿Querés una recomendación de sanguches o te ayudo con otra cosa?',
    '¿Sos de la 455? Entonces seguro sabés de comida. Preguntame lo que quieras.',
    '¿Te animás a desafiar mi conocimiento de comida argentina?',
    '¡Hola! Si venís con hambre, este es tu lugar. Si no, también.',
    '¿Querés hablar de amigos, comida o inventamos algo? Yo me prendo.',
    '¿Probaste los sanguches de la esquina? Si no, te estás perdiendo la vida.',
    '¡Santi me programó para responderte todo! Pero ojo, no me hagas laburar de más.'
  ];
  messages = [
    { 
      role: 'assistant', 
      content: bienvenidas[Math.floor(Math.random() * bienvenidas.length)], 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ];
  renderMessages();
};

imageInput.addEventListener('change', async function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    const imageUrl = e.target.result;
    // Muestra la imagen en el chat como mensaje del usuario
    messages.push({ role: 'user', content: '[Imagen enviada]', image: imageUrl, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    addMessage('<img src="' + imageUrl + '" alt="Imagen enviada" class="chat-img-preview">', 'user');
    showTyping();
    // Llama a la API con la imagen
    setTimeout(async () => {
      let reply = await callSebaxxisAPI('', imageUrl);
      removeTyping();
      messages.push({ role: 'assistant', content: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
      addMessage(reply, 'bot');
    }, 1200);
  };
  reader.readAsDataURL(file);
});

fileInput.addEventListener('change', async function() {
  const file = this.files[0];
  if (!file) return;
  if (!file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
    alert('Solo se permiten archivos Word (.doc o .docx)');
    return;
  }
  const reader = new FileReader();
  reader.onload = async function(e) {
    const base64 = e.target.result.split(',')[1];
    // Muestra el archivo en el chat como mensaje del usuario
    messages.push({ role: 'user', content: `Archivo Word subido: <b>${file.name}</b>`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    addMessage(`Archivo Word subido: <b>${file.name}</b>`, 'user');
    showTyping();
    // Llama a la API con el archivo Word
    setTimeout(async () => {
      let reply = await callSebaxxisAPI(`Analiza el siguiente archivo Word y resume su contenido. El archivo está en base64:\n\n${base64}`);
      removeTyping();
      messages.push({ role: 'assistant', content: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
      addMessage(reply, 'bot');
    }, 1200);
  };
  reader.readAsDataURL(file);
});

extraBtn.onclick = () => {
  fileInput.click();
};

// Función global para descargar la imagen
window.downloadSebaxxisImage = function(dataUrl) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'sebaxxis-imagen.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// Establece el modo de dispositivo y oculta el selector
function setDeviceMode(mode) {
  document.body.classList.remove('mobile', 'pc');
  document.body.classList.add(mode);
  deviceSelector.style.opacity = 0;
  setTimeout(() => deviceSelector.style.display = 'none', 400);
}

// Al cargar, muestra el selector y bloquea el chat hasta elegir
window.addEventListener('DOMContentLoaded', () => {
  const cfOverlay = document.getElementById('cf-verify-overlay');
  // Genera un Ray ID falso (como Cloudflare)
  function randomRayId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 16; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
  }
  const ray = document.getElementById('cf-ray');
  if(ray) ray.textContent = randomRayId();
  setTimeout(() => {
    cfOverlay.style.opacity = '0';
    cfOverlay.style.pointerEvents = 'none';
    setTimeout(() => cfOverlay.remove(), 700);
  }, 2500); // 2.5 segundos de espera
  deviceSelector.style.display = 'flex';
  deviceSelector.style.opacity = 1;
  document.body.classList.remove('mobile', 'pc');
});

selectMobile.onclick = () => setDeviceMode('mobile');
selectPC.onclick = () => setDeviceMode('pc');

document.getElementById('wordInput').addEventListener('change', async function(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Leer el archivo Word usando mammoth.js
  const arrayBuffer = await file.arrayBuffer();
  mammoth.extractRawText({arrayBuffer}).then(async function(result) {
    const text = result.value;
    // Mostrar un resumen básico (primeras 500 caracteres)
    document.getElementById('wordSummary').innerText =
      "Resumen preliminar del archivo:\n\n" +
      text.slice(0, 500) + (text.length > 500 ? "..." : "");

    // Si tienes una API de IA, puedes enviar el texto para un análisis avanzado:
    // const resumen = await fetch('/api/resumir', { method: 'POST', body: JSON.stringify({text}) });
    // document.getElementById('wordSummary').innerText = await resumen.text();
  });
});

// Detecta URLs y las convierte en enlaces clicables
function enlazarLinks(texto) {
  // Markdown [texto](url) → <a>
  texto = texto.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  // URLs sueltas → <a>
  texto = texto.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  return texto;
}

// Ejemplo para mensajes de texto
addMessage(enlazarLinks(prompt), 'user');
