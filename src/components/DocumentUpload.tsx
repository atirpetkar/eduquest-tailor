import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config";

export const DocumentUpload = ({ onUpload }: { onUpload: (text: string) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/plain") {
      setFile(selectedFile);
      setProgress(0);
      setStatus("");
    } else {
      toast.error("Please upload a .txt file");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
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
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Upload Learning Material</h2>
        <Button 
          variant="outline"
          onClick={() => navigate('/')}
          className="ml-auto"
        >
          Back to Home
        </Button>
      </div>
      
      <div className="space-y-4">
        <Input
          type="file"
          accept=".txt"
          onChange={handleFileChange}
          className="mb-4"
          disabled={isProcessing}
        />
        
        {(progress > 0 || status) && (
          <div className="space-y-2">
            <Progress 
              value={progress} 
              className="h-2 transition-all duration-500 ease-in-out"
            />
            <p className="text-sm text-muted-foreground animate-fade-in">
              {status}
            </p>
          </div>
        )}

        <Button 
          onClick={handleUpload}
          className="w-full"
          disabled={!file || isProcessing}
        >
          {isProcessing ? "Processing..." : "Upload Document"}
        </Button>
      </div>
    </Card>
  );
};