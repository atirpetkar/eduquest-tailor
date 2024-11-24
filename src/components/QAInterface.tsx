import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const QAInterface = ({ documentText, preferences }: { documentText: string; preferences: any }) => {
  console.log("Rendering QAInterface component");
  console.log("Document length:", documentText?.length);
  console.log("Preferences:", preferences);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    console.log("Submitting question:", input);
    
    // Add user message
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

  const handleAssessmentClick = () => {
    console.log("Navigating to assessment page");
    // Store the document and preferences in sessionStorage
    sessionStorage.setItem('documentText', documentText);
    sessionStorage.setItem('preferences', JSON.stringify(preferences));
    navigate('/assessment');
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">Q&A Chat</TabsTrigger>
          <TabsTrigger value="notes">Course Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat">
          <Card className="p-6 h-[500px] flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Ask Questions</h2>
            
            <ScrollArea className="flex-grow mb-4 p-4 border rounded-md">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-secondary text-secondary-foreground"
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
                className="flex-grow"
              />
              <Button type="submit">Send</Button>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes">
          <Card className="p-6 h-[500px]">
            <h2 className="text-xl font-semibold mb-4">Generated Course Notes</h2>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <pre className="whitespace-pre-wrap text-left">
                {courseNotes || "Loading course notes..."}
              </pre>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button onClick={handleAssessmentClick}>
          Continue to Assessment
        </Button>
      </div>
    </div>
  );
};