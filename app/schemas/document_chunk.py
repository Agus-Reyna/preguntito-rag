from uuid import UUID
from pydantic import BaseModel


class DocumentChunkResponse(BaseModel):
    id: UUID
    content: str

    class Config:
        from_attributes = True
