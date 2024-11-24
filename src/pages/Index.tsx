import { useState } from "react";
import { Onboarding } from "@/components/Onboarding";
import { DocumentUpload } from "@/components/DocumentUpload";
import { QAInterface } from "@/components/QAInterface";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

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

  const handlePreferencesComplete = async (prefs: any) => {
    setPreferences(prefs);
    // Simulate fetching available documents
    const sampleDocument = "This is a sample document content for demonstration purposes.";
    setDocumentText(sampleDocument);
    setStep("qa");
  };

  const handleDocumentUpload = (text: string) => {
    setDocumentText(text);
    setStep("qa");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8">
      <div className="container max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {isStudent ? "Student Portal" : "Admin Portal"}
          </h1>
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>

        {!isStudent && step === "upload" && (
          <DocumentUpload onUpload={handleDocumentUpload} />
        )}
        
        {isStudent && step === "onboarding" && (
          <Card className="p-6">
            <Onboarding onComplete={handlePreferencesComplete} />
          </Card>
        )}
        
        {step === "qa" && documentText && preferences && (
          <QAInterface documentText={documentText} preferences={preferences} />
        )}
      </div>
    </div>
  );
};

export default Index;