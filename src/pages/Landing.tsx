import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">EduQuest Platform</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Admin Portal</h2>
            <p className="text-gray-600 mb-4">Upload and manage course content for students.</p>
            <Button 
              className="w-full"
              onClick={() => navigate('/admin')}
            >
              Enter Admin Portal
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Student Portal</h2>
            <p className="text-gray-600 mb-4">Start your personalized learning journey.</p>
            <Button 
              className="w-full"
              onClick={() => navigate('/student')}
            >
              Enter Student Portal
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;