from contextlib import asynccontextmanager
from fastapi import FastAPI
from .core.database import init_db
from .api.routes import documents

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Iniciando el servidor RAG...")
    init_db()
    
    yield

    print("Apagando el servidor...")

app = FastAPI(lifespan=lifespan)

app.include_router(documents.router, prefix="/documents", tags=["documents"])

@app.get("/")
async def read_root():
    return {"message": "Servidor RAG Técnico Activo con Lifespan"}