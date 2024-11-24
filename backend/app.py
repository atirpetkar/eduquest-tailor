from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import faiss
import numpy as np
from typing import List
import openai
import json
import requests

app = Flask(__name__)
CORS(app)

# Configure OpenAI (only for embeddings)
openai.api_key = os.getenv('OPENAI_API_KEY')

# Configure Goodfire API
GOODFIRE_API_KEY = os.getenv('GOODFIRE_API_KEY')
GOODFIRE_API_URL = "https://api.goodfire.dev/v1"

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

def generate_course_notes(content: str, preferences: dict) -> str:
    """Generate course notes using Goodfire API."""
    headers = {
        "Authorization": f"Bearer {GOODFIRE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "prompt": f"Generate course notes for the following content according to these preferences: {preferences}\n\nContent: {content}",
        "max_tokens": 1000
    }
    
    response = requests.post(
        f"{GOODFIRE_API_URL}/chat/completions",
        headers=headers,
        json=payload
    )
    
    if response.status_code == 200:
        return response.json()['choices'][0]['message']['content']
    else:
        raise Exception(f"Goodfire API error: {response.text}")

@app.route('/api/documents', methods=['POST'])
def upload_document():
    """Handle document upload, chunking, and embedding."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    preferences = request.form.get('preferences', '{}')
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        # Read and process the document
        content = file.read().decode('utf-8')
        
        # Generate course notes based on preferences
        notes = generate_course_notes(content, json.loads(preferences))
        
        # Chunk the document
        chunks = chunk_text(content)
        stored_chunks.extend(chunks)
        
        # Generate embeddings and add to FAISS index
        for chunk in chunks:
            embedding = generate_embedding(chunk)
            index.add(np.array([embedding]))
        
        return jsonify({
            'message': 'Document processed successfully',
            'chunks_processed': len(chunks),
            'notes': notes
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/qa', methods=['POST'])
def answer_question():
    """Handle Q&A queries using Goodfire API."""
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
        
        # Generate response using Goodfire API
        headers = {
            "Authorization": f"Bearer {GOODFIRE_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "prompt": f"Context: {context}\n\nQuestion: {data['question']}",
            "max_tokens": 500
        }
        
        response = requests.post(
            f"{GOODFIRE_API_URL}/chat/completions",
            headers=headers,
            json=payload
        )
        
        if response.status_code != 200:
            raise Exception(f"Goodfire API error: {response.text}")
        
        return jsonify({
            'answer': response.json()['choices'][0]['message']['content'],
            'context': relevant_chunks
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)