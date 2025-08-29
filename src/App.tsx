import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import ProfileUpload from './components/ProfileUpload';

type TabType = 'chat' | 'profile';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [userProfile, setUserProfile] = useState<any>(null);

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <header className="bg-primary text-white p-3">
        <h1 className="h4 text-center">University of Southern California AI Assistant</h1>
      </header>

      <nav className="border-bottom">
        <div className="nav nav-tabs">
          <button 
            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
        </div>
      </nav>
      
      <main className="flex-grow-1 overflow-hidden">
        {activeTab === 'profile' && (
          <ProfileUpload 
            userProfile={userProfile} 
            setUserProfile={setUserProfile} 
          />
        )}
        {activeTab === 'chat' && (
          <ChatInterface userProfile={userProfile} />
        )}
      </main>
    </div>
  );
}

export default App;