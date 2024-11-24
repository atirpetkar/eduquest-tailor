import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Question {
  id: number;
  text: string;
  options?: string[];
  type: "multiple-choice" | "open-ended";
}

export const AssessmentInterface = ({ documentText, preferences }: { documentText: string; preferences: any }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    console.log("Generating assessment with preferences:", preferences);
    // Simulate generating assessment questions based on preferences
    // In a real implementation, this would call the Goodfire API
    const sampleQuestions: Question[] = [
      {
        id: 1,
        text: "Sample multiple choice question about the document content?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        type: "multiple-choice"
      },
      {
        id: 2,
        text: "Sample open-ended question about the document content?",
        type: "open-ended"
      }
    ];
    
    setQuestions(sampleQuestions);
    toast.success("Assessment generated successfully!");
  }, [documentText, preferences]);

  const handleSubmit = () => {
    console.log("Submitted answers:", answers);
    toast.success("Assessment submitted successfully!");
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Assessment</h2>
      <div className="space-y-6">
        {questions.map((question) => (
          <Card key={question.id} className="p-4">
            <p className="font-medium mb-4">{question.text}</p>
            
            {question.type === "multiple-choice" && question.options && (
              <RadioGroup
                onValueChange={(value) => setAnswers(prev => ({ ...prev, [question.id]: value }))}
                value={answers[question.id]}
              >
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`q${question.id}-${index}`} />
                    <Label htmlFor={`q${question.id}-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {question.type === "open-ended" && (
              <textarea
                className="w-full p-2 border rounded-md"
                rows={4}
                value={answers[question.id] || ""}
                onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
              />
            )}
          </Card>
        ))}
        
        <Button 
          onClick={handleSubmit}
          className="w-full mt-4"
        >
          Submit Assessment
        </Button>
      </div>
    </Card>
  );
};