from sqlalchemy.orm import Session
from llama_index.core import SimpleDirectoryReader
from llama_index.core.node_parser import SentenceSplitter
from ..models.document_chunk import DocumentChunk
from ..core.database import SessionLocal

def process_document_to_chunks(file_path: str, document_id: str):
    db = SessionLocal()
    try:
        # Leemos el PDF desde el disco
        reader = SimpleDirectoryReader(input_files=[file_path])
        documents = reader.load_data()

        # Particionamos
        splitter = SentenceSplitter(chunk_size=1024, chunk_overlap=100)
        nodes = splitter.get_nodes_from_documents(documents)

        # Guardamos cada trozo en la tabla document_chunks
        for node in nodes:
            new_chunk = DocumentChunk(
                document_id=document_id,
                content=node.text,
                embedding=None
            )
            db.add(new_chunk)
        
        # Guardamos los cambios en PostgreSQL
        db.commit()
        print(f"Procesamiento completado: {len(nodes)} fragmentos creados.")

    except Exception as e:
        db.rollback()
        print(f"Error procesando el documento {document_id}: {str(e)}")

    finally:
        db.close()
    