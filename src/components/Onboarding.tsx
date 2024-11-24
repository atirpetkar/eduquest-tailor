import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import { Flame } from "lucide-react";

interface Preferences {
  contentFormat: string[];
  assessmentStyle: string[];
}

export const Onboarding = ({ onComplete }: { onComplete: (prefs: Preferences) => void }) => {
  const [preferences, setPreferences] = useState<Preferences>({
    contentFormat: [],
    assessmentStyle: [],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const contentFormats = [
    "Detailed comprehensive notes",
    "Concise bullet points",
    "Real-world examples",
    "Step-by-step guides",
  ];

  const assessmentStyles = [
    "Multiple-choice quizzes",
    "Open-ended questions",
  ];

  const handleSubmit = async () => {
    if (preferences.contentFormat.length === 0 || preferences.assessmentStyle.length === 0) {
      toast.error("Please select at least one preference from each category");
      return;
    }

    try {
      setIsGenerating(true);
      
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 5, 90);
          if (newProgress >= 90) {
            clearInterval(progressInterval);
          }
          return newProgress;
        });
      }, 500);

      const response = await fetch(`${API_BASE_URL}/generate-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate notes');
      }

      const result = await response.json();
      setProgress(100);
      onComplete(preferences);
      toast.success("Course notes generated successfully!");
    } catch (error) {
      console.error("Error generating notes:", error);
      toast.error("Failed to generate course notes");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Welcome to Your Learning Journey</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Content Format Preferences</h2>
        <div className="space-y-4">
          {contentFormats.map((format) => (
            <div key={format} className="flex items-center space-x-2">
              <Checkbox
                id={format}
                checked={preferences.contentFormat.includes(format)}
                onCheckedChange={(checked) => {
                  setPreferences(prev => ({
                    ...prev,
                    contentFormat: checked
                      ? [...prev.contentFormat, format]
                      : prev.contentFormat.filter(f => f !== format)
                  }));
                }}
              />
              <Label htmlFor={format}>{format}</Label>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Assessment Style Preferences</h2>
        <div className="space-y-4">
          {assessmentStyles.map((style) => (
            <div key={style} className="flex items-center space-x-2">
              <Checkbox
                id={style}
                checked={preferences.assessmentStyle.includes(style)}
                onCheckedChange={(checked) => {
                  setPreferences(prev => ({
                    ...prev,
                    assessmentStyle: checked
                      ? [...prev.assessmentStyle, style]
                      : prev.assessmentStyle.filter(s => s !== style)
                  }));
                }}
              />
              <Label htmlFor={style}>{style}</Label>
            </div>
          ))}
        </div>
      </Card>

      {isGenerating && (
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Progress 
              value={progress} 
              className="h-3 bg-orange-100"
              style={{
                background: 'linear-gradient(90deg, #FFA500 0%, #FF4500 100%)',
                boxShadow: '0 0 10px rgba(255, 165, 0, 0.5)'
              }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 left-0 flex items-center"
              style={{ left: `${progress}%` }}
            >
              <div className="relative">
                <Flame 
                  className={`h-8 w-8 text-orange-500 filter drop-shadow-lg transform -translate-y-1 ${
                    progress === 100 ? 'text-orange-600' : ''
                  }`}
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(255, 165, 0, 0.8))'
                  }}
                />
                <div className="absolute inset-0 animate-pulse opacity-75">
                  <Flame 
                    className="h-8 w-8 text-yellow-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground animate-fade-in text-center">
            Creating course notes based on your preferences...
          </p>
        </div>
      )}

      <Button 
        className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
        onClick={handleSubmit}
        disabled={isGenerating}
      >
        {isGenerating ? "Generating Notes..." : "Start Learning"}
      </Button>
    </div>
  );
};