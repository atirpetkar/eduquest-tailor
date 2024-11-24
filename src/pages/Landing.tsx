import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowRight, GraduationCap, BookOpen, School } from "lucide-react";
import { toast } from "sonner";

const Landing = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    toast.success(`Welcome to the ${path === '/admin' ? 'Admin' : 'Student'} Portal!`);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2FCE2] to-[#E5DEFF] flex items-center justify-center p-4">
      <div className="container max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-6 animate-fade-in">
          <GraduationCap className="w-20 h-20 mx-auto text-[#6E59A5] animate-bounce" />
          <h1 className="text-6xl font-bold text-[#1A1F2C] mb-4">
            EduQuest Platform
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Transform your learning experience with our AI-powered educational platform
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-8 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur group hover:-translate-y-1">
            <School className="w-12 h-12 text-[#6E59A5] mb-6 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-semibold mb-4 text-[#6E59A5]">Admin Portal</h2>
            <p className="text-gray-600 mb-8 h-20">
              Upload and manage course content for students. Create personalized learning experiences with AI-powered tools.
            </p>
            <Button 
              className="w-full group bg-[#9b87f5] hover:bg-[#7E69AB] transition-colors"
              onClick={() => handleNavigation('/admin')}
            >
              Enter Admin Portal
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>

          <Card className="p-8 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur group hover:-translate-y-1">
            <BookOpen className="w-12 h-12 text-[#6E59A5] mb-6 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-semibold mb-4 text-[#6E59A5]">Student Portal</h2>
            <p className="text-gray-600 mb-8 h-20">
              Start your personalized learning journey with adaptive content and AI-guided assessments.
            </p>
            <Button 
              className="w-full group bg-[#9b87f5] hover:bg-[#7E69AB] transition-colors"
              onClick={() => handleNavigation('/student')}
            >
              Start Learning
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;