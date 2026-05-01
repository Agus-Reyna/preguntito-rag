from llama_index.core import SimpleDirectoryReader, Settings
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.ollama import OllamaEmbedding
from ..models.document_chunk import DocumentChunk
from ..core.database import SessionLocal
from ..core.settings import get_settings

settings = get_settings()
Settings.embed_model = OllamaEmbedding(
    model_name=settings.ollama_embed_model,
    base_url=settings.ollama_base_url,
)

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
            # Generamos el vector para este fragmento de texto
            vector = Settings.embed_model.get_text_embedding(node.get_content()) 
            
            new_chunk = DocumentChunk(
                document_id=document_id,
                content=node.text,
                embedding=vector
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
    