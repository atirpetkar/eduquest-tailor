import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, School } from "lucide-react";
import { toast } from "sonner";

const Landing = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    toast.success(`Welcome to the ${path === '/admin' ? 'Admin' : 'Student'} Portal!`);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#2D1F3D] to-[#1F2937] animate-gradient-x flex items-center justify-center p-4">
      <div className="container max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-6 animate-fade-in">
          <img 
            src="/edufire-logo.png"
            alt="EduFire Logo" 
            className="w-32 h-32 mx-auto hover:scale-110 transition-transform duration-300 logo"
          />
          <h1 className="text-6xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#F97316] bg-clip-text text-transparent animate-text mb-4">
            EduFire
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Fueling Growth, One Student at a Time
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-8 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-[#2A2D3E]/90 to-[#1F2937]/50 backdrop-blur group hover:-translate-y-1 border border-white/10">
            <School className="w-12 h-12 text-[#8B5CF6] mb-6 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-semibold mb-4 text-white">Admin Portal</h2>
            <p className="text-gray-300 mb-8 h-20">
              Upload and manage course content for students. Create personalized learning experiences with AI-powered tools.
            </p>
            <Button 
              className="w-full group bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:opacity-90 transition-opacity"
              onClick={() => handleNavigation('/admin')}
            >
              Enter Admin Portal
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>

          <Card className="p-8 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-[#2A2D3E]/90 to-[#1F2937]/50 backdrop-blur group hover:-translate-y-1 border border-white/10">
            <BookOpen className="w-12 h-12 text-[#D946EF] mb-6 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-semibold mb-4 text-white">Student Portal</h2>
            <p className="text-gray-300 mb-8 h-20">
              Start your personalized learning journey with adaptive content and AI-guided assessments.
            </p>
            <Button 
              className="w-full group bg-gradient-to-r from-[#D946EF] to-[#F97316] hover:opacity-90 transition-opacity"
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