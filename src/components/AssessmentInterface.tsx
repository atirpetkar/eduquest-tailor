import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config";
import { ArrowLeft } from "lucide-react";

interface AssessmentProps {
  documentText?: string;
  preferences?: {
    assessmentStyle: string[];
  };
}

interface Question {
  id: number;
  text: string;
  options?: string[];
  type: "multiple-choice" | "open-ended";
}

export const AssessmentInterface = ({ documentText, preferences }: AssessmentProps) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateQuestions = async () => {
      try {
        const storedDocumentText = sessionStorage.getItem('documentText');
        const storedPreferences = sessionStorage.getItem('preferences');

        if (!storedDocumentText || !storedPreferences) {
          toast.error("No document or preferences found");
          navigate('/');
          return;
        }

        // Generate questions using Goodfire service
        const response = await fetch(`${API_BASE_URL}/qa`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: "Generate 3 multiple choice questions based on the document content",
            context: storedDocumentText
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate questions');
        }

        const result = await response.json();
        const generatedQuestions = JSON.parse(result.answer).map((q: any, index: number) => ({
          id: index + 1,
          text: q.question,
          options: q.options,
          type: "multiple-choice"
        }));

        setQuestions(generatedQuestions);
        setLoading(false);
        toast.success("Assessment generated successfully!");
      } catch (error) {
        console.error("Error generating assessment:", error);
        toast.error("Failed to generate assessment");
        setLoading(false);
      }
    };

    generateQuestions();
  }, [navigate]);

  const handleSubmit = () => {
    console.log("Submitted answers:", answers);
    toast.success("Assessment submitted successfully!");
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-700">
        Generating assessment questions...
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="mb-4 text-gray-700 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>

      <Card className="p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Assessment</h2>
        <div className="space-y-6">
          {questions.map((question) => (
            <Card key={question.id} className="p-4 bg-gray-50">
              <p className="font-medium mb-4 text-gray-700">{question.text}</p>
              
              {question.type === "multiple-choice" && question.options && (
                <RadioGroup
                  onValueChange={(value) => setAnswers(prev => ({ ...prev, [question.id]: value }))}
                  value={answers[question.id]}
                >
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`q${question.id}-${index}`} />
                      <Label 
                        htmlFor={`q${question.id}-${index}`}
                        className="text-gray-700"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </Card>
          ))}
          
          <Button 
            onClick={handleSubmit}
            className="w-full bg-primary text-white hover:bg-primary/90"
          >
            Submit Assessment
          </Button>
        </div>
      </Card>
    </div>
  );
};