from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...services.rag_service import RAGService

router = APIRouter()

@router.post("/search")
async def search(query: str, session_id: str, db: Session = Depends(get_db)):
    try:
        chunks = RAGService.search_similar_chunks(db, query, session_id)
        return [
            {
                "content": chunk.content,
                "document_id": chunk.document_id,
            } 
            for chunk in chunks
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/ask")
async def ask(query: str, session_id: str, db: Session = Depends(get_db)):
    try:
        result = RAGService.ask_question(db, query, session_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la generación de respuesta: {str(e)}")