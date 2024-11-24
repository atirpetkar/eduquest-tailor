from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import faiss
import numpy as np
from typing import List
import openai
import json

app = Flask(__name__)
CORS(app)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# Initialize FAISS index
dimension = 1536  # OpenAI embedding dimension
index = faiss.IndexFlatL2(dimension)
stored_chunks = []

def generate_embedding(text: str) -> List[float]:
    """Generate embedding using OpenAI API."""
    response = openai.Embedding.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return response['data'][0]['embedding']

def chunk_text(text: str, chunk_size: int = 1000) -> List[str]:
    """Split text into chunks."""
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
    
    return chunks

@app.route('/api/documents', methods=['POST'])
def upload_document():
    """Handle document upload, chunking, and embedding."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        # Read and process the document
        content = file.read().decode('utf-8')
        
        # Update progress
        progress_updates = [
            {"progress": 20, "status": "Document received..."},
            {"progress": 40, "status": "Chunking content..."},
            {"progress": 60, "status": "Generating embeddings..."},
            {"progress": 80, "status": "Storing in vector database..."},
            {"progress": 100, "status": "Processing complete!"}
        ]
        
        # Chunk the document
        chunks = chunk_text(content)
        stored_chunks.extend(chunks)
        
        # Generate embeddings and add to FAISS index
        for chunk in chunks:
            embedding = generate_embedding(chunk)
            index.add(np.array([embedding]))
        
        return jsonify({
            'message': 'Document processed successfully',
            'chunks_processed': len(chunks)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/qa', methods=['POST'])
def answer_question():
    """Handle Q&A queries."""
    data = request.json
    if not data or 'question' not in data:
        return jsonify({'error': 'No question provided'}), 400
    
    try:
        # Generate embedding for the question
        question_embedding = generate_embedding(data['question'])
        
        # Search for relevant chunks
        k = 5  # Number of chunks to retrieve
        D, I = index.search(np.array([question_embedding]), k)
        
        # Get the relevant chunks
        relevant_chunks = [stored_chunks[i] for i in I[0] if i < len(stored_chunks)]
        context = "\n".join(relevant_chunks)
        
        # Generate response using Goodfire API (placeholder)
        # This should be replaced with actual Goodfire API integration
        response = "This is a simulated response based on the context."
        
        return jsonify({
            'answer': response,
            'context': relevant_chunks
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)