from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class DocumentBase(BaseModel):
    filename: str
    session_id: str


class DocumentCreate(DocumentBase):
    file_path: str


class DocumentResponse(DocumentBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
