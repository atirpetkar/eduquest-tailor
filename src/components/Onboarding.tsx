import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Preferences {
  contentFormat: string[];
  assessmentStyle: string[];
}

export const Onboarding = ({ onComplete }: { onComplete: (prefs: Preferences) => void }) => {
  const [preferences, setPreferences] = useState<Preferences>({
    contentFormat: [],
    assessmentStyle: [],
  });

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

  const handleSubmit = () => {
    if (preferences.contentFormat.length === 0 || preferences.assessmentStyle.length === 0) {
      toast.error("Please select at least one preference from each category");
      return;
    }
    onComplete(preferences);
    toast.success("Preferences saved successfully!");
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

      <Button 
        className="w-full"
        onClick={handleSubmit}
      >
        Start Learning
      </Button>
    </div>
  );
};