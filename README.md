# University of Southern California AI Assistant
AI-powered chat application for prospective USC students using which the students can ask university related questions and also can get the web enhanced answers.

# How It Works
1. Student uploads resume and profile info
2. AI analyzes resume content using PDF processing
3. Chat interface sends questions to backend
4. OpenRouter.ai generates USC-specific responses using a particular selected model
5. Optional web search for current USC information

# Live Public URL
- https://usc-ai-frontend-tfim.onrender.com

# Tech Stack
**Frontend:**
- React + TypeScript
- Bootstrap 5

**Backend:**
- Node.js + Express.js + TypeScript
- OpenRouter.ai

# Key Files
- **App.tsx** - Main component with Profile/Chat tabs
- **ChatInterface.tsx** - has chat UI with message history
- **ProfileUpload.tsx** - does file upload with validation
- **server.ts** - Express server main file
- **studentchat.ts** - API routes and AI api integration

# API Key and Model selection Configuration for local setup
To use the OpenRouter.ai service, you need to add your API key:
In the  `server/.env` file add the api key and model as below:
```
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=your_model_selection
```

# Setup
```bash
# Frontend
npm install
npm start

# Backend
cd server
npm install
npm run dev
```


# Design Decisions

**Project Structure:** Instead of using a monolithic approach, I decided to clearly distinguish between the frontend (React) and backend (Express) as distinct services. This makes it simpler to maintain and update each component independently by enabling independent scaling and deployment.

**AI API Selection:** Because OpenRouter.ai provides access to multiple models through a single API, including free tiers, I chose it over OpenAI or other providers. This lowers development costs and allows for model switching without modifying the codebase.

**Model Choice:** I used `mistralai/devstral-small-2505:free` via OpenRouter for its solid reasoning on the free tier, fast responses, and compatibility with the required plugins (file parsing and optional web search). Although smaller than flagship models, it reliably powers USC Q&A grounded by resume context at low cost. I chose this model because it is lightweight, low-latency, and has solid reasoning capabilities; while not at the level of OpenAI and anthropic models, it is sufficient for the complexity of our use case.

**File Upload Approach:** Since the OpenRouter.ai api allows direct injection of the base64 file to its api payload, I used Base64 encoding for PDF uploads rather than cloud storage or intricate file handling systems. By doing this, extra service dependencies are avoided and the infrastructure is kept simple.

**TypeScript Throughout:** I used TypeScript for both frontend and backend to catch errors early and improve code maintainability.

# Trade-offs

**More Simplicity:** I prioritized getting a working MVP over advanced features. For example, I chose session-based profile storage instead of a database, which limits scalability but reduces complexity significantly.

**Less Performance:** Using free tier services can result in poor user experience due to resource bottlenecks like slower response times and request rate limits.

**Less Security:** Instead of putting in place a more complex secret management system, I store API keys in environment variables.

**File Format Limitations:** Only PDF files can be processed by OpenRouter.ai; Word, PowerPoint, and other popular resume formats are not supported. This adds a step by requiring users to convert their documents to PDF before uploading.

# Future Improvements

**Enhanced AI Integration:** I can integrate more specialized AI models for various query types, add support for multiple file uploads, and use conversation memory to preserve context across sessions.

**Better Data Management:** I would add a proper database for storing user profiles and chat history and implement user authentication for security.

**UI/UX Enhancements:** I would improve the chat interface with better error handling. Adding drag-and-drop file upload functionality would enhance user experience.