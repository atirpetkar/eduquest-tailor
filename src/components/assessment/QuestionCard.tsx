import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Question {
  question: string;
  options?: string[];
  correctAnswer?: string;
  modelAnswer?: string;
  scoreAnswer?: string;
}

interface QuestionCardProps {
  question: Question;
  index: number;
  answer: string;
  onAnswerChange: (value: string) => void;
}

export const QuestionCard = ({ question, index, answer, onAnswerChange }: QuestionCardProps) => {
  // Format question text to include options for multiple choice
  const questionText = question.options 
    ? `${question.question}\n\nOptions: ${question.options.join(", ")}`
    : question.question;

  return (
    <Card className="p-4 bg-gray-50">
      <Label className="font-medium mb-4 text-gray-700 block whitespace-pre-wrap">
        {questionText}
      </Label>
      <Textarea
        placeholder="Type your answer here..."
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        className="mt-2"
      />
    </Card>
  );
};