import logging
import json
from typing import List, Dict

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

            # Specific prompt for course notes only
            prompt = f"Generate detailed course notes for the following content according to these preferences: {preferences}. Focus only on creating clear, organized notes.\n\nContent: {content}"
            
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

    def generate_assessment(self, content: str, preferences: dict) -> str:
        """Generate assessment questions based on content and preferences."""
        try:
            logger.info("Generating assessment with Goodfire API")
            logger.debug(f"Assessment preferences: {preferences}")

            # Construct prompt based on preferences
            assessment_type = preferences.get('assessmentStyle', ['multiple-choice'])[0]
            prompt = f"""Generate an assessment based on the following content. 
            Assessment type: {assessment_type}
            Number of questions: 5
            
            For each question, provide:
            1. The question text
            2. Four possible answers (if multiple choice)
            3. The correct answer
            
            Format the response as a JSON array of objects with the following structure:
            [{{
                "question": "question text",
                "options": ["option1", "option2", "option3", "option4"],
                "correctAnswer": "correct option"
            }}]
            
            Content: {content}"""

            response = ""
            for token in self.client.chat.completions.create(
                [{"role": "user", "content": prompt}],
                model=self.model_variant,
                stream=True
            ):
                response += token.choices[0].delta.content or ""

            # Ensure the response is valid JSON
            try:
                # Try to parse the response as JSON to validate it
                json.loads(response)
                logger.info("Assessment generated successfully")
                return response
            except json.JSONDecodeError:
                # If the response isn't valid JSON, format it properly
                logger.warning("Response wasn't valid JSON, attempting to fix format")
                # Extract the array part from the response using string manipulation
                start_idx = response.find('[')
                end_idx = response.rfind(']') + 1
                if start_idx != -1 and end_idx != -1:
                    json_str = response[start_idx:end_idx]
                    # Validate the extracted JSON
                    json.loads(json_str)  # This will raise an error if still invalid
                    return json_str
                raise ValueError("Could not extract valid JSON from response")

        except Exception as e:
            logger.error(f"Error generating assessment: {str(e)}")
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