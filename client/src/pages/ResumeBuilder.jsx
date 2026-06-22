import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import ResumePreview from '../components/ResumePreview';
import { getSuggestedSkills } from '../utils/skillsDB';
import { 
  Save, Eye, Sparkles, Plus, Trash2, ArrowLeft, 
  User, FileText, Briefcase, GraduationCap, 
  FolderGit, Award, Globe, Loader2, Image, ToggleLeft, ToggleRight
} from 'lucide-react';

const ResumeBuilder = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // AI loading states
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiExpLoading, setAiExpLoading] = useState({});

  // File states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [removeBackground, setRemoveBackground] = useState(false);

  // Resume form state
  const [resume, setResume] = useState({
    title: 'My Resume',
    template: 'Classic',
    accent_color: '#ea580c', // Orange-600 default
    public: false,
    professional_summary: '',
    skills: [],
    personal_info: {
      full_name: '',
      email: '',
      profession: '',
      phone: '',
      location: '',
      linkedin: '',
      image: ''
    },
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    languages: [],
    interests: []
  });

  // Current inputs for single item additions
  const [newSkill, setNewSkill] = useState('');

  // Fetch resume data
  useEffect(() => {
    const fetchResume = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/resumes/get/${resumeId}`);
        if (response.data?.resume) {
          const resData = response.data.resume;
          // Ensure all arrays exist
          setResume({
            ...resData,
            skills: resData.skills || [],
            experience: resData.experience || [],
            projects: resData.projects || [],
            education: resData.education || [],
            certifications: resData.certifications || [],
            languages: resData.languages || [],
            interests: resData.interests || [],
            personal_info: {
              full_name: '',
              email: '',
              profession: '',
              phone: '',
              location: '',
              linkedin: '',
              image: '',
              ...(resData.personal_info || {})
            }
          });
          if (resData.personal_info?.image) {
            setImagePreview(resData.personal_info.image);
          }
        }
      } catch (err) {
        console.error('Error fetching resume:', err);
        showToast('Error loading resume. Returning to dashboard.', 'error');
        navigate('/app');
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [resumeId, navigate]);

  // Handle nested personal info changes
  const handlePersonalInfoChange = (field, value) => {
    setResume((prev) => ({
      ...prev,
      personal_info: {
        ...prev.personal_info,
        [field]: value
      }
    }));
  };

  // Image Upload Handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size must be under 2MB.', 'warning');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes to backend
  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const formData = new FormData();
      formData.append('resumeId', resumeId);
      formData.append('resumeData', JSON.stringify(resume));
      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (removeBackground) {
        formData.append('removeBackground', 'true');
      }

      const response = await api.put('/resumes/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.resume) {
        const savedResume = response.data.resume;
        setResume((prev) => ({
          ...prev,
          personal_info: {
            ...prev.personal_info,
            image: savedResume.personal_info?.image || prev.personal_info?.image
          }
        }));
        if (savedResume.personal_info?.image) {
          setImagePreview(savedResume.personal_info.image);
          setImageFile(null); // Clear pending upload
        }
      }
      showToast('Resume saved successfully!', 'success');
    } catch (err) {
      console.error('Error saving resume:', err);
      showToast('Error saving resume details.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  // AI Professional Summary Enhancement
  const handleAISummary = async () => {
    const contentToEnhance = resume.professional_summary || 
      (resume.personal_info.profession ? `Professional Summary for a ${resume.personal_info.profession}` : '');
      
    if (!contentToEnhance.trim()) {
      showToast('Please type a draft summary or enter your profession first.', 'warning');
      return;
    }

    setAiSummaryLoading(true);
    try {
      const response = await api.post('/ai/enhance-pro-sum', { userContent: contentToEnhance });
      if (response.data?.enhancedContent) {
        setResume((prev) => ({
          ...prev,
          professional_summary: response.data.enhancedContent.trim()
        }));
        showToast('Summary enhanced by AI!', 'success');
      }
    } catch (err) {
      console.error('AI Summary error:', err);
      showToast('Failed to enhance summary using AI.', 'error');
    } finally {
      setAiSummaryLoading(false);
    }
  };

  // AI Work Description Enhancement
  const handleAIExperience = async (index) => {
    const exp = resume.experience[index];
    const contentToEnhance = exp.description || 
      (exp.position ? `Job description for ${exp.position} role at ${exp.company}` : '');

    if (!contentToEnhance.trim()) {
      showToast('Please enter a role description to enhance.', 'warning');
      return;
    }

    setAiExpLoading((prev) => ({ ...prev, [index]: true }));
    try {
      const response = await api.post('/ai/enhance-job-description', { userContent: contentToEnhance });
      if (response.data?.enhancedContent) {
        const updatedExp = [...resume.experience];
        updatedExp[index].description = response.data.enhancedContent.trim();
        setResume((prev) => ({ ...prev, experience: updatedExp }));
        showToast('Job description improved!', 'success');
      }
    } catch (err) {
      console.error('AI Experience error:', err);
      showToast('Failed to enhance job description.', 'error');
    } finally {
      setAiExpLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  // AI Suggest Skills Fallback
  const handleAISuggestSkills = () => {
    const profession = resume.personal_info.profession;
    if (!profession) {
      showToast('Please fill in your Profession/Role first to suggest skills.', 'warning');
      return;
    }

    const suggestions = getSuggestedSkills(profession);
    // Filter out already added skills
    const uniqueSuggestions = suggestions.filter(s => !resume.skills.includes(s));
    
    if (uniqueSuggestions.length === 0) {
      showToast('All suggested skills are already added!', 'info');
      return;
    }

    setResume((prev) => ({
      ...prev,
      skills: [...prev.skills, ...uniqueSuggestions]
    }));
    showToast(`Added ${uniqueSuggestions.length} skills suggested for ${profession}!`, 'success');
  };

  // Skill Managers
  const addSkill = () => {
    if (newSkill.trim() && !resume.skills.includes(newSkill.trim())) {
      setResume((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }));
  };

  // Generic Array Item Manipulations
  const addArrayItem = (key, defaultObj) => {
    setResume((prev) => ({
      ...prev,
      [key]: [...prev[key], defaultObj]
    }));
  };

  const updateArrayItem = (key, index, field, value) => {
    setResume((prev) => {
      const updated = [...prev[key]];
      updated[index][field] = value;
      return { ...prev, [key]: updated };
    });
  };

  const removeArrayItem = (key, index) => {
    setResume((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, idx) => idx !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
          <p className="mt-4 text-slate-600 font-medium">Loading resume editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header / Actions Bar */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 sticky top-[57px] z-30 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app')}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <input
              type="text"
              value={resume.title}
              onChange={(e) => setResume((prev) => ({ ...prev, title: e.target.value }))}
              className="text-lg font-bold text-slate-800 bg-transparent border-none outline-none border-b border-transparent focus:border-orange-500 px-1 py-0.5 rounded transition"
              title="Click to edit resume title"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/app/view/${resumeId}`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer text-sm font-semibold"
          >
            <Eye className="w-4 h-4" />
            <span>Full Preview</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={saveLoading}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md shadow-orange-600/10 transition cursor-pointer text-sm disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {saveLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Resume</span>
          </button>
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-120px)]">
        {/* Left Side Form Editor (7 cols) */}
        <div className="lg:col-span-6 border-r border-slate-200 flex flex-col h-full bg-white">
          {/* Subtabs headers */}
          <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-thin px-4 bg-slate-50/50">
            {[
              { id: 'personal', label: 'Personal', icon: <User className="w-4 h-4" /> },
              { id: 'summary', label: 'Summary', icon: <FileText className="w-4 h-4" /> },
              { id: 'experience', label: 'Experience', icon: <Briefcase className="w-4 h-4" /> },
              { id: 'skills', label: 'Skills', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'projects', label: 'Projects', icon: <FolderGit className="w-4 h-4" /> },
              { id: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
              { id: 'more', label: 'Additional', icon: <Award className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 border-b-2 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content panel */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Tab: Personal Info */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Personal Information</h3>
                
                {/* Image Upload Area */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="relative group">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-orange-500" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                        <Image className="w-8 h-8" />
                      </div>
                    )}
                    <label className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition cursor-pointer">
                      Change
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <p className="text-xs font-semibold text-slate-700">Profile Picture</p>
                    <p className="text-[10px] text-slate-400">Upload a professional headshot. Max 2MB.</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 pt-1.5">
                      <button
                        type="button"
                        onClick={() => setRemoveBackground(!removeBackground)}
                        className="text-slate-500 flex items-center gap-1 cursor-pointer focus:outline-none"
                      >
                        {removeBackground ? (
                          <ToggleRight className="w-8 h-8 text-orange-600" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-slate-400" />
                        )}
                        <span className="text-[11px] font-medium">Remove Image Background (AI)</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                    <input
                      type="text"
                      value={resume.personal_info.full_name}
                      onChange={(e) => handlePersonalInfoChange('full_name', e.target.value)}
                      placeholder="John Doe"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Profession / Role</label>
                    <input
                      type="text"
                      value={resume.personal_info.profession}
                      onChange={(e) => handlePersonalInfoChange('profession', e.target.value)}
                      placeholder="Software Engineer"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                    <input
                      type="email"
                      value={resume.personal_info.email}
                      onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                      placeholder="johndoe@example.com"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={resume.personal_info.phone}
                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                    <input
                      type="text"
                      value={resume.personal_info.location}
                      onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                      placeholder="San Francisco, CA"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">LinkedIn Profile</label>
                    <input
                      type="text"
                      value={resume.personal_info.linkedin}
                      onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                      placeholder="linkedin.com/in/johndoe"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Professional Summary */}
            {activeTab === 'summary' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-800">Professional Summary</h3>
                  <button
                    onClick={handleAISummary}
                    disabled={aiSummaryLoading}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-orange-50 hover:bg-orange-100 text-orange-600 text-[10px] font-bold tracking-tight shadow-sm border border-orange-100 transition disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {aiSummaryLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>AI Generate / Enhance</span>
                  </button>
                </div>
                <div>
                  <textarea
                    rows="8"
                    value={resume.professional_summary}
                    onChange={(e) => setResume((prev) => ({ ...prev, professional_summary: e.target.value }))}
                    placeholder="Write a brief professional summary highlighting your key achievements, skills, and experience..."
                    className="w-full border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:border-orange-500 outline-none leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Tip: Enter your profession/role, type a basic draft, and click "AI Generate / Enhance" to improve the wording.
                  </p>
                </div>
              </div>
            )}

            {/* Tab: Experience */}
            {activeTab === 'experience' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-800">Work Experience</h3>
                  <button
                    onClick={() => addArrayItem('experience', { company: '', position: '', start_date: '', end_date: '', description: '' })}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold tracking-tight border transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Job</span>
                  </button>
                </div>

                {resume.experience.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 border rounded-xl border-dashed">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No experience added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {resume.experience.map((exp, index) => (
                      <div key={index} className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl space-y-4 relative">
                        <button
                          onClick={() => removeArrayItem('experience', index)}
                          className="absolute top-4 right-4 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Remove experience"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <h4 className="text-xs font-bold text-orange-600 pr-10">Job #{index + 1}</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Company</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => updateArrayItem('experience', index, 'company', e.target.value)}
                              placeholder="e.g. Acme Corp"
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-850 bg-white focus:border-orange-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Job Role / Position</label>
                            <input
                              type="text"
                              value={exp.position}
                              onChange={(e) => updateArrayItem('experience', index, 'position', e.target.value)}
                              placeholder="e.g. Senior Frontend Developer"
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-850 bg-white focus:border-orange-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Start Date</label>
                            <input
                              type="text"
                              value={exp.start_date}
                              onChange={(e) => updateArrayItem('experience', index, 'start_date', e.target.value)}
                              placeholder="e.g. Jan 2023"
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-850 bg-white focus:border-orange-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">End Date</label>
                            <input
                              type="text"
                              value={exp.end_date}
                              onChange={(e) => updateArrayItem('experience', index, 'end_date', e.target.value)}
                              placeholder="e.g. Present or Dec 2024"
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-850 bg-white focus:border-orange-500 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase">Responsibilities & Achievements</label>
                            <button
                              onClick={() => handleAIExperience(index)}
                              disabled={aiExpLoading[index]}
                              className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-orange-50 hover:bg-orange-100 text-orange-600 text-[9px] font-bold tracking-tight shadow-sm border border-orange-100 transition disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                              {aiExpLoading[index] ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Sparkles className="w-3 h-3" />
                              )}
                              <span>AI Improve</span>
                            </button>
                          </div>
                          <textarea
                            rows="4"
                            value={exp.description}
                            onChange={(e) => updateArrayItem('experience', index, 'description', e.target.value)}
                            placeholder="Describe your achievements and duties..."
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-850 bg-white focus:border-orange-500 outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Skills */}
            {activeTab === 'skills' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-800">Skills</h3>
                  <button
                    onClick={handleAISuggestSkills}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-orange-50 hover:bg-orange-100 text-orange-600 text-[10px] font-bold tracking-tight shadow-sm border border-orange-100 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Suggest Skills</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter skill tag (e.g. React.js)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-850 outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2.5 rounded-lg bg-slate-800 text-white font-semibold text-xs hover:bg-slate-700 transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {resume.skills.length === 0 ? (
                    <p className="text-xs text-slate-450 italic">No skills added. Try clicking "AI Suggest Skills".</p>
                  ) : (
                    resume.skills.map((skill) => (
                      <span 
                        key={skill} 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-50 border border-orange-100 text-orange-700"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-orange-200/50 text-orange-500 hover:text-orange-700 font-bold text-[10px] shrink-0"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab: Projects */}
            {activeTab === 'projects' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-800">Projects</h3>
                  <button
                    onClick={() => addArrayItem('projects', { name: '', description: '', link: '' })}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold tracking-tight border transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                {resume.projects.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 border rounded-xl border-dashed">
                    <FolderGit className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No projects added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {resume.projects.map((proj, index) => (
                      <div key={index} className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl space-y-3 relative">
                        <button
                          onClick={() => removeArrayItem('projects', index)}
                          className="absolute top-4 right-4 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Remove project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <h4 className="text-xs font-bold text-orange-600 pr-10">Project #{index + 1}</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Project Name</label>
                            <input
                              type="text"
                              value={proj.name}
                              onChange={(e) => updateArrayItem('projects', index, 'name', e.target.value)}
                              placeholder="e.g. Portfolio Website"
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-850 bg-white focus:border-orange-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Project Link</label>
                            <input
                              type="text"
                              value={proj.link}
                              onChange={(e) => updateArrayItem('projects', index, 'link', e.target.value)}
                              placeholder="e.g. github.com/johndoe/portfolio"
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-850 bg-white focus:border-orange-500 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Project Description</label>
                          <textarea
                            rows="3"
                            value={proj.description}
                            onChange={(e) => updateArrayItem('projects', index, 'description', e.target.value)}
                            placeholder="Write a brief overview of the project, technologies used, and what you achieved..."
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-850 bg-white focus:border-orange-500 outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Education */}
            {activeTab === 'education' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-800">Education</h3>
                  <button
                    onClick={() => addArrayItem('education', { institution: '', degree: '', field_of_study: '', graduation_date: '', gpa: '' })}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold tracking-tight border transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add School</span>
                  </button>
                </div>

                {resume.education.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 border rounded-xl border-dashed">
                    <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No education added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {resume.education.map((edu, index) => (
                      <div key={index} className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl space-y-3 relative">
                        <button
                          onClick={() => removeArrayItem('education', index)}
                          className="absolute top-4 right-4 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Remove education"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <h4 className="text-xs font-bold text-orange-600 pr-10">Education #{index + 1}</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Institution / School / College</label>
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => updateArrayItem('education', index, 'institution', e.target.value)}
                              placeholder="e.g. Stanford University"
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-850 bg-white focus:border-orange-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Degree</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateArrayItem('education', index, 'degree', e.target.value)}
                              placeholder="e.g. Bachelor of Science"
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-850 bg-white focus:border-orange-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Field of Study</label>
                            <input
                              type="text"
                              value={edu.field_of_study}
                              onChange={(e) => updateArrayItem('education', index, 'field_of_study', e.target.value)}
                              placeholder="e.g. Computer Science"
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-850 bg-white focus:border-orange-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Graduation Date</label>
                            <input
                              type="text"
                              value={edu.graduation_date}
                              onChange={(e) => updateArrayItem('education', index, 'graduation_date', e.target.value)}
                              placeholder="e.g. May 2024"
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-850 bg-white focus:border-orange-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">GPA / Score</label>
                            <input
                              type="text"
                              value={edu.gpa}
                              onChange={(e) => updateArrayItem('education', index, 'gpa', e.target.value)}
                              placeholder="e.g. 3.8 / 4.0"
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-850 bg-white focus:border-orange-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: More / Certifications & Languages */}
            {activeTab === 'more' && (
              <div className="space-y-6">
                
                {/* Certifications Sub-section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-800">Certifications & Awards</h3>
                    <button
                      onClick={() => addArrayItem('certifications', { name: '', issuer: '', date: '' })}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold tracking-tight border transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Certificate</span>
                    </button>
                  </div>

                  {resume.certifications.length > 0 && (
                    <div className="space-y-4">
                      {resume.certifications.map((cert, index) => (
                        <div key={index} className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl space-y-3 relative">
                          <button
                            onClick={() => removeArrayItem('certifications', index)}
                            className="absolute top-4 right-4 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                            title="Remove certification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-1">
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Name</label>
                              <input
                                type="text"
                                value={cert.name}
                                onChange={(e) => updateArrayItem('certifications', index, 'name', e.target.value)}
                                placeholder="e.g. AWS Certified Practitioner"
                                className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-855 bg-white focus:border-orange-500 outline-none"
                              />
                            </div>
                            <div className="sm:col-span-1">
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Issuer</label>
                              <input
                                type="text"
                                value={cert.issuer}
                                onChange={(e) => updateArrayItem('certifications', index, 'issuer', e.target.value)}
                                placeholder="e.g. Amazon Web Services"
                                className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-855 bg-white focus:border-orange-500 outline-none"
                              />
                            </div>
                            <div className="sm:col-span-1">
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Date</label>
                              <input
                                type="text"
                                value={cert.date}
                                onChange={(e) => updateArrayItem('certifications', index, 'date', e.target.value)}
                                placeholder="e.g. June 2024"
                                className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-855 bg-white focus:border-orange-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Languages Sub-section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-800">Languages</h3>
                    <button
                      onClick={() => addArrayItem('languages', { name: '', proficiency: '' })}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold tracking-tight border transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Language</span>
                    </button>
                  </div>

                  {resume.languages.length > 0 && (
                    <div className="space-y-4">
                      {resume.languages.map((lang, index) => (
                        <div key={index} className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl space-y-3 relative">
                          <button
                            onClick={() => removeArrayItem('languages', index)}
                            className="absolute top-4 right-4 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                            title="Remove language"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Language</label>
                              <input
                                type="text"
                                value={lang.name}
                                onChange={(e) => updateArrayItem('languages', index, 'name', e.target.value)}
                                placeholder="e.g. Spanish"
                                className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-855 bg-white focus:border-orange-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Proficiency</label>
                              <input
                                type="text"
                                value={lang.proficiency}
                                onChange={(e) => updateArrayItem('languages', index, 'proficiency', e.target.value)}
                                placeholder="e.g. Native / Professional / Conversational"
                                className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-855 bg-white focus:border-orange-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>

        {/* Right Side live renderer panel (6 cols) */}
        <div className="lg:col-span-6 bg-slate-100 flex flex-col h-full overflow-hidden">
          {/* Live Preview Toolbar controls */}
          <div className="bg-white border-b border-slate-250 py-2.5 px-4 flex flex-wrap items-center justify-between gap-4 select-none">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Template:</label>
              <select
                value={resume.template}
                onChange={(e) => setResume((prev) => ({ ...prev, template: e.target.value }))}
                className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 bg-white font-semibold outline-none focus:border-orange-500"
              >
                <option value="Classic">Classic (Serif)</option>
                <option value="Modern">Modern (Split Sidebar)</option>
                <option value="Professional">Professional (Header Banner)</option>
                <option value="Creative">Creative (Vibrant Pills)</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accent Color:</label>
              <div className="flex items-center gap-1.5">
                {[
                  '#ea580c', // Orange-650
                  '#3b82f6', // Blue-500
                  '#10b981', // Green-500
                  '#8b5cf6', // Violet-500
                  '#db2777', // Pink-600
                  '#0f172a'  // Slate-900
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => setResume((prev) => ({ ...prev, accent_color: color }))}
                    className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                      resume.accent_color === color ? 'scale-125 border-slate-800' : 'border-white hover:scale-110 shadow-sm'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                {/* Custom Color Input */}
                <input
                  type="color"
                  value={resume.accent_color}
                  onChange={(e) => setResume((prev) => ({ ...prev, accent_color: e.target.value }))}
                  className="w-6 h-6 border rounded cursor-pointer p-0 bg-transparent shrink-0"
                  title="Choose Custom Color"
                />
              </div>
            </div>
          </div>

          {/* Scrolling preview container */}
          <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-slate-200/50">
            <div className="w-full max-w-[21cm] shadow-md border border-slate-300 rounded overflow-hidden origin-top scale-[0.9] sm:scale-100 bg-white min-h-[29.7cm] mb-12">
              <ResumePreview resume={resume} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;