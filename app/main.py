import httpx
from contextlib import asynccontextmanager
from fastapi import FastAPI
from .core.database import init_db
from .core.settings import get_settings
from .api.routes import documents

settings = get_settings()

async def ensure_ollama_model(model_name: str):
    """
    Verifica si el modelo existe en Ollama y, si no, intenta descargarlo.
    """
    ollama_url = f"{settings.ollama_base_url}/api/pull"
    
    async with httpx.AsyncClient(timeout=None) as client:
        try:
            print(f"Verificando modelo '{model_name}' en Ollama...")
            response = await client.post(ollama_url, json={"name": model_name, "stream": False})

            if response.status_code == 200:
                print(f"Modelo '{model_name}' listo y cargado.")
            else:
                print(f"Ollama respondió con error: {response.status_code}")
        except Exception as e:
            print(f"No se pudo conectar con Ollama. ¿Está el contenedor corriendo? Error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Iniciando el servidor RAG...")
    init_db()

    await ensure_ollama_model(settings.ollama_embed_model)
    
    yield
    print("Apagando el servidor...")

app = FastAPI(title=settings.project_name, lifespan=lifespan)

app.include_router(documents.router, prefix=f"{settings.api_prefix}{settings.documents_prefix}", tags=["documents"])

@app.get("/", tags=["Health"])
async def read_root():
    return {
        "status": "online",
        "project": settings.project_name,
        "version": "0.1.0",
        "docs_url": "/docs"
    }