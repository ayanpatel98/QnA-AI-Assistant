import React, { useState } from 'react';

interface ProfileUploadProps {
  userProfile: any;
  setUserProfile: (profile: any) => void;
}

const ProfileUpload: React.FC<ProfileUploadProps> = ({ userProfile, setUserProfile }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [currentEducation, setCurrentEducation] = useState('');
  const [interests, setInterests] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let resumeBase64 = null;
      let resumeData = null;

      // Convert file to base64 if uploaded
      if (resumeFile) {
        // Validate file type
        if (resumeFile.type !== 'application/pdf') {
          setError('Only PDF files are allowed for resume');
          setLoading(false);
          return;
        }

        // Convert to base64
        const reader = new FileReader();
        resumeBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix to get pure base64
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(resumeFile);
        });

        resumeData = {
          filename: resumeFile.name,
          originalName: resumeFile.name,
          size: resumeFile.size,
          base64: resumeBase64
        };
      }

      const requestData = {
        linkedinUrl: linkedinUrl || null,
        currentEducation: currentEducation || null,
        interests: interests || null,
        resume: resumeData
      };

      const response = await fetch('http://localhost:8080/api/upload-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        setUserProfile(result.profile);
        setSuccess('Profile uploaded successfully!');
        
        // Clear form
        setLinkedinUrl('');
        setResumeFile(null);
        setCurrentEducation('');
        setInterests('');
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      setError('Failed to upload profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 h-100 overflow-auto">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <h2 className="h5 mb-3">Your Profile</h2>
          
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-12">
              <label className="form-label">Resume (PDF)</label>
              <input
                className="form-control"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label">LinkedIn URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://linkedin.com/in/your-profile"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Education Level</label>
              <select
                className="form-select"
                value={currentEducation}
                onChange={(e) => setCurrentEducation(e.target.value)}
              >
                <option value="">Select level</option>
                <option value="high_school">High School</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="graduate">Graduate</option>
                <option value="working_professional">Working Professional</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">Interests</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Your academic interests and career goals..."
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
            </div>



            <div className="col-12">
              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Save Profile'}
              </button>
            </div>
          </form>

          {userProfile && (
            <div className="mt-4 p-3 bg-light rounded">
              <h6>Profile Status: <span className="text-success">Active</span></h6>
              {userProfile.resume && <small>Resume: {userProfile.resume.originalName}</small>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileUpload;