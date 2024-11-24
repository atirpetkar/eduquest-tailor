import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const DocumentUpload = ({ onUpload }: { onUpload: (text: string) => void }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/plain") {
      setFile(selectedFile);
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
      const text = await file.text();
      onUpload(text);
      toast.success("Document uploaded successfully!");
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Error reading file");
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Learning Material</h2>
      <div className="space-y-4">
        <Input
          type="file"
          accept=".txt"
          onChange={handleFileChange}
          className="mb-4"
        />
        <Button 
          onClick={handleUpload}
          className="w-full"
          disabled={!file}
        >
          Upload Document
        </Button>
      </div>
    </Card>
  );
};