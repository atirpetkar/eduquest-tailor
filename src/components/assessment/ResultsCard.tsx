import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ResultsCardProps {
  score: number;
  assessmentType: 'multiple-choice' | 'open-ended';
}

export const ResultsCard = ({ score, assessmentType }: ResultsCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card className="p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">Assessment Results</h2>
        <p className="text-xl mb-6">Your Score: {score?.toFixed(0)}%</p>
        <div className="space-y-4">
          {assessmentType === 'open-ended' && (
            <p className="text-gray-600">
              Note: Open-ended questions are scored based on comparison with model answers.
            </p>
          )}
          <Button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mx-auto"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </div>
      </Card>
    </div>
  );
};