from openai import OpenAI
import logging
from typing import List
import numpy as np
import faiss

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.dimension = 1536  # OpenAI embedding dimension
        self.index = faiss.IndexFlatL2(self.dimension)
        self.stored_chunks = []
        self.client = OpenAI()  # This will automatically use OPENAI_API_KEY from environment

    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using OpenAI API."""
        try:
            logger.info(f"Generating embedding for text of length: {len(text)}")
            response = self.client.embeddings.create(
                input=text,
                model="text-embedding-ada-002"
            )
            logger.debug("Embedding generated successfully")
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            raise

    def add_chunks(self, chunks: List[str]):
        """Add chunks to the index."""
        logger.info(f"Adding {len(chunks)} chunks to index")
        self.stored_chunks.extend(chunks)
        for chunk in chunks:
            embedding = self.generate_embedding(chunk)
            self.index.add(np.array([embedding]))

    def search_similar_chunks(self, query_embedding: List[float], k: int = 5):
        """Search for similar chunks."""
        D, I = self.index.search(np.array([query_embedding]), k)
        return [self.stored_chunks[i] for i in I[0] if i < len(self.stored_chunks)]