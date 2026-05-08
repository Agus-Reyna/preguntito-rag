# 🤖 PregunTito

**PregunTito** es un sistema RAG (Retrieval-Augmented Generation) local que te permite cargar documentos PDF y hacerle preguntas sobre su contenido. Las respuestas son generadas por **Robertito**, tu asistente de IA local que nunca sale de tu máquina.

> 💡 Todo corre localmente. Tus documentos y preguntas nunca salen de tu máquina.

---

## ✨ ¿Cómo funciona?

1. Subís uno o varios PDFs
2. PregunTito los procesa y los indexa
3. Le hacés preguntas a Robertito
4. Robertito busca en tus documentos y te responde basándose únicamente en lo que encontró

---

## 🧠 Arquitectura

| Componente | Tecnología |
|---|---|
| Frontend | React + Vite + TailwindCSS |
| Backend | FastAPI + Python |
| Base de datos | PostgreSQL + pgvector |
| LLM (respuestas) | Ollama + LLaMA 3.2 3B |
| Embeddings (indexado) | Ollama + nomic-embed-text |
| Contenedores | Docker + Docker Compose |

### ¿Qué corre en CPU?

Por defecto todo corre en CPU, con tiempos de respuesta de 2-3 minutos por pregunta dependiendo del hardware.

| Tarea | Dispositivo |
|---|---|
| Indexado de PDFs (embeddings) | CPU |
| Búsqueda por similitud | CPU |
| Generación de respuesta (LLaMA 3.2 3B) | CPU |

---

## 🛠️ Requisitos

- [Docker](https://www.docker.com/) y Docker Compose
- 8 GB de RAM mínimo (16 GB recomendado)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Agus-Reyna/preguntito-rag
cd preguntito-rag
```

### 2. Configurar el `.env`

Copiá el archivo de ejemplo:

```bash
cp .env.example .env
```

El `.env` por defecto ya viene listo para usar:

```env
# === BASE DE DATOS ===
DATABASE_URL=postgresql+psycopg2://rag:rag@db:5432/rag

# === OLLAMA ===
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_LLM_MODEL=llama3.2:3b
OLLAMA_EMBED_MODEL=nomic-embed-text

# === IMAGEN DE OLLAMA ===
OLLAMA_IMAGE=ollama/ollama
```

#### 💡 ¿Querés usar otro modelo?

Por defecto PregunTito usa `llama3.2:3b`. Si querés usar un modelo más grande o diferente, cambiá la variable en el `.env`:

```env
OLLAMA_LLM_MODEL=llama3.1:8b
```

Ollama va a descargar el modelo automáticamente la primera vez que levantes los servicios. Podés ver los modelos disponibles en [ollama.com/library](https://ollama.com/library).

> ⚠️ Modelos más grandes requieren más RAM y son más lentos en CPU. Se recomienda GPU para modelos de 7B o más.

### 3. Levantar los servicios

```bash
docker compose up --build
```

La primera vez va a descargar los modelos de Ollama automáticamente (~2GB). Puede tardar varios minutos dependiendo de tu conexión.

### 4. Abrir la interfaz

Una vez levantado, abrí el frontend en:

```
http://localhost:5173
```

O si preferís usar la API directamente:

```
http://localhost:8000/docs
```

---

## 📖 Uso

### Desde el frontend

1. Abrí `http://localhost:5173`
2. Escribí un nombre de sesión (por defecto `mi-sesion`)
3. Subí uno o varios PDFs desde el panel izquierdo
4. Esperá a que el frontend confirme que se subió correctamente
5. Hacele preguntas a Robertito en el chat

### Desde la API

**Subir un PDF:**
```
POST /api/documents?session_id=mi-sesion
```

El endpoint espera a que el documento termine de procesarse antes de responder. Si el archivo es grande, puede tardar unos segundos.

**Subir múltiples documentos (uno a la vez):**
```
POST /api/documents?session_id=mi-sesion  → sube documento1.pdf
POST /api/documents?session_id=mi-sesion  → sube documento2.pdf
```

Robertito buscará en todos los documentos de la misma sesión al responder.

**Hacer una pregunta:**
```
POST /api/queries/ask?session_id=mi-sesion&query=¿De qué trata el documento?
```

**Buscar fragmentos similares (opcional):**
```
POST /api/queries/search?session_id=mi-sesion&query=¿De qué trata el documento?
```

---

## ⚡ Aceleración por GPU (experimental)

Por defecto PregunTito corre todo en CPU. Si tenés una GPU compatible podés intentar habilitarla para acelerar las respuestas de LLaMA 3.2.

> ⚠️ **El soporte de GPU es experimental y no está garantizado.** Funciona en algunas configuraciones de NVIDIA. Las GPU AMD con ROCm pueden tener incompatibilidades dependiendo del modelo y versión de drivers.

### NVIDIA

En el `docker-compose.yml` descomentá la sección de deploy:

```yaml
ollama:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: all
            capabilities: [gpu]
```

### AMD (ROCm)

En el `.env` cambiá la imagen y agregá tu GFX version:

```env
OLLAMA_IMAGE=ollama/ollama:rocm
HSA_OVERRIDE_GFX_VERSION=10.3.0  # ajustá según tu GPU
```

Y en el `docker-compose.yml` agregá:

```yaml
ollama:
  privileged: true
  shm_size: '2gb'
  devices:
    - "/dev/kfd:/dev/kfd"
    - "/dev/dri:/dev/dri"
```

Si algo no funciona, volvé a la configuración por defecto eliminando esos cambios.

---

## 📁 Estructura del proyecto

```
preguntito/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── documents.py
│   │   │       └── queries.py
│   │   ├── core/
│   │   │   ├── database.py
│   │   │   └── settings.py
│   │   ├── models/
│   │   │   ├── document.py
│   │   │   └── document_chunk.py
│   │   ├── schemas/
│   │   │   └── document.py
│   │   ├── services/
│   │   │   └── rag_service.py
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatArea.jsx
│   │   │   ├── ChatBubbles.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── RobertitoAvatar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── store/
│   │   │   └── useStore.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ❓ Problemas frecuentes

**Los modelos tardan mucho en descargarse**
Es normal la primera vez. LLaMA 3.2 3B pesa ~2GB y nomic-embed-text ~270MB.

**El endpoint de subida tarda en responder**
El procesamiento del PDF ocurre de forma sincrónica. Si el archivo es grande, el endpoint puede tardar unos segundos en responder. Esperá a que el frontend confirme la subida antes de hacer preguntas.

**Robertito tarda mucho en responder**
Corriendo en CPU, cada respuesta puede tardar 2-3 minutos. Es normal dado que el modelo corre sin aceleración por hardware.

**Robertito responde que no sabe**
Significa que la respuesta no está en los documentos que subiste. Robertito solo responde basándose en tu contenido, no inventa información.

---

---

# 🤖 PregunTito (English)

**PregunTito** is a local RAG (Retrieval-Augmented Generation) system that lets you upload PDF documents and ask questions about their content. Answers are generated by **Robertito**, your local AI assistant that never leaves your machine.

> 💡 Everything runs locally. Your documents and questions never leave your machine.

---

## ✨ How it works

1. Upload one or more PDFs
2. PregunTito processes and indexes them
3. Ask Robertito questions
4. Robertito searches your documents and answers based only on what it found

---

## 🧠 Architecture

| Component | Technology |
|---|---|
| Frontend | React + Vite + TailwindCSS |
| Backend | FastAPI + Python |
| Database | PostgreSQL + pgvector |
| LLM (responses) | Ollama + LLaMA 3.2 3B |
| Embeddings (indexing) | Ollama + nomic-embed-text |
| Containers | Docker + Docker Compose |

### What runs on CPU?

By default everything runs on CPU, with response times of 2-3 minutes per question depending on your hardware.

| Task | Device |
|---|---|
| PDF indexing (embeddings) | CPU |
| Similarity search | CPU |
| Response generation (LLaMA 3.2 3B) | CPU |

---

## 🛠️ Requirements

- [Docker](https://www.docker.com/) and Docker Compose
- 8 GB RAM minimum (16 GB recommended)

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Agus-Reyna/preguntito-rag
cd preguntito-rag
```

### 2. Configure `.env`

Copy the example file:

```bash
cp .env.example .env
```

The default `.env` is ready to use out of the box:

```env
# === DATABASE ===
DATABASE_URL=postgresql+psycopg2://rag:rag@db:5432/rag

# === OLLAMA ===
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_LLM_MODEL=llama3.2:3b
OLLAMA_EMBED_MODEL=nomic-embed-text

# === OLLAMA IMAGE ===
OLLAMA_IMAGE=ollama/ollama
```

#### 💡 Do you want to use a different model?

By default PregunTito uses `llama3.2:3b`. If you want to use a larger or different model, change the variable in your `.env`:

```env
OLLAMA_LLM_MODEL=llama3.1:8b
```

Ollama will automatically download the model the first time you start the services. You can browse available models at [ollama.com/library](https://ollama.com/library).

> ⚠️ Larger models require more RAM and are slower on CPU. GPU is recommended for models with 7B parameters or more.

### 3. Start the services

```bash
docker compose up --build
```

The first run will download Ollama models automatically (~2GB). This may take several minutes depending on your connection.

### 4. Open the interface

Once running, open the frontend at:

```
http://localhost:5173
```

Or use the API directly at:

```
http://localhost:8000/docs
```

---

## 📖 Usage

### From the frontend

1. Open `http://localhost:5173`
2. Enter a session name (default: `mi-sesion`)
3. Upload one or more PDFs from the left panel
4. Wait for the frontend to confirm the upload was successful
5. Ask Robertito questions in the chat

### From the API

**Upload a PDF:**
```
POST /api/documents?session_id=my-session
```

The endpoint waits for the document to finish processing before responding. This may take a few seconds for larger files.

**Upload multiple documents (one at a time):**
```
POST /api/documents?session_id=my-session  → uploads document1.pdf
POST /api/documents?session_id=my-session  → uploads document2.pdf
```

Robertito will search across all documents in the same session when answering.

**Ask a question:**
```
POST /api/queries/ask?session_id=my-session&query=What is this document about?
```

**Search similar chunks (optional):**
```
POST /api/queries/search?session_id=my-session&query=What is this document about?
```

---

## ⚡ GPU Acceleration (experimental)

By default PregunTito runs entirely on CPU. If you have a compatible GPU you can try enabling it to speed up LLaMA 3.2 responses.

> ⚠️ **GPU support is experimental and not guaranteed.** It works on some NVIDIA configurations. AMD GPUs with ROCm may have compatibility issues depending on the model and driver version.

### NVIDIA

Uncomment the deploy section in `docker-compose.yml`:

```yaml
ollama:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: all
            capabilities: [gpu]
```

### AMD (ROCm)

In `.env` change the image and add your GFX version:

```env
OLLAMA_IMAGE=ollama/ollama:rocm
HSA_OVERRIDE_GFX_VERSION=10.3.0  # adjust for your GPU
```

And in `docker-compose.yml` add:

```yaml
ollama:
  privileged: true
  shm_size: '2gb'
  devices:
    - "/dev/kfd:/dev/kfd"
    - "/dev/dri:/dev/dri"
```

If something doesn't work, revert to the default configuration by removing those changes.

---

## 📁 Project structure

```
preguntito/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── documents.py
│   │   │       └── queries.py
│   │   ├── core/
│   │   │   ├── database.py
│   │   │   └── settings.py
│   │   ├── models/
│   │   │   ├── document.py
│   │   │   └── document_chunk.py
│   │   ├── schemas/
│   │   │   └── document.py
│   │   ├── services/
│   │   │   └── rag_service.py
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatArea.jsx
│   │   │   ├── ChatBubbles.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── RobertitoAvatar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── store/
│   │   │   └── useStore.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ❓ Troubleshooting

**Models take a long time to download**
This is normal on first run. LLaMA 3.2 3B is ~2GB and nomic-embed-text is ~270MB.

**The upload endpoint takes a while to respond**
PDF processing happens synchronously. If the file is large, the endpoint may take a few seconds to respond. Wait for the frontend to confirm the upload before asking questions.

**Robertito takes a long time to respond**
Running on CPU, each response can take 2-3 minutes. This is expected without hardware acceleration.

**Robertito says it doesn't know**
This means the answer isn't in your uploaded documents. Robertito only answers based on your content — it doesn't make things up.
