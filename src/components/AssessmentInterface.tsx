import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config";
import { ArrowLeft } from "lucide-react";
import { QuestionCard } from "./assessment/QuestionCard";
import { ResultsCard } from "./assessment/ResultsCard";

interface Question {
  question: string;
  options?: string[];
  correctAnswer?: string;
  modelAnswer?: string;
  scoreAnswer?: string;
}

export const AssessmentInterface = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [assessmentType, setAssessmentType] = useState<'multiple-choice' | 'open-ended'>('multiple-choice');

  useEffect(() => {
    const generateAssessment = async () => {
      try {
        const storedPreferences = sessionStorage.getItem('preferences');

        if (!storedPreferences) {
          setError("No preferences found");
          toast.error("No preferences found");
          navigate('/');
          return;
        }

        const preferences = JSON.parse(storedPreferences);
        setAssessmentType(preferences.assessmentStyle?.[0] === 'multiple-choice' ? 'multiple-choice' : 'open-ended');

        console.log("Generating assessment with preferences:", preferences);
        const response = await fetch(`${API_BASE_URL}/generate-assessment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            preferences: preferences
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate assessment');
        }

        const result = await response.json();
        if (result.error) {
          throw new Error(result.error);
        }

        console.log("Assessment generated:", result.assessment);
        setQuestions(result.assessment);
        setLoading(false);
        toast.success("Assessment generated successfully!");
      } catch (error) {
        console.error("Error generating assessment:", error);
        setError("Failed to generate assessment");
        toast.error("Failed to generate assessment");
        setLoading(false);
      }
    };

    generateAssessment();
  }, [navigate]);

  const handleSubmit = async () => {
    if (assessmentType === 'multiple-choice') {
      // Score multiple choice by comparing answers with correct answers
      const totalQuestions = questions.length;
      const correctAnswers = Object.entries(answers).reduce((count, [index, answer]) => {
        const questionIndex = parseInt(index) - 1;
        // Compare case-insensitive and trim whitespace
        return count + (answer.trim().toLowerCase() === questions[questionIndex].correctAnswer?.toLowerCase().trim() ? 1 : 0);
      }, 0);
      
      const calculatedScore = (correctAnswers / totalQuestions) * 100;
      setScore(calculatedScore);
    } else {
      // Score open-ended questions
      try {
        let totalScore = 0;
        for (let i = 0; i < questions.length; i++) {
          const response = await fetch(`${API_BASE_URL}/score-answer`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              modelAnswer: questions[i].modelAnswer,
              studentAnswer: answers[i + 1] || ''
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to score answer');
          }

          const result = await response.json();
          totalScore += result.score;
        }

        const averageScore = totalScore / questions.length;
        setScore(averageScore);
      } catch (error) {
        console.error("Error scoring answers:", error);
        toast.error("Error calculating score");
        return;
      }
    }

    setShowResults(true);
    toast.success("Assessment submitted successfully!");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-700">Generating assessment questions...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card className="p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => navigate('/')} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return <ResultsCard score={score || 0} assessmentType={assessmentType} />;
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
          {questions.map((question, index) => (
            <QuestionCard
              key={index}
              question={question}
              index={index}
              answer={answers[index + 1] || ''}
              onAnswerChange={(value) => setAnswers(prev => ({ ...prev, [index + 1]: value }))}
            />
          ))}
          
          <Button 
            onClick={handleSubmit}
            className="w-full bg-primary text-white hover:bg-primary/90"
            disabled={Object.keys(answers).length !== questions.length}
          >
            Submit Assessment
          </Button>
        </div>
      </Card>
    </div>
  );
};