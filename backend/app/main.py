import httpx
from contextlib import asynccontextmanager
from fastapi import FastAPI
from .core.database import init_db
from .core.settings import get_settings
from .api.routes import documents, queries

settings = get_settings()

async def ensure_ollama_models():
    async with httpx.AsyncClient(timeout=None) as client:
        for model in [settings.ollama_embed_model, settings.ollama_llm_model]:
            print(f"Ollama: Verificando/Descargando {model}...")
            try:
                await client.post(
                    f"{settings.ollama_base_url}/api/pull", 
                    json={"name": model, "stream": False}
                )
            except Exception as e:
                print(f"Error descargando {model}: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Iniciando el servidor RAG...")
    init_db()
    await ensure_ollama_models() 
    yield
    print("Apagando el servidor...")

app = FastAPI(title=settings.project_name, lifespan=lifespan)

app.include_router(documents.router, prefix=f"{settings.api_prefix}{settings.documents_prefix}", tags=["Documents"])
app.include_router(queries.router, prefix=f"{settings.api_prefix}{settings.queries_prefix}", tags=["Queries"])

@app.get("/", tags=["Health"])
async def read_root():
    return {
        "status": "online",
        "project": settings.project_name,
        "version": "0.1.0",
        "docs_url": "/docs"
    }