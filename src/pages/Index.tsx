import { useState } from "react";
import { Onboarding } from "@/components/Onboarding";
import { DocumentUpload } from "@/components/DocumentUpload";
import { QAInterface } from "@/components/QAInterface";
import { AssessmentInterface } from "@/components/AssessmentInterface";

const Index = () => {
  const [step, setStep] = useState<"onboarding" | "upload" | "qa" | "assessment">("onboarding");
  const [preferences, setPreferences] = useState(null);
  const [documentText, setDocumentText] = useState<string | null>(null);

  const handlePreferencesComplete = (prefs: any) => {
    setPreferences(prefs);
    setStep("upload");
  };

  const handleDocumentUpload = (text: string) => {
    setDocumentText(text);
    setStep("qa");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8">
      <div className="container max-w-4xl mx-auto">
        {step === "onboarding" && (
          <Onboarding onComplete={handlePreferencesComplete} />
        )}
        {step === "upload" && (
          <DocumentUpload onUpload={handleDocumentUpload} />
        )}
        {step === "qa" && documentText && preferences && (
          <QAInterface documentText={documentText} preferences={preferences} />
        )}
        {step === "assessment" && documentText && preferences && (
          <AssessmentInterface documentText={documentText} preferences={preferences} />
        )}
      </div>
    </div>
  );
};

export default Index;