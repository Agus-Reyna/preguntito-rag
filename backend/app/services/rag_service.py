import ollama
from sqlalchemy.orm import Session
from sqlalchemy import select
from llama_index.core import SimpleDirectoryReader, Settings
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.ollama import OllamaEmbedding
from ..models.document import Document
from ..models.document_chunk import DocumentChunk
from ..core.database import SessionLocal
from ..core.settings import get_settings

settings = get_settings()

Settings.embed_model = OllamaEmbedding(
    base_url=settings.ollama_base_url,
    model_name=settings.ollama_embed_model,
)


class RAGService:
    @staticmethod
    def process_document_to_chunks(file_path: str, document_id: str):
        db = SessionLocal()
        try:
            # Leemos el PDF desde el disco
            reader = SimpleDirectoryReader(input_files=[file_path])
            documents = reader.load_data()

            # Particionamos
            splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)
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
    

    @staticmethod
    def search_similar_chunks(db: Session, query_text: str, session_id: str, top_k: int = 5, threshold: float = 0.7):
        # Generamos el embedding de la consulta
        query_embedding = Settings.embed_model.get_query_embedding(query_text)

        # Buscamos por similitud de coseno en la DB (menor distancia = mayor similitud)
        stmt = (
            select(DocumentChunk)
            .join(Document, Document.id == DocumentChunk.document_id)
            .where(Document.session_id == session_id)
            .where(DocumentChunk.embedding.cosine_distance(query_embedding) < threshold)
            .order_by(DocumentChunk.embedding.cosine_distance(query_embedding))
            .limit(top_k)
        )
        
        return db.scalars(stmt).all()
    

    @staticmethod
    def ask_question(db: Session, query_text: str, session_id: str):
        # Recuperamos el contexto
        context_chunks = RAGService.search_similar_chunks(db, query_text, session_id, top_k=3)
        
        if not context_chunks:
            return {
                "answer": "No encontré información sobre esto en tus documentos.",
                "sources": []
            }

        context_text = "\n\n".join([c.content for c in context_chunks])

        # Armamos el prompt para el modelo de lenguaje
        system_prompt = """
        Eres Robertito, un asistente académico experto y amigable.
        Utiliza ÚNICAMENTE el siguiente contexto para responder la pregunta del usuario.
        Si la respuesta no está en el contexto proporcionado, respondé exactamente: "No encontré información sobre esto en tus documentos."
        No inventes información. No uses conocimiento externo.
        Responde siempre en el mismo idioma que el usuario.
        """
        user_prompt = f"CONTEXTO:\n{context_text}\n\nPREGUNTA:\n{query_text}"

        # Llamamos a un modelo de chat en Ollama
        client = ollama.Client(host=settings.ollama_base_url)
        response = client.chat(
            model=settings.ollama_llm_model, 
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt},
            ],
            options={
                "num_ctx": 2048
            }
        )
        
        return {
            "answer": response['message']['content'],
            "sources": [{"id": c.id, "content": c.content} for c in context_chunks]
        }