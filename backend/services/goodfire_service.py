import logging
from typing import List

logger = logging.getLogger(__name__)

class GoodfireService:
    def __init__(self, client, model_variant):
        logger.info("Initializing Goodfire service")
        self.client = client
        self.model_variant = model_variant

    def generate_course_notes(self, content: str, preferences: dict) -> str:
        """Generate course notes using Goodfire API."""
        try:
            logger.info("Generating course notes with Goodfire API")
            logger.debug(f"Preferences: {preferences}")

            prompt = f"Generate course notes for the following content according to these preferences: {preferences}\n\nContent: {content}"
            
            response = ""
            for token in self.client.chat.completions.create(
                [{"role": "user", "content": prompt}],
                model=self.model_variant,
                stream=True
            ):
                response += token.choices[0].delta.content or ""

            logger.info("Course notes generated successfully")
            return response

        except Exception as e:
            logger.error(f"Error generating course notes: {str(e)}")
            raise

    def answer_question(self, question: str, context: str) -> str:
        """Answer questions using Goodfire API."""
        try:
            logger.info("Generating answer with Goodfire API")
            prompt = f"Context: {context}\n\nQuestion: {question}"
            
            response = ""
            for token in self.client.chat.completions.create(
                [{"role": "user", "content": prompt}],
                model=self.model_variant,
                stream=True
            ):
                response += token.choices[0].delta.content or ""

            return response

        except Exception as e:
            logger.error(f"Error generating answer: {str(e)}")
            raise