import { useState } from "react";
import { Onboarding } from "@/components/Onboarding";
import { DocumentUpload } from "@/components/DocumentUpload";
import { QAInterface } from "@/components/QAInterface";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface IndexProps {
  isStudent?: boolean;
}

const Index = ({ isStudent = false }: IndexProps) => {
  const [step, setStep] = useState<"onboarding" | "upload" | "qa" | "assessment">(
    isStudent ? "onboarding" : "upload"
  );
  const [preferences, setPreferences] = useState(null);
  const [documentText, setDocumentText] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePreferencesComplete = (prefs: any) => {
    setPreferences(prefs);
    if (!isStudent) {
      setStep("upload");
    } else {
      setStep("qa");
    }
  };

  const handleDocumentUpload = (text: string) => {
    setDocumentText(text);
    setStep("qa");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8">
      <div className="container max-w-4xl mx-auto">
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
            className="ml-auto"
          >
            Back to Home
          </Button>
        </div>

        {!isStudent && step === "upload" && (
          <DocumentUpload onUpload={handleDocumentUpload} />
        )}
        {isStudent && step === "onboarding" && (
          <Onboarding onComplete={handlePreferencesComplete} />
        )}
        {step === "qa" && documentText && preferences && (
          <QAInterface documentText={documentText} preferences={preferences} />
        )}
      </div>
    </div>
  );
};

export default Index;