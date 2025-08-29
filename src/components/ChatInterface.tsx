import React, { useState, useRef, useEffect } from 'react';
import { Message, StudentProfile, ChatResponse, ChatInterfaceProps } from '../models/chat-modal';

// API Configuration from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message on component mount
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        content: `Hello! I'm your University of Southern California AI assistant. Ask me about programs, admissions, campus life, and more.`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          userProfile: userProfile,
          useWebSearch: useWebSearch,
        }),
      });

      if (response.ok) {
        const result: ChatResponse = await response.json();
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: result.response,
          sender: 'ai',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        const result: any = await response.json();
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column mx-auto" style={{ maxWidth: '800px', height: '80%', border: '2px solid gray' }}>
      {/* toggle */}
      <div className="p-3 border-bottom bg-light">
        <div className="form-check form-switch">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="webSearchToggle"
            checked={useWebSearch}
            onChange={(e) => setUseWebSearch(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="webSearchToggle">
            {useWebSearch ? 'Web Enhanced' : 'University Only'}
          </label>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow-1 overflow-auto p-3">
        {messages.map((message) => (
          <div key={message.id} className={`mb-3 d-flex ${message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
            <div className={`p-3 rounded max-w-75 ${message.sender === 'user' ? 'bg-primary text-white' : 'bg-light'}`} style={{ maxWidth: '75%' }}>
              <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
              <small className={`d-block mt-1 ${message.sender === 'user' ? 'text-white-50' : 'text-muted'}`}>
                {message.timestamp.toLocaleTimeString()}
              </small>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="mb-3 d-flex justify-content-start">
            <div className="p-3 rounded bg-light">
              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-top">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Ask about USC..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
            />
            <button 
              className="btn btn-primary" 
              type="submit" 
              disabled={loading || !inputMessage.trim()}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;