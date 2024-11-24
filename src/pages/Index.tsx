import { useState } from "react";
import { Onboarding } from "@/components/Onboarding";
import { DocumentUpload } from "@/components/DocumentUpload";
import { QAInterface } from "@/components/QAInterface";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BookOpen } from "lucide-react";
import { toast } from "sonner";

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
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost"
              className="group hover:bg-white/20"
              onClick={() => {
                console.log("Navigating back to home");
                navigate('/');
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-[#8B5CF6]" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent">
                {isStudent ? "Student Portal" : "Admin Portal"}
              </h1>
            </div>
          </div>
        </div>

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