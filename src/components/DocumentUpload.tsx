import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config";
import { ArrowLeft, Flame } from "lucide-react";

interface DocumentUploadProps {
  onUpload: (text: string) => void;
  preferences?: any;
}

export const DocumentUpload = ({ onUpload, preferences }: DocumentUploadProps) => {
  console.log("Rendering DocumentUpload component with preferences:", preferences);
  
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    console.log("File selected:", selectedFile?.name);
    
    if (selectedFile && selectedFile.type === "text/plain") {
      setFile(selectedFile);
      setProgress(0);
      setStatus("");
    } else {
      console.warn("Invalid file type selected");
      toast.error("Please upload a .txt file");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.warn("Upload attempted without file selection");
      toast.error("Please select a file first");
      return;
    }

    if (!preferences) {
      console.warn("Upload attempted without user preferences");
      toast.error("Please complete onboarding first");
      return;
    }

    try {
      console.log("Starting file upload process with preferences:", preferences);
      setIsProcessing(true);
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('preferences', JSON.stringify(preferences));
      
      console.log("Making API request to:", `${API_BASE_URL}/documents`);
      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      console.log("Upload successful, response:", result);
      setProgress(100);
      onUpload(result.notes);
      toast.success("Document processed successfully!");
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error processing file");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost"
          onClick={() => {
            console.log("Navigating back to home");
            navigate('/');
          }}
          className="group text-primary hover:text-primary/90 hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Upload Learning Material
        </h1>
      </div>

      <Card className="p-6 bg-white/95 backdrop-blur border-primary/20 shadow-lg">
        <div className="space-y-6">
          <Input
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            className="border-2 border-dashed border-primary/30 rounded-lg p-4 hover:border-primary/50 transition-colors"
            disabled={isProcessing}
          />
          
          {(progress > 0 || status) && (
            <div className="space-y-4">
              <div className="relative">
                <Progress 
                  value={progress} 
                  className="h-3 bg-primary/20"
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 left-0 flex items-center"
                  style={{ left: `${progress}%` }}
                >
                  <Flame 
                    className={`h-6 w-6 text-primary animate-pulse ${
                      progress === 100 ? 'text-green-500' : ''
                    }`}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground animate-fade-in text-center">
                {progress === 100 ? 'Document processed! 🎉' : 'Processing your document...'}
              </p>
            </div>
          )}

          <Button 
            onClick={handleUpload}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            disabled={!file || isProcessing || !preferences}
          >
            {isProcessing ? "Processing..." : "Upload Document"}
          </Button>
        </div>
      </Card>
    </div>
  );
};