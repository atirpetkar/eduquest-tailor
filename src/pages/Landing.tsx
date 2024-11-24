import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2FCE2] to-[#E5DEFF] flex items-center justify-center p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#1A1F2C] mb-4">EduQuest Platform</h1>
          <p className="text-gray-600 text-lg">Transform your learning experience</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-8 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur">
            <h2 className="text-2xl font-semibold mb-4 text-[#6E59A5]">Admin Portal</h2>
            <p className="text-gray-600 mb-8 h-20">Upload and manage course content for students. Create personalized learning experiences.</p>
            <Button 
              className="w-full group bg-[#9b87f5] hover:bg-[#7E69AB] transition-colors"
              onClick={() => navigate('/admin')}
            >
              Enter Admin Portal
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur">
            <h2 className="text-2xl font-semibold mb-4 text-[#6E59A5]">Student Portal</h2>
            <p className="text-gray-600 mb-8 h-20">Start your personalized learning journey with adaptive content and assessments.</p>
            <Button 
              className="w-full group bg-[#9b87f5] hover:bg-[#7E69AB] transition-colors"
              onClick={() => navigate('/student')}
            >
              Enter Student Portal
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;