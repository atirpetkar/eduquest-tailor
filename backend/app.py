from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from werkzeug.utils import secure_filename
import json
import goodfire
from config import OPENAI_API_KEY, GOODFIRE_API_KEY
from services.embedding_service import EmbeddingService
from services.goodfire_service import GoodfireService
from utils.text_utils import chunk_text

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Check OpenAI API key
logger.info("Checking OpenAI API key")
if not OPENAI_API_KEY:
    logger.error("OpenAI API key not found")
    raise ValueError("OpenAI API key is required")

# Configure Goodfire
logger.info("Configuring Goodfire with API key")
if not GOODFIRE_API_KEY:
    logger.error("Goodfire API key not found")
    raise ValueError("Goodfire API key is required")

try:
    # Initialize Goodfire client
    logger.info("Initializing Goodfire client")
    goodfire_client = goodfire.Client(api_key=GOODFIRE_API_KEY)
    goodfire_variant = goodfire.Variant("meta-llama/Meta-Llama-3-8B-Instruct")
    logger.info("Goodfire client initialized successfully")
except Exception as e:
    logger.error(f"Error initializing Goodfire client: {str(e)}")
    raise

# Initialize services
logger.info("Initializing services")
embedding_service = EmbeddingService()
goodfire_service = GoodfireService(goodfire_client, goodfire_variant)

# Store the latest document and notes in memory
latest_document = None
latest_notes = None

@app.route('/api/documents/latest', methods=['GET'])
def get_latest_document():
    """Get the latest uploaded document and notes."""
    global latest_document, latest_notes
    if latest_document:
        return jsonify({
            'content': latest_document,
            'notes': latest_notes
        })
    return jsonify({'error': 'No document found'}), 404

@app.route('/api/documents', methods=['POST'])
def upload_document():
    """Handle document upload, chunking, and embedding."""
    try:
        global latest_document
        logger.info("Received document upload request")
        
        if 'file' not in request.files:
            logger.error("No file provided in request")
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        
        if file.filename == '':
            logger.error("No file selected")
            return jsonify({'error': 'No file selected'}), 400

        logger.info(f"Processing file: {file.filename}")
        
        # Read and process the document
        content = file.read().decode('utf-8')
        latest_document = content
        logger.info(f"File content length: {len(content)} characters")

        # Chunk the document
        logger.debug("Chunking document")
        chunks = chunk_text(content)
        
        # Add chunks to embedding service
        logger.debug("Adding chunks to embedding service")
        embedding_service.add_chunks(chunks)

        logger.info("Document processed successfully")
        return jsonify({
            'message': 'Document processed successfully',
            'chunks_processed': len(chunks),
            'status': 'completed'
        })

    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-notes', methods=['POST'])
def generate_notes():
    """Generate course notes based on preferences."""
    try:
        global latest_document, latest_notes
        
        if not latest_document:
            return jsonify({'error': 'No document available'}), 400
            
        data = request.json
        if not data or 'preferences' not in data:
            return jsonify({'error': 'Preferences are required'}), 400

        logger.debug("Generating course notes with user preferences")
        latest_notes = goodfire_service.generate_course_notes(latest_document, data['preferences'])
        
        return jsonify({
            'notes': latest_notes,
            'status': 'completed'
        })

    except Exception as e:
        logger.error(f"Error generating notes: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-assessment', methods=['POST'])
def generate_assessment():
    """Generate assessment based on preferences."""
    try:
        global latest_document
        
        if not latest_document:
            return jsonify({'error': 'No document available'}), 400
            
        data = request.json
        if not data or 'preferences' not in data:
            return jsonify({'error': 'Preferences are required'}), 400

        logger.debug("Generating assessment with user preferences")
        assessment = goodfire_service.generate_assessment(latest_document, data['preferences'])
        
        return jsonify({
            'assessment': json.loads(assessment),
            'status': 'completed'
        })

    except Exception as e:
        logger.error(f"Error generating assessment: {str(e)}")
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
        question_embedding = embedding_service.generate_embedding(data['question'])

        # Get relevant chunks
        relevant_chunks = embedding_service.search_similar_chunks(question_embedding)
        context = "\n".join(relevant_chunks)

        # Generate answer using Goodfire
        answer = goodfire_service.answer_question(data['question'], context)

        logger.info("Question answered successfully")
        return jsonify({
            'answer': answer,
            'context': relevant_chunks
        })

    except Exception as e:
        logger.error(f"Error processing question: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/score-answer', methods=['POST'])
def score_answer():
    """Score an open-ended answer by comparing it to the model answer."""
    try:
        data = request.json
        if not data or 'modelAnswer' not in data or 'studentAnswer' not in data:
            return jsonify({'error': 'Missing required fields'}), 400

        score = goodfire_service.score_open_ended_answer(
            data['modelAnswer'],
            data['studentAnswer']
        )

        return jsonify({'score': score})

    except Exception as e:
        logger.error(f"Error scoring answer: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Flask application on port 8084")
    app.run(debug=True, port=8084)
