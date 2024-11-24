import os
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# API Keys
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
GOODFIRE_API_KEY = os.getenv('GOODFIRE_API_KEY')

if not OPENAI_API_KEY:
    logger.error("OpenAI API key not found in environment variables")
if not GOODFIRE_API_KEY:
    logger.error("Goodfire API key not found in environment variables")