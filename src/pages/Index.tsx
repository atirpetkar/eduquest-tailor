import { useState, useEffect } from "react";
import { Onboarding } from "@/components/Onboarding";
import { DocumentUpload } from "@/components/DocumentUpload";
import { QAInterface } from "@/components/QAInterface";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";

interface IndexProps {
  isStudent?: boolean;
}

const Index = ({ isStudent = false }: IndexProps) => {
  console.log(`Rendering Index component. isStudent: ${isStudent}`);
  
  const [step, setStep] = useState<"onboarding" | "upload" | "qa" | "assessment">(
    isStudent ? "onboarding" : "upload"
  );
  const [preferences, setPreferences] = useState(null);
  const [documentText, setDocumentText] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingDocument = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/documents/latest`);
        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            console.log("Found existing document");
            setDocumentText(data.content);
            if (isStudent && step === "onboarding") {
              toast.info("Document is ready for learning!");
            }
          }
        }
      } catch (error) {
        console.error("Error checking for existing document:", error);
      }
    };

    checkExistingDocument();
  }, [isStudent, step]);

  const handlePreferencesComplete = async (prefs: any) => {
    console.log("Preferences submitted:", prefs);
    setPreferences(prefs);
    toast.success("Preferences saved successfully!");
    
    if (documentText) {
      console.log("Document already uploaded, moving to QA step");
      setStep("qa");
    } else {
      console.log("Waiting for document upload");
      toast.info("Waiting for content to be uploaded by admin");
    }
  };

  const handleDocumentUpload = (text: string) => {
    console.log("Document uploaded, length:", text.length);
    setDocumentText(text);
    toast.success("Document processed successfully!");
    setStep("qa");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2FCE2] via-[#E5DEFF] to-[#FDE1D3] animate-gradient-x py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        <Card className="p-6 bg-white/80 backdrop-blur animate-fade-in border border-white/20">
          {!isStudent && step === "upload" && (
            <DocumentUpload onUpload={handleDocumentUpload} />
          )}
          
          {isStudent && step === "onboarding" && (
            <Onboarding onComplete={handlePreferencesComplete} />
          )}
          
          {step === "qa" && documentText && preferences && (
            <QAInterface documentText={documentText} preferences={preferences} />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Index;