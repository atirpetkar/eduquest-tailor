import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config";
import { ArrowLeft } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const QAInterface = ({ documentText, preferences }: { documentText: string; preferences: any }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [courseNotes, setCourseNotes] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestDocument = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/documents/latest`);
        if (response.ok) {
          const data = await response.json();
          if (data.notes) {
            console.log("Setting course notes from server");
            setCourseNotes(data.notes);
          }
        }
      } catch (error) {
        console.error("Error fetching latest document:", error);
        toast.error("Failed to load course notes");
      }
    };

    fetchLatestDocument();
  }, []);

  const handleStartAssessment = () => {
    // Store document and preferences in sessionStorage
    sessionStorage.setItem('documentText', documentText);
    sessionStorage.setItem('preferences', JSON.stringify(preferences));
    navigate('/assessment');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    console.log("Submitting question:", input);
    
    setMessages(prev => [...prev, { role: "user", content: input }]);
    
    try {
      console.log("Making API request to:", `${API_BASE_URL}/qa`);
      const response = await fetch(`${API_BASE_URL}/qa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const result = await response.json();
      console.log("Received answer:", result);
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: result.answer
      }]);
    } catch (error) {
      console.error("Error getting answer:", error);
      toast.error("Failed to get answer");
    }

    setInput("");
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="group text-primary hover:text-primary/90 hover:bg-primary/10"
      >
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Button>

      <Card className="p-6 bg-white/95 backdrop-blur shadow-lg border-primary/20">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Course Notes</h2>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-gray-50">
          <pre className="whitespace-pre-wrap text-left text-gray-700">
            {courseNotes || "Loading course notes..."}
          </pre>
        </ScrollArea>
      </Card>

      <Card className="p-6 bg-white/95 backdrop-blur shadow-lg border-primary/20">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Ask Questions</h2>
        <div className="space-y-4">
          <ScrollArea className="h-[300px] mb-4 p-4 border rounded-md bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary text-white ml-auto"
                    : "bg-secondary text-white"
                } max-w-[80%] ${message.role === "user" ? "ml-auto" : "mr-auto"}`}
              >
                {message.content}
              </div>
            ))}
          </ScrollArea>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-grow bg-white text-gray-900 border-primary/20 focus:border-primary/50 placeholder:text-gray-500"
            />
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-opacity"
            >
              Send
            </Button>
          </form>
        </div>
      </Card>

      <Button 
        onClick={handleStartAssessment}
        className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-opacity"
      >
        Start Assessment
      </Button>
    </div>
  );
};