import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
    console.log("Generating course notes with preferences:", preferences);
    const simulatedNotes = `Sample course notes formatted according to preferences:
${preferences.contentFormat.map((pref: string) => `\n- Following ${pref} style`).join('')}
\n\nDocument content summary:\n${documentText.slice(0, 200)}...`;
    
    setCourseNotes(simulatedNotes);
    toast.success("Course notes generated successfully!");
  }, [documentText, preferences]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: "user", content: input }]);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "This is a simulated response. In the real implementation, this would be replaced with the Goodfire API response." 
      }]);
    }, 1000);

    setInput("");
  };

  const handleAssessmentClick = () => {
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
                {courseNotes}
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