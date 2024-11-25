import logging
import json
from typing import List, Dict, Union

logger = logging.getLogger(__name__)

class GoodfireService:
    def __init__(self, client, model_variant):
        logger.info("Initializing Goodfire service")
        self.client = client
        self.model_variant = model_variant
        self.content_format_preferences = [
            "Detailed comprehensive notes",
            "Concise bullet points",
            "Real-world examples",
            "Step-by-step guides"
        ]

    def set_preferences_features(self, preferences: dict):
        """Set model variant features based on user preferences."""
        try:
            logger.info("Setting model variant features based on preferences")
            
            # Handle content format preference
            if 'contentFormat' in preferences:
                content_format = preferences['contentFormat'][0]
                logger.debug(f"Setting features for content format: {content_format}")
                
                # Get relevant features for the content format
                features, _ = self.client.features.search(
                    content_format,
                    model=self.model_variant,
                    top_k=3
                )
                
                # Set the weight for the most relevant feature
                selected_feature = features[0]
                logger.debug(f"Setting weight for feature: {selected_feature}")
                self.model_variant.set(selected_feature, 0.65)

            # Handle assessment style preference
            if 'assessmentStyle' in preferences:
                assessment_style = preferences['assessmentStyle'][0]
                logger.debug(f"Setting features for assessment style: {assessment_style}")
                
                features, _ = self.client.features.search(
                    assessment_style,
                    model=self.model_variant,
                    top_k=3
                )
                
                selected_feature = features[0]
                logger.debug(f"Setting weight for feature: {selected_feature}")
                self.model_variant.set(selected_feature, 0.6)

            logger.info("Model variant features updated successfully")
            logger.debug(f"Updated variant: {self.model_variant}")

        except Exception as e:
            logger.error(f"Error setting model variant features: {str(e)}")
            raise

    def generate_course_notes(self, content: str, preferences: dict) -> str:
        """Generate course notes using Goodfire API."""
        try:
            logger.info("Generating course notes with Goodfire API")
            
            # Set features based on preferences before generating notes
            self.set_preferences_features(preferences)
            
            # Simple prompt as features are already set in the model
            prompt = f"Generate detailed course notes for the following content:\n\nContent: {content}"
            
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
        """Generate assessment based on content and preferences."""
        try:
            logger.info("Generating assessment with Goodfire API")
            
            # Set features based on preferences
            self.set_preferences_features(preferences)
            
            assessment_type = preferences.get('assessmentStyle', ['multiple-choice'])[0]
            
            if assessment_type == 'multiple-choice':
                prompt = """Generate an assessment with 5 multiple choice questions.
                Format as JSON array with structure:
                [{"question": "text", "options": ["A", "B", "C", "D"], "correctAnswer": "correct option"}]"""
                
            else:  # open-ended questions
                prompt = """Generate 5 open-ended questions with model answers.
                Format as JSON array with structure:
                [{"question": "text", "modelAnswer": "detailed answer"}]"""
            
            prompt += f"\n\nContent: {content}"
            
            response = ""
            for token in self.client.chat.completions.create(
                [{"role": "user", "content": prompt}],
                model=self.model_variant,
                stream=True
            ):
                response += token.choices[0].delta.content or ""

            # Validate and clean JSON response
            try:
                parsed_response = json.loads(response)
                
                # For open-ended questions, add scoring function
                if assessment_type != 'multiple-choice':
                    for question in parsed_response:
                        # Add function to score open-ended answers
                        scoring_prompt = f"""
                        Compare this model answer: "{question['modelAnswer']}"
                        with this student answer: "{{student_answer}}"
                        Return a score between 0 and 100 based on accuracy and completeness.
                        """
                        question['scoreAnswer'] = scoring_prompt

                return json.dumps(parsed_response)
                
            except json.JSONDecodeError:
                logger.warning("Response wasn't valid JSON, attempting to fix format")
                # Extract the array part from the response
                start_idx = response.find('[')
                end_idx = response.rfind(']') + 1
                if start_idx != -1 and end_idx != -1:
                    json_str = response[start_idx:end_idx]
                    # Validate the extracted JSON
                    parsed_json = json.loads(json_str)
                    return json.dumps(parsed_json)
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

    def score_open_ended_answer(self, model_answer: str, student_answer: str) -> int:
        """Score an open-ended answer by comparing it to the model answer."""
        try:
            logger.info("Scoring open-ended answer")
            prompt = f"""
            Compare this model answer: "{model_answer}"
            with this student answer: "{student_answer}"
            Return only a number between 0 and 100 representing the score based on accuracy and completeness.
            """
            
            response = ""
            for token in self.client.chat.completions.create(
                [{"role": "user", "content": prompt}],
                model=self.model_variant,
                stream=True
            ):
                response += token.choices[0].delta.content or ""

            # Extract the numeric score from the response
            try:
                score = int(response.strip())
                return min(max(score, 0), 100)  # Ensure score is between 0 and 100
            except ValueError:
                logger.error("Could not parse score from response")
                return 50  # Default score if parsing fails

        except Exception as e:
            logger.error(f"Error scoring open-ended answer: {str(e)}")
            raise