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
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configure OpenAI (only for embeddings)
openai.api_key = os.getenv('OPENAI_API_KEY')
if not openai.api_key:
    logger.error("OpenAI API key not found in environment variables")

# Configure Goodfire API
GOODFIRE_API_KEY = os.getenv('GOODFIRE_API_KEY')
if not GOODFIRE_API_KEY:
    logger.error("Goodfire API key not found in environment variables")
    
GOODFIRE_API_URL = "https://api.goodfire.dev/v1"

# Initialize FAISS index
dimension = 1536  # OpenAI embedding dimension
index = faiss.IndexFlatL2(dimension)
stored_chunks = []

def generate_embedding(text: str) -> List[float]:
    """Generate embedding using OpenAI API."""
    try:
        logger.info(f"Generating embedding for text of length: {len(text)}")
        response = openai.Embedding.create(
            input=text,
            model="text-embedding-ada-002"
        )
        logger.debug("Embedding generated successfully")
        return response['data'][0]['embedding']
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        raise

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

def generate_course_notes(content: str, preferences: dict) -> str:
    """Generate course notes using Goodfire API."""
    try:
        logger.info("Generating course notes with Goodfire API")
        logger.debug(f"Preferences: {preferences}")
        
        headers = {
            "Authorization": f"Bearer {GOODFIRE_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "prompt": f"Generate course notes for the following content according to these preferences: {preferences}\n\nContent: {content}",
            "max_tokens": 1000
        }

        logger.debug("Making request to Goodfire API")
        response = requests.post(
            f"{GOODFIRE_API_URL}/chat/completions",
            headers=headers,
            json=payload
        )

        if response.status_code == 200:
            logger.info("Course notes generated successfully")
            return response.json()['choices'][0]['message']['content']
        else:
            error_msg = f"Goodfire API error: {response.text}"
            logger.error(error_msg)
            raise Exception(error_msg)
    except Exception as e:
        logger.error(f"Error generating course notes: {str(e)}")
        raise

@app.route('/api/documents', methods=['POST'])
def upload_document():
    """Handle document upload, chunking, and embedding."""
    try:
        logger.info("Received document upload request")
        
        if 'file' not in request.files:
            logger.error("No file provided in request")
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        preferences = request.form.get('preferences', '{}')
        logger.debug(f"Received preferences: {preferences}")

        if file.filename == '':
            logger.error("No file selected")
            return jsonify({'error': 'No file selected'}), 400

        logger.info(f"Processing file: {file.filename}")
        
        # Read and process the document
        content = file.read().decode('utf-8')
        logger.info(f"File content length: {len(content)} characters")

        # Generate course notes based on preferences
        logger.debug("Generating course notes")
        notes = generate_course_notes(content, json.loads(preferences))

        # Chunk the document
        logger.debug("Chunking document")
        chunks = chunk_text(content)
        stored_chunks.extend(chunks)

        # Generate embeddings and add to FAISS index
        logger.debug("Generating embeddings")
        for chunk in chunks:
            embedding = generate_embedding(chunk)
            index.add(np.array([embedding]))

        logger.info("Document processed successfully")
        return jsonify({
            'message': 'Document processed successfully',
            'chunks_processed': len(chunks),
            'notes': notes
        })

    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/qa', methods=['POST'])
def answer_question():
    """Handle Q&A queries using Goodfire API."""
    try:
        logger.info("Received Q&A request")
        
        data = request.json
        if not data or 'question' not in data:
            logger.error("No question provided in request")
            return jsonify({'error': 'No question provided'}), 400

        logger.debug(f"Processing question: {data['question']}")
        
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

        logger.debug("Making request to Goodfire API")
        response = requests.post(
            f"{GOODFIRE_API_URL}/chat/completions",
            headers=headers,
            json=payload
        )

        if response.status_code != 200:
            error_msg = f"Goodfire API error: {response.text}"
            logger.error(error_msg)
            raise Exception(error_msg)

        logger.info("Question answered successfully")
        return jsonify({
            'answer': response.json()['choices'][0]['message']['content'],
            'context': relevant_chunks
        })

    except Exception as e:
        logger.error(f"Error processing question: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Flask application on port 8084")
    app.run(debug=True, port=8084)