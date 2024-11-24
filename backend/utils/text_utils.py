import logging
from typing import List

logger = logging.getLogger(__name__)

def chunk_text(text: str, chunk_size: int = 1000) -> List[str]:
    """Split text into chunks."""
    logger.info(f"Chunking text of length {len(text)} with chunk size {chunk_size}")
    words = text.split()
    chunks = []
    current_chunk = []
    current_size = 0

    for word in words:
        current_chunk.append(word)
        current_size += len(word) + 1

        if current_size >= chunk_size:
            chunks.append(' '.join(current_chunk))
            current_chunk = []
            current_size = 0

    if current_chunk:
        chunks.append(' '.join(current_chunk))

    logger.info(f"Text split into {len(chunks)} chunks")
    return chunks