import express from 'express';
import { 
  StudentProfile, 
  OpenRouterMessage, 
  OpenRouterPayload, 
  ProfileUploadResponse, 
  ChatResponse,
  PluginConfig 
} from './models/types';

// OpenRouter.ai configurations
const OPENROUTER_API_KEY: string = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL: string = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1:free';
const OPENROUTER_API_URL: string = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';

// API route handlers
export function setupStudentRoutes(app: express.Application) {
  app.post('/api/upload-profile', (req, res) => {
    try {
      const { linkedinUrl, currentEducation, interests, resume } = req.body;
      
      // Validate resume if provided
      if (resume) {
        if (!resume.filename || !resume.base64) {
          return res.status(400).json({
            success: false,
            message: 'Invalid resume data'
          });
        }
        
        // Is the file pdf?
        if (!resume.filename.toLowerCase().endsWith('.pdf')) {
          return res.status(400).json({
            success: false,
            message: 'Only PDF files are allowed for resume'
          });
        }
      }
      
      const profileData = {
        id: Date.now().toString(),
        linkedinUrl: linkedinUrl || null,
        resume: resume || null,
        currentEducation: currentEducation || null,
        interests: interests || null,
        uploadedAt: new Date().toISOString()
      };
      
      const response: ProfileUploadResponse = {
        success: true,
        message: 'Profile uploaded successfully',
        profile: profileData
      };
      res.json(response);
      
    } catch (error) {
      const errorResponse: ProfileUploadResponse = {
        success: false, 
        message: 'Failed to upload profile'
      };
      res.status(500).json(errorResponse);
    }
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const { message, userProfile, useWebSearch } = req.body;
      
      // Generate AI response using OpenRouter.ai
      const response = await generateUSCResponse(message, userProfile, useWebSearch);
      
      const chatResponse: ChatResponse = {
        success: true,
        response: response,
        timestamp: new Date().toISOString()
      };
      res.json(chatResponse);
    } catch (error) {
      const errorResponse: ChatResponse = {
        success: false,
        message: 'Failed to process chat message'
      };
      res.status(500).json(errorResponse);
    }
  });
}

// build usc context system prompt
function buildSystemPrompt(profile: StudentProfile, useWebSearch: boolean): string {
  return `You are a helpful AI assistant for the University of Southern California (USC). You provide accurate, helpful information about USC based on the university context provided. 

USC University Context:
- Name: University of Southern California (USC)
- Location: Los Angeles, California
- Type: Private Research University

Key Information:
- Acceptance Rate: 10%
- Average GPA: 3.8
- Application Deadline: January 15
- Tuition (2023-24): $80,000
- Total Cost: $80,000

Schools: Marshall School of Business, Viterbi School of Engineering, School of Cinematic Arts, Annenberg School for Communication and Journalism, Keck School of Medicine, School of Architecture, School of Dramatic Arts

Popular Majors: Business Administration, Computer Science, Film and Media Studies, Communication, Engineering, Psychology, Biology, Economics, Architecture

Location Benefits: Located in Los Angeles with connections to entertainment, technology, and business industries. Sunny climate, cultural diversity, and numerous internship opportunities.

${profile?.resume ? 'The student has uploaded a resume that you can reference for personalized advice.' : ''}
${profile?.linkedinUrl ? `Student LinkedIn profile: ${profile.linkedinUrl}` : ''}
${profile?.interests ? `Student interests: ${profile.interests}` : ''}
${profile?.currentEducation ? `Current education level: ${profile.currentEducation}` : ''}
${useWebSearch ? '\n\nWeb search is enabled - you can search for the most current USC information, deadlines, program updates, and recent news for your responses.' : ''}

IMPORTANT: Only provide information about University of Southern California based on the context above${useWebSearch ? ' and current web search results' : ''}. If asked about other universities, redirect the conversation back to USC.`;
}

// build user message which has profile details
function buildUserMessage(question: string, profile: StudentProfile): string {
  return `Student Question: ${question}

${profile?.resume ? 'The student has uploaded a resume for context.' : 'No resume uploaded.'}
${profile?.linkedinUrl ? `Student LinkedIn profile: ${profile.linkedinUrl}` : 'No LinkedIn profile provided.'}
${profile?.interests ? `Student interests: ${profile.interests}` : ''}
${profile?.currentEducation ? `Current education level: ${profile.currentEducation}` : ''}

Please provide a helpful, accurate response about University of Southern California based on the university context provided`;
}

// Helper function to prepare API request payload
function prepareRequestPayload(systemPrompt: string, userMessage: string, profile: StudentProfile, useWebSearch: boolean): OpenRouterPayload {
  const requestPayload: OpenRouterPayload = {
    model: OPENROUTER_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ],
    max_tokens: 1000
  };

  // add plugins based on features needed Like pdf and web,search.
  const plugins: PluginConfig[] = [];
  
  // PDF processing plugin if resume is present
  if (profile?.resume?.base64) {
    plugins.push({
      id: 'file-parser',
      pdf: {
        engine: 'pdf-text'
      }
    });
  }
  
  // web search plugin if enabled
  if (useWebSearch) {
    plugins.push({
      id: 'web'
    });
  }
  
  if (plugins.length > 0) {
    requestPayload.plugins = plugins;
  }

  // PDF content if available
  if (profile?.resume?.base64) {
    requestPayload.messages[1].content = [
      {
        type: 'text',
        text: userMessage
      },
      {
        type: 'file',
        file: {
          filename: profile.resume.filename || 'resume.pdf',
          file_data: `data:application/pdf;base64,${profile.resume.base64}`
        }
      }
    ];
  }

  return requestPayload;
}

export async function generateUSCResponse(question: string, profile: StudentProfile, useWebSearch: boolean): Promise<string> {
  try {
    // Build prompts and payload using helper functions
    const systemPrompt = buildSystemPrompt(profile, useWebSearch);
    const userMessage = buildUserMessage(question, profile);
    const requestPayload = prepareRequestPayload(systemPrompt, userMessage, profile, useWebSearch);

    // Make request to OpenRouter.ai
    const openRouterResponse = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload)
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      throw new Error(`OpenRouter API error: ${openRouterResponse.status}`);
    }

    const result = await openRouterResponse.json();
    let finalResponse = result.choices?.[0]?.message?.content || 'Error generating a response.';

    // Add web search note if enabled
    if (useWebSearch) {
      finalResponse += "\n\n*Note: This response was generated with web search ans is less reliable*";
    }

    return finalResponse;

  } catch (error) {
    // a fallback to response if llm response fails
    return `Error generating USC response`;
  }
}
