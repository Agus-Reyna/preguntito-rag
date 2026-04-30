from contextlib import asynccontextmanager
from fastapi import FastAPI
from .core.database import init_db
from .core.settings import get_settings
from .api.routes import documents

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Iniciando el servidor RAG...")
    init_db()
    
    yield

    print("Apagando el servidor...")

app = FastAPI(title=settings.project_name, lifespan=lifespan)

app.include_router(documents.router, prefix=f"{settings.api_prefix}{settings.documents_prefix}", tags=["documents"])

@app.get("/")
async def read_root():
    return {"message": "Servidor RAG Técnico Activo con Lifespan"}