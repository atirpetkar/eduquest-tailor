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
}

export const DocumentUpload = ({ onUpload }: DocumentUploadProps) => {
  console.log("Rendering DocumentUpload component");
  
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const getStatusMessage = (progress: number) => {
    if (progress === 0) return "";
    if (progress < 33) return "Processing your document...";
    if (progress < 66) return "Chunking your document into smaller pieces...";
    if (progress < 100) return "Storing chunks in vector database...";
    return "Document processed successfully! 🎉";
  };

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

    try {
      console.log("Starting file upload process");
      setIsProcessing(true);
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 5, 90);
          setStatus(getStatusMessage(newProgress));
          if (newProgress >= 90) {
            clearInterval(progressInterval);
          }
          return newProgress;
        });
      }, 500);

      const formData = new FormData();
      formData.append('file', file);
      
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
      
      clearInterval(progressInterval);
      setProgress(100);
      setStatus(getStatusMessage(100));
      onUpload("");
      toast.success("Document processed successfully!");
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error processing file");
      setStatus("Error processing document");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
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
                {status}
              </p>
            </div>
          )}

          <Button 
            onClick={handleUpload}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            disabled={!file || isProcessing}
          >
            {isProcessing ? "Processing..." : "Upload Document"}
          </Button>
        </div>
      </Card>
    </div>
  );
};