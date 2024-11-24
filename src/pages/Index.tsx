import { useState } from "react";
import { Onboarding } from "@/components/Onboarding";
import { DocumentUpload } from "@/components/DocumentUpload";
import { QAInterface } from "@/components/QAInterface";

interface IndexProps {
  isStudent?: boolean;
}

const Index = ({ isStudent = false }: IndexProps) => {
  const [step, setStep] = useState<"onboarding" | "upload" | "qa" | "assessment">(
    isStudent ? "onboarding" : "upload"
  );
  const [preferences, setPreferences] = useState(null);
  const [documentText, setDocumentText] = useState<string | null>(null);

  const handlePreferencesComplete = (prefs: any) => {
    setPreferences(prefs);
    if (!isStudent) {
      setStep("upload");
    } else {
      // In student mode, we would fetch available content here
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