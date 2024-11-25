# 🔥 EduFire - AI-Powered Learning Platform

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Latest-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Latest-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?logo=vite)](https://vitejs.dev/)

## 📚 Overview

EduFire is a cutting-edge educational platform that leverages AI technology to transform the learning experience. Our platform provides:

- 🤖 AI-powered content generation and adaptation
- 📝 Smart document processing and analysis
- 💡 Intelligent Q&A system
- 📊 Adaptive assessments
- 🎨 Modern, responsive UI

## 🛠️ Technical Architecture

### Frontend (React + TypeScript)

#### Key Components
- `DocumentUpload`: Handles document processing (📄)
- `QAInterface`: Manages Q&A interactions (💭)
- `AssessmentInterface`: Handles assessments and scoring (📝)
- `Onboarding`: User preference management (👤)

#### UI Framework
- shadcn/ui components
- Tailwind CSS for styling
- Responsive design principles

### Backend (Python + Flask)

#### Core Services
- `GoodfireService`: AI model management and interactions
- `EmbeddingService`: Document embedding and similarity search
- `AssessmentService`: Test generation and scoring

#### API Endpoints
- `/api/documents`: Document upload and processing
- `/api/qa`: Q&A functionality
- `/api/generate-notes`: Course notes generation
- `/api/generate-assessment`: Assessment creation
- `/api/score-answer`: Answer evaluation

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python 3.11+
- OpenAI API key
- Goodfire API key

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
export OPENAI_API_KEY=your_key_here
export GOODFIRE_API_KEY=your_key_here

# Start Flask server
python app.py
```

## 💻 Development Guidelines

### Code Organization
- Components are modular and focused
- Extensive use of TypeScript for type safety
- Consistent error handling and logging
- Responsive design patterns

### Best Practices
- 🔄 Regular error logging
- 🎯 Component-focused architecture
- 📱 Mobile-first design approach
- 🧪 Error boundary implementation

## 🔒 Security Considerations

- API key management through environment variables
- CORS configuration for API security
- Input validation and sanitization
- Rate limiting on API endpoints

## 🎨 UI/UX Features

- Responsive design for all screen sizes
- Interactive loading states
- Toast notifications for user feedback
- Smooth animations and transitions
- Dark mode support
- Accessible components

## 🔧 Configuration

### Environment Variables
```env
OPENAI_API_KEY=your_openai_key
GOODFIRE_API_KEY=your_goodfire_key
```

### API Configuration
- Backend runs on port 8084
- Frontend development server on port 5173
- CORS enabled for development

## 📈 Performance Optimization

- Lazy loading of components
- Efficient state management
- Optimized API calls
- Caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for AI capabilities
- [Goodfire AI](https://goodfire.ai/) for Interpretability
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## 📧 Support

For support, please open an issue in the repository or contact the maintainers.

## 🔄 Version History

- Current Version: 1.0.0
- Initial Release: February 2024