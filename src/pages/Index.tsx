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
  const [step, setStep] = useState<"onboarding" | "upload" | "qa" | "assessment">(
    isStudent ? "onboarding" : "upload"
  );
  const [preferences, setPreferences] = useState(null);
  const [documentText, setDocumentText] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePreferencesComplete = async (prefs: any) => {
    console.log("Preferences saved:", prefs);
    setPreferences(prefs);
    toast.success("Preferences saved successfully!");
    if (documentText) {
      setStep("qa");
    } else {
      toast.info("Waiting for content to be uploaded by admin");
    }
  };

  const handleDocumentUpload = (text: string) => {
    console.log("Document uploaded:", text);
    setDocumentText(text);
    toast.success("Document processed successfully!");
    setStep("qa");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2FCE2] to-[#E5DEFF] py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost"
              className="group"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-[#6E59A5]" />
              <h1 className="text-2xl font-bold text-[#1A1F2C]">
                {isStudent ? "Student Portal" : "Admin Portal"}
              </h1>
            </div>
          </div>
        </div>

        <Card className="p-6 bg-white/80 backdrop-blur animate-fade-in">
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