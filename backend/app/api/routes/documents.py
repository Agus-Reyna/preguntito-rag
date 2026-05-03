import shutil
from pathlib import Path
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...core.settings import get_settings
from ...models.document import Document
from ...schemas.document import DocumentResponse
from ...services.rag_service import RAGService
router = APIRouter()

@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    session_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> DocumentResponse:
    settings = get_settings()

    # Validaciones
    filename = file.filename or "document.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo debe ser un PDF.",
        )

    uploads_dir = Path(settings.upload_dir)
    uploads_dir.mkdir(parents=True, exist_ok=True)

    safe_name = f"{session_id}_{uuid.uuid4().hex}.pdf"
    dest_path = uploads_dir / safe_name

    # Escritura en disco mediante Streaming
    try:
        with dest_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar el archivo: {str(e)}"
        )
    finally:
        file.file.close()

    # Registro en Base de Datos
    try:
        doc = Document(
            session_id=session_id,
            filename=filename,
            file_path=str(dest_path),
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        RAGService.process_document_to_chunks(str(dest_path), doc.id)

        return doc
    except Exception as e:
        if dest_path.exists():
            dest_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar el documento en la base de datos: {str(e)}"
        )