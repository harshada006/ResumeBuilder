import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ResumeTemplates from '../components/ResumeTemplates';
import { 
  ArrowLeft, Save, Printer, Eye, Lock, Globe, Sparkles, Plus, Trash2, 
  ChevronDown, ChevronUp, User, FileText, Briefcase, GraduationCap, 
  Code, Award, Globe2, Heart, Upload, RefreshCw, X, MessageSquare, 
  Flame, Copy, Download as DownloadIcon, Check
} from 'lucide-react';

const ResumeBuilder = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { apiFetch, showToast } = useAuth();

  // Core state
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal'); // accordion state
  
  // AI states (Inline)
  const [aiLoading, setAiLoading] = useState({
    summary: false,
    skills: false,
    experience: {}
  });
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  
  // Temp tags
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  // AI assistant drawer states
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiTab, setAiTab] = useState('ats');
  
  // Drawer data states
  const [jobDescription, setJobDescription] = useState('');
  const [atsScoreData, setAtsScoreData] = useState(null);
  const [jobMatchData, setJobMatchData] = useState(null);
  const [loadingAts, setLoadingAts] = useState(false);
  const [loadingJobMatch, setLoadingJobMatch] = useState(false);

  const [coverTone, setCoverTone] = useState('Professional');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [loadingLetter, setLoadingLetter] = useState(false);

  const [interviewPrep, setInterviewPrep] = useState(null);
  const [loadingInterview, setLoadingInterview] = useState(false);
  const [expandedInterviewQuestion, setExpandedInterviewQuestion] = useState(null);

  const [linkedInOptimized, setLinkedInOptimized] = useState(null);
  const [loadingLinkedIn, setLoadingLinkedIn] = useState(false);

  const [roastData, setRoastData] = useState(null);
  const [loadingRoast, setLoadingRoast] = useState(false);

  const [bulletDraft, setBulletDraft] = useState('');
  const [enhancedBullets, setEnhancedBullets] = useState(null);
  const [loadingBullets, setLoadingBullets] = useState(false);

  // Fetch resume data
  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/api/resumes/get/${resumeId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch resume details');
        
        // Setup initial default fields if missing
        const r = data.resume;
        if (!r.personal_info) r.personal_info = {};
        if (!r.skills) r.skills = [];
        if (!r.experience) r.experience = [];
        if (!r.projects) r.projects = [];
        if (!r.education) r.education = [];
        if (!r.certifications) r.certifications = [];
        if (!r.languages) r.languages = [];
        if (!r.interests) r.interests = [];
        
        setResume(r);
        if (r.personal_info?.image) {
          setAvatarPreview(r.personal_info.image);
        }
      } catch (err) {
        showToast(err.message, 'error');
        navigate('/app');
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [resumeId]);

  // Handle Form field changes (deep update helper)
  const updateField = (section, field, value) => {
    setResume((prev) => {
      if (!section) {
        return { ...prev, [field]: value };
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  };

  // Image Selection Handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size must be less than 2MB', 'warning');
        return;
      }
      // Set preview URL locally
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Store file object in resume state to be sent with FormData
      setResume((prev) => ({
        ...prev,
        personal_info: {
          ...prev.personal_info,
          imageFile: file // temporary property
        }
      }));
    }
  };

  // Save Resume API call
  const handleSave = async (silent = false) => {
    if (!resume) return;
    setSaving(true);
    try {
      const formData = new FormData();
      const resumeCopy = { ...resume };
      
      // Separate image file to append to form data
      const imageFile = resumeCopy.personal_info?.imageFile;
      
      // Clean up temp properties
      if (resumeCopy.personal_info) {
        const cleanPersonalInfo = { ...resumeCopy.personal_info };
        delete cleanPersonalInfo.imageFile;
        resumeCopy.personal_info = cleanPersonalInfo;
      }

      formData.append('resumeData', JSON.stringify(resumeCopy));
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await apiFetch(`/api/resumes/update/${resumeId}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save resume');
      
      setResume(data.resume);
      if (data.resume.personal_info?.image) {
        setAvatarPreview(data.resume.personal_info.image);
      }
      
      if (!silent) showToast('Resume saved successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Cosmetic change auto-saves
  const handleTemplateOrColorChange = async (key, val) => {
    setResume((prev) => {
      const updated = { ...prev, [key]: val };
      setTimeout(() => handleSave(true), 100);
      return updated;
    });
  };

  // Inline AI suggestions
  const handleAiSummary = async () => {
    const currentSummary = resume.professional_summary;
    if (!currentSummary.trim()) {
      showToast('Please type a draft professional summary first for the AI to enhance.', 'warning');
      return;
    }
    setAiLoading(prev => ({ ...prev, summary: true }));
    try {
      const res = await apiFetch('/api/ai/enhance-pro-sum', {
        method: 'POST',
        body: JSON.stringify({ userContent: currentSummary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'AI request failed');
      
      updateField(null, 'professional_summary', data.enhancedContent);
      showToast('Professional summary enhanced by AI!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAiLoading(prev => ({ ...prev, summary: false }));
    }
  };

  const handleAiSuggestSkills = async () => {
    const profession = resume.personal_info?.profession;
    if (!profession || !profession.trim()) {
      showToast('Please specify your Profession in the Personal Information section first.', 'warning');
      return;
    }
    setAiLoading(prev => ({ ...prev, skills: true }));
    try {
      const res = await apiFetch('/api/ai/suggest-skills', {
        method: 'POST',
        body: JSON.stringify({ profession }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'AI request failed');
      
      setSuggestedSkills(data.skills || []);
      showToast('Skills suggested! Click on suggested skills to add them.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAiLoading(prev => ({ ...prev, skills: false }));
    }
  };

  const handleAiJobDescription = async (index) => {
    const currentDesc = resume.experience[index]?.description;
    if (!currentDesc || !currentDesc.trim()) {
      showToast('Please write a basic description of your work responsibilities first.', 'warning');
      return;
    }
    
    setAiLoading(prev => ({ 
      ...prev, 
      experience: { ...prev.experience, [index]: true } 
    }));
    
    try {
      const res = await apiFetch('/api/ai/enhance-job-description', {
        method: 'POST',
        body: JSON.stringify({ userContent: currentDesc }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'AI request failed');
      
      const updatedExp = [...resume.experience];
      updatedExp[index].description = data.enhancedContent;
      updateField(null, 'experience', updatedExp);
      showToast('Job description optimized by AI!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAiLoading(prev => ({ 
        ...prev, 
        experience: { ...prev.experience, [index]: false } 
      }));
    }
  };

  // Array updates
  const addExperience = () => updateField(null, 'experience', [...resume.experience, { company: '', position: '', start_date: '', end_date: '', description: '' }]);
  const removeExperience = (idx) => updateField(null, 'experience', resume.experience.filter((_, i) => i !== idx));
  const changeExperience = (idx, f, v) => {
    const list = [...resume.experience];
    list[idx][f] = v;
    updateField(null, 'experience', list);
  };

  const addProject = () => updateField(null, 'projects', [...resume.projects, { name: '', description: '', link: '' }]);
  const removeProject = (idx) => updateField(null, 'projects', resume.projects.filter((_, i) => i !== idx));
  const changeProject = (idx, f, v) => {
    const list = [...resume.projects];
    list[idx][f] = v;
    updateField(null, 'projects', list);
  };

  const addEducation = () => updateField(null, 'education', [...resume.education, { institution: '', degree: '', field_of_study: '', graduation_date: '', gpa: '' }]);
  const removeEducation = (idx) => updateField(null, 'education', resume.education.filter((_, i) => i !== idx));
  const changeEducation = (idx, f, v) => {
    const list = [...resume.education];
    list[idx][f] = v;
    updateField(null, 'education', list);
  };

  const addCertification = () => updateField(null, 'certifications', [...resume.certifications, { name: '', issuer: '', date: '' }]);
  const removeCertification = (idx) => updateField(null, 'certifications', resume.certifications.filter((_, i) => i !== idx));
  const changeCertification = (idx, f, v) => {
    const list = [...resume.certifications];
    list[idx][f] = v;
    updateField(null, 'certifications', list);
  };

  const addLanguage = () => updateField(null, 'languages', [...resume.languages, { name: '', proficiency: '' }]);
  const removeLanguage = (idx) => updateField(null, 'languages', resume.languages.filter((_, i) => i !== idx));
  const changeLanguage = (idx, f, v) => {
    const list = [...resume.languages];
    list[idx][f] = v;
    updateField(null, 'languages', list);
  };

  const addSkillTag = (tag) => {
    const val = tag.trim();
    if (val && !resume.skills.includes(val)) {
      updateField(null, 'skills', [...resume.skills, val]);
    }
  };
  const removeSkillTag = (tag) => updateField(null, 'skills', resume.skills.filter(s => s !== tag));

  const addInterestTag = (tag) => {
    const val = tag.trim();
    if (val && !resume.interests.includes(val)) {
      updateField(null, 'interests', [...resume.interests, val]);
    }
  };
  const removeInterestTag = (tag) => updateField(null, 'interests', resume.interests.filter(i => i !== tag));

  const toggleAccordion = (section) => setActiveSection(activeSection === section ? '' : section);

  // ==========================================
  // SIDEBAR DRAWER EVENT HANDLERS
  // ==========================================
  
  const handleAtsScore = async () => {
    setLoadingAts(true);
    try {
      const res = await apiFetch('/api/ai/analyze-ats', {
        method: 'POST',
        body: JSON.stringify({ resumeData: resume })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'ATS analysis failed');
      setAtsScoreData(data);
      showToast('ATS evaluation completed!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingAts(false);
    }
  };

  const handleJobMatch = async () => {
    if (!jobDescription.trim()) {
      showToast('Please paste a job description first', 'warning');
      return;
    }
    setLoadingJobMatch(true);
    try {
      const res = await apiFetch('/api/ai/job-match', {
        method: 'POST',
        body: JSON.stringify({ resumeData: resume, jobDescription })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Job match analysis failed');
      setJobMatchData(data);
      showToast('Job fit analysis completed!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingJobMatch(false);
    }
  };

  const handleCoverLetter = async () => {
    setLoadingLetter(true);
    try {
      const res = await apiFetch('/api/ai/cover-letter', {
        method: 'POST',
        body: JSON.stringify({ resumeData: resume, jobDescription, tone: coverTone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cover letter generation failed');
      setGeneratedLetter(data.coverLetter);
      showToast('Cover letter drafted by AI!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingLetter(false);
    }
  };

  const handleInterviewCoach = async () => {
    setLoadingInterview(true);
    try {
      const res = await apiFetch('/api/ai/interview-coach', {
        method: 'POST',
        body: JSON.stringify({ resumeData: resume })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Interview coaching failed');
      setInterviewPrep(data.questions || []);
      showToast('Tailored interview guide ready!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingInterview(false);
    }
  };

  const handleLinkedInOptimize = async () => {
    setLoadingLinkedIn(true);
    try {
      const res = await apiFetch('/api/ai/linkedin', {
        method: 'POST',
        body: JSON.stringify({ resumeData: resume })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'LinkedIn optimization failed');
      setLinkedInOptimized(data);
      showToast('LinkedIn updates ready!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingLinkedIn(false);
    }
  };

  const handleResumeRoast = async () => {
    setLoadingRoast(true);
    try {
      const res = await apiFetch('/api/ai/roast', {
        method: 'POST',
        body: JSON.stringify({ resumeData: resume })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Roast failed');
      setRoastData(data);
      showToast('Resume roasted by AI recruiter!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingRoast(false);
    }
  };

  const handleEnhanceAchievement = async () => {
    if (!bulletDraft.trim()) {
      showToast('Please type a draft phrase first', 'warning');
      return;
    }
    setLoadingBullets(true);
    try {
      const res = await apiFetch('/api/ai/enhance-achievements', {
        method: 'POST',
        body: JSON.stringify({ text: bulletDraft })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Enhancement failed');
      setEnhancedBullets(data.bullets || []);
      showToast('Achievements enhanced by AI!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingBullets(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  const downloadTextFile = (text, filename) => {
    const element = document.createElement('a');
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-500 animate-bounce mb-4">
          <FileText size={24} />
        </div>
        <p className="text-slate-500 font-semibold animate-pulse">Loading builder...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 flex flex-col relative">
      
      {/* Sticky top Action Bar */}
      <div className="no-print sticky top-[64px] z-30 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app')}
            className="p-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 transition cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <input
              type="text"
              value={resume.title}
              onChange={(e) => updateField(null, 'title', e.target.value)}
              className="text-lg font-bold text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-orange-500 outline-none px-1 transition w-48 sm:w-64"
            />
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {/* Public Toggle */}
          <button
            onClick={() => handleTemplateOrColorChange('public', !resume.public)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
              resume.public 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-slate-50 border-slate-200 text-slate-650'
            }`}
          >
            {resume.public ? <Globe size={14} /> : <Lock size={14} />}
            {resume.public ? 'Public Link On' : 'Private'}
          </button>

          {/* Color picker */}
          <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1 bg-white">
            {['#f97316', '#3b82f6', '#10b981', '#6366f1', '#ec4899', '#475569'].map((c) => (
              <button
                key={c}
                onClick={() => handleTemplateOrColorChange('accent_color', c)}
                className={`w-5 h-5 rounded-full border transition-transform cursor-pointer hover:scale-110 ${
                  resume.accent_color === c ? 'border-slate-800 scale-105' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Template Select */}
          <select
            value={resume.template}
            onChange={(e) => handleTemplateOrColorChange('template', e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-orange-500 bg-white text-slate-700"
          >
            <option value="Classic">Classic Template</option>
            <option value="Modern">Modern Template</option>
            <option value="Professional">Professional Template</option>
            <option value="Creative">Creative Template</option>
          </select>

          {/* Print PDF */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
          >
            <Printer size={14} />
            Print / PDF
          </button>
          
          {/* Save Resume */}
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-750 disabled:opacity-50 active:scale-95 text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Save Draft
          </button>

          {/* AI Drawer Trigger */}
          <button
            onClick={() => {
              setIsAiDrawerOpen(true);
              handleAtsScore(); // Trigger ATS scorer on open
            }}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white active:scale-95 text-xs font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-orange-500/10 cursor-pointer"
          >
            <Sparkles size={14} />
            AI Career Assistant
          </button>
        </div>
      </div>

      {/* Main split screens */}
      <div className="flex-1 grid lg:grid-cols-2 gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        {/* Left Form Panel */}
        <div className="no-print space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
          
          {/* Personal Info */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('personal')}
              className="w-full flex items-center justify-between px-5 py-4 font-bold text-slate-800 text-sm hover:bg-slate-50 transition"
            >
              <span className="flex items-center gap-2">
                <User size={18} className="text-orange-500" />
                Personal Information
              </span>
              {activeSection === 'personal' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {activeSection === 'personal' && (
              <div className="p-5 border-t border-slate-100 space-y-4 animate-fade-in">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl">
                  <div className="w-16 h-16 rounded-full border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-slate-400" size={24} />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-slate-700">Profile Image</p>
                    <label className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-650 hover:border-orange-500 cursor-pointer shadow-sm">
                      <Upload size={12} />
                      Choose File
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={resume.personal_info?.full_name || ''}
                      onChange={(e) => updateField('personal_info', 'full_name', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-slate-50/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Profession Title</label>
                    <input
                      type="text"
                      placeholder="Senior React Developer"
                      value={resume.personal_info?.profession || ''}
                      onChange={(e) => updateField('personal_info', 'profession', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-slate-50/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      placeholder="jane.doe@example.com"
                      value={resume.personal_info?.email || ''}
                      onChange={(e) => updateField('personal_info', 'email', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-slate-50/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 019-2834"
                      value={resume.personal_info?.phone || ''}
                      onChange={(e) => updateField('personal_info', 'phone', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-slate-50/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</label>
                    <input
                      type="text"
                      placeholder="San Francisco, CA"
                      value={resume.personal_info?.location || ''}
                      onChange={(e) => updateField('personal_info', 'location', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-slate-50/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">LinkedIn Profile Link</label>
                    <input
                      type="text"
                      placeholder="linkedin.com/in/janedoe"
                      value={resume.personal_info?.linkedin || ''}
                      onChange={(e) => updateField('personal_info', 'linkedin', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-slate-50/20"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Professional Summary */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('summary')}
              className="w-full flex items-center justify-between px-5 py-4 font-bold text-slate-800 text-sm hover:bg-slate-50 transition"
            >
              <span className="flex items-center gap-2">
                <FileText size={18} className="text-orange-500" />
                Professional Summary
              </span>
              {activeSection === 'summary' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {activeSection === 'summary' && (
              <div className="p-5 border-t border-slate-100 space-y-3 animate-fade-in">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Summary Statement</label>
                  <button
                    type="button"
                    onClick={handleAiSummary}
                    disabled={aiLoading.summary}
                    className="flex items-center gap-1 text-[10px] font-bold bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-100 px-2.5 py-1.5 rounded-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {aiLoading.summary ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    AI Enhance summary
                  </button>
                </div>
                <textarea
                  rows="4"
                  placeholder="Write a summary highlighting skills and experiences..."
                  value={resume.professional_summary || ''}
                  onChange={(e) => updateField(null, 'professional_summary', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm text-slate-855 bg-slate-55"
                />
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('skills')}
              className="w-full flex items-center justify-between px-5 py-4 font-bold text-slate-800 text-sm hover:bg-slate-50 transition"
            >
              <span className="flex items-center gap-2">
                <Code size={18} className="text-orange-500" />
                Skills
              </span>
              {activeSection === 'skills' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {activeSection === 'skills' && (
              <div className="p-5 border-t border-slate-100 space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Add Skills</label>
                  <button
                    type="button"
                    onClick={handleAiSuggestSkills}
                    disabled={aiLoading.skills}
                    className="flex items-center gap-1 text-[10px] font-bold bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-100 px-2.5 py-1.5 rounded-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {aiLoading.skills ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    AI Suggest skills
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type skill and press Enter"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newSkill.trim()) {
                          addSkillTag(newSkill);
                          setNewSkill('');
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSkill.trim()) {
                        addSkillTag(newSkill);
                        setNewSkill('');
                      }
                    }}
                    className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {suggestedSkills.length > 0 && (
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested AI Skills (Click to add):</p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedSkills.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            addSkillTag(s);
                            setSuggestedSkills(prev => prev.filter(item => item !== s));
                          }}
                          className="text-[10px] font-semibold bg-white hover:bg-orange-50 hover:text-orange-600 border px-2 py-1 rounded-lg transition"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {resume.skills.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No skills added yet.</p>
                  ) : (
                    resume.skills.map((s, idx) => (
                      <span key={idx} className="flex items-center gap-1 text-xs bg-orange-50/50 text-slate-700 border border-orange-100 px-3 py-1 rounded-lg font-medium">
                        {s}
                        <button
                          type="button"
                          onClick={() => removeSkillTag(s)}
                          className="text-slate-400 hover:text-slate-650 font-bold ml-1 text-[10px]"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('experience')}
              className="w-full flex items-center justify-between px-5 py-4 font-bold text-slate-800 text-sm hover:bg-slate-50 transition"
            >
              <span className="flex items-center gap-2">
                <Briefcase size={18} className="text-orange-500" />
                Work Experience
              </span>
              {activeSection === 'experience' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {activeSection === 'experience' && (
              <div className="p-5 border-t border-slate-100 space-y-6 animate-fade-in">
                {resume.experience.map((exp, index) => (
                  <div key={index} className="border border-slate-200/70 rounded-xl p-4 space-y-3.5 relative bg-slate-50/20">
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 rounded transition hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>

                    <h4 className="text-xs font-bold text-orange-650 uppercase tracking-wider">Entry #{index + 1}</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company</label>
                        <input
                          type="text"
                          placeholder="e.g. Google"
                          value={exp.company}
                          onChange={(e) => changeExperience(index, 'company', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Position</label>
                        <input
                          type="text"
                          placeholder="e.g. Software Engineer"
                          value={exp.position}
                          onChange={(e) => changeExperience(index, 'position', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
                        <input
                          type="text"
                          placeholder="Jan 2021"
                          value={exp.start_date}
                          onChange={(e) => changeExperience(index, 'start_date', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</label>
                        <input
                          type="text"
                          placeholder="Present"
                          value={exp.end_date}
                          onChange={(e) => changeExperience(index, 'end_date', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Description</label>
                        <button
                          type="button"
                          onClick={() => handleAiJobDescription(index)}
                          disabled={aiLoading.experience[index]}
                          className="flex items-center gap-1 text-[9px] font-bold bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-100 px-2 py-1 rounded-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {aiLoading.experience[index] ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />}
                          AI Enhance
                        </button>
                      </div>
                      <textarea
                        rows="3"
                        placeholder="Detail achievements and roles..."
                        value={exp.description}
                        onChange={(e) => changeExperience(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addExperience}
                  className="w-full flex items-center justify-center gap-1 border-2 border-dashed border-slate-200 hover:border-orange-500 hover:text-orange-600 rounded-xl p-3.5 transition text-xs font-semibold text-slate-500 cursor-pointer bg-slate-50/30"
                >
                  <Plus size={14} />
                  Add Work Experience
                </button>
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('projects')}
              className="w-full flex items-center justify-between px-5 py-4 font-bold text-slate-800 text-sm hover:bg-slate-50 transition"
            >
              <span className="flex items-center gap-2">
                <Code size={18} className="text-orange-500" />
                Projects
              </span>
              {activeSection === 'projects' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {activeSection === 'projects' && (
              <div className="p-5 border-t border-slate-100 space-y-6 animate-fade-in">
                {resume.projects.map((proj, index) => (
                  <div key={index} className="border border-slate-200/70 rounded-xl p-4 space-y-3.5 relative bg-slate-50/20">
                    <button
                      type="button"
                      onClick={() => removeProject(index)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 rounded transition hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>

                    <h4 className="text-xs font-bold text-orange-650 uppercase tracking-wider">Project #{index + 1}</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Portfolio Builder"
                          value={proj.name}
                          onChange={(e) => changeProject(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Link</label>
                        <input
                          type="text"
                          placeholder="https://github.com/..."
                          value={proj.link}
                          onChange={(e) => changeProject(index, 'link', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                      <textarea
                        rows="2"
                        placeholder="Detail tools and project features..."
                        value={proj.description}
                        onChange={(e) => changeProject(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addProject}
                  className="w-full flex items-center justify-center gap-1 border-2 border-dashed border-slate-200 hover:border-orange-500 hover:text-orange-600 rounded-xl p-3.5 transition text-xs font-semibold text-slate-500 cursor-pointer bg-slate-50/30"
                >
                  <Plus size={14} />
                  Add Project
                </button>
              </div>
            )}
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('education')}
              className="w-full flex items-center justify-between px-5 py-4 font-bold text-slate-800 text-sm hover:bg-slate-50 transition"
            >
              <span className="flex items-center gap-2">
                <GraduationCap size={18} className="text-orange-500" />
                Education
              </span>
              {activeSection === 'education' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {activeSection === 'education' && (
              <div className="p-5 border-t border-slate-100 space-y-6 animate-fade-in">
                {resume.education.map((edu, index) => (
                  <div key={index} className="border border-slate-200/70 rounded-xl p-4 space-y-3.5 relative bg-slate-50/20">
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 rounded transition hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>

                    <h4 className="text-xs font-bold text-orange-650 uppercase tracking-wider">Education #{index + 1}</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Institution</label>
                        <input
                          type="text"
                          placeholder="Stanford"
                          value={edu.institution}
                          onChange={(e) => changeEducation(index, 'institution', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Degree</label>
                        <input
                          type="text"
                          placeholder="Bachelor of Science"
                          value={edu.degree}
                          onChange={(e) => changeEducation(index, 'degree', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Field of Study</label>
                        <input
                          type="text"
                          placeholder="Computer Science"
                          value={edu.field_of_study}
                          onChange={(e) => changeEducation(index, 'field_of_study', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Graduation Date</label>
                        <input
                          type="text"
                          placeholder="May 2020"
                          value={edu.graduation_date}
                          onChange={(e) => changeEducation(index, 'graduation_date', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">GPA</label>
                        <input
                          type="text"
                          placeholder="3.8 / 4.0"
                          value={edu.gpa}
                          onChange={(e) => changeEducation(index, 'gpa', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addEducation}
                  className="w-full flex items-center justify-center gap-1 border-2 border-dashed border-slate-200 hover:border-orange-500 hover:text-orange-600 rounded-xl p-3.5 transition text-xs font-semibold text-slate-500 cursor-pointer bg-slate-50/30"
                >
                  <Plus size={14} />
                  Add Education
                </button>
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('certifications')}
              className="w-full flex items-center justify-between px-5 py-4 font-bold text-slate-800 text-sm hover:bg-slate-50 transition"
            >
              <span className="flex items-center gap-2">
                <Award size={18} className="text-orange-500" />
                Certifications
              </span>
              {activeSection === 'certifications' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {activeSection === 'certifications' && (
              <div className="p-5 border-t border-slate-100 space-y-6 animate-fade-in">
                {resume.certifications?.map((cert, index) => (
                  <div key={index} className="border border-slate-200/70 rounded-xl p-4 space-y-3.5 relative bg-slate-50/20">
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 rounded transition hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>

                    <h4 className="text-xs font-bold text-orange-650 uppercase tracking-wider">Certification #{index + 1}</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</label>
                        <input
                          type="text"
                          placeholder="AWS Solutions Architect"
                          value={cert.name}
                          onChange={(e) => changeCertification(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</label>
                        <input
                          type="text"
                          placeholder="Oct 2023"
                          value={cert.date}
                          onChange={(e) => changeCertification(index, 'date', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issuer</label>
                        <input
                          type="text"
                          placeholder="Amazon Web Services"
                          value={cert.issuer}
                          onChange={(e) => changeCertification(index, 'issuer', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addCertification}
                  className="w-full flex items-center justify-center gap-1 border-2 border-dashed border-slate-200 hover:border-orange-500 hover:text-orange-600 rounded-xl p-3.5 transition text-xs font-semibold text-slate-500 cursor-pointer bg-slate-50/30"
                >
                  <Plus size={14} />
                  Add Certification
                </button>
              </div>
            )}
          </div>

          {/* Languages */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('languages')}
              className="w-full flex items-center justify-between px-5 py-4 font-bold text-slate-800 text-sm hover:bg-slate-50 transition"
            >
              <span className="flex items-center gap-2">
                <Globe2 size={18} className="text-orange-500" />
                Languages
              </span>
              {activeSection === 'languages' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {activeSection === 'languages' && (
              <div className="p-5 border-t border-slate-100 space-y-6 animate-fade-in">
                {resume.languages?.map((lang, index) => (
                  <div key={index} className="border border-slate-200/70 rounded-xl p-4 space-y-3.5 relative bg-slate-50/20">
                    <button
                      type="button"
                      onClick={() => removeLanguage(index)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 rounded transition hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Language</label>
                        <input
                          type="text"
                          placeholder="Spanish"
                          value={lang.name}
                          onChange={(e) => changeLanguage(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Proficiency</label>
                        <input
                          type="text"
                          placeholder="Fluent"
                          value={lang.proficiency}
                          onChange={(e) => changeLanguage(index, 'proficiency', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addLanguage}
                  className="w-full flex items-center justify-center gap-1 border-2 border-dashed border-slate-200 hover:border-orange-500 hover:text-orange-600 rounded-xl p-3.5 transition text-xs font-semibold text-slate-500 cursor-pointer bg-slate-50/30"
                >
                  <Plus size={14} />
                  Add Language
                </button>
              </div>
            )}
          </div>

          {/* Interests */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('interests')}
              className="w-full flex items-center justify-between px-5 py-4 font-bold text-slate-800 text-sm hover:bg-slate-50 transition"
            >
              <span className="flex items-center gap-2">
                <Heart size={18} className="text-orange-500" />
                Interests
              </span>
              {activeSection === 'interests' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {activeSection === 'interests' && (
              <div className="p-5 border-t border-slate-100 space-y-4 animate-fade-in">
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Add Interests</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Photography, Hiking"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newInterest.trim()) {
                          addInterestTag(newInterest);
                          setNewInterest('');
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newInterest.trim()) {
                        addInterestTag(newInterest);
                        setNewInterest('');
                      }
                    }}
                    className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {resume.interests?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No interests added yet.</p>
                  ) : (
                    resume.interests?.map((item, idx) => (
                      <span key={idx} className="flex items-center gap-1 text-xs bg-slate-50 text-slate-650 border px-2.5 py-0.5 rounded-lg">
                        {item}
                        <button
                          type="button"
                          onClick={() => removeInterestTag(item)}
                          className="text-slate-450 hover:text-slate-600 font-bold ml-1 text-[10px]"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="bg-slate-700/5 rounded-3xl border border-slate-200/50 p-4 sm:p-5 flex flex-col h-[calc(100vh-200px)] overflow-hidden shadow-inner">
          <div className="no-print flex justify-between items-center mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Real-time Preview Pane (A4 Ratio)
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">Scale to fit screen</span>
          </div>

          <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden relative">
            <ResumeTemplates 
              templateName={resume.template} 
              data={resume} 
              accentColor={resume.accent_color} 
            />
          </div>
        </div>
      </div>

      {/* ==========================================
          AI CAREER ASSISTANT DRAWER
          ========================================== */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm no-print animate-fade-in">
          
          {/* Backdrop Click Closer */}
          <div className="absolute inset-0" onClick={() => setIsAiDrawerOpen(false)} />
          
          {/* Drawer Box */}
          <div className="w-full max-w-md bg-white h-screen shadow-2xl relative z-10 flex flex-col animate-scale-up border-l border-slate-100">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-md flex items-center gap-1.5">
                  <Sparkles className="text-orange-500" size={18} />
                  AI Career Assistant
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Optimize your career path in real time</p>
              </div>
              <button
                onClick={() => setIsAiDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Horizontal tool selectors */}
            <div className="px-4 py-2 border-b border-slate-50 bg-slate-50/50 flex overflow-x-auto gap-1 shrink-0 no-scrollbar">
              {[
                { id: 'ats', name: 'ATS & Fit' },
                { id: 'cover', name: 'Cover Letter' },
                { id: 'coach', name: 'Interview' },
                { id: 'roast', name: 'Roast Mode' },
                { id: 'linkedin', name: 'LinkedIn' },
                { id: 'enhance', name: 'Bullet Enhancer' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAiTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition cursor-pointer ${
                    aiTab === tab.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-650 hover:bg-slate-100'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* ATS SCORE & JOB FIT */}
              {aiTab === 'ats' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* ATS scorer section */}
                  <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">Overall ATS Score</span>
                      <button
                        onClick={handleAtsScore}
                        disabled={loadingAts}
                        className="text-[10px] font-bold text-orange-650 bg-orange-50 hover:bg-orange-100 border border-orange-100 px-2 py-1 rounded-lg transition"
                      >
                        {loadingAts ? 'Analyzing...' : 'Scan Score'}
                      </button>
                    </div>

                    {loadingAts ? (
                      <div className="py-6 text-center space-y-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent mx-auto"></div>
                        <p className="text-[10px] text-slate-400">Reviewing details...</p>
                      </div>
                    ) : atsScoreData ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-black text-slate-800">{atsScoreData.score}/100</span>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                            {atsScoreData.score > 80 ? 'Good Fit' : 'Requires Work'}
                          </span>
                        </div>

                        {atsScoreData.missingKeywords?.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Missing Keywords</span>
                            <div className="flex flex-wrap gap-1">
                              {atsScoreData.missingKeywords.map((k, i) => (
                                <span key={i} className="text-[10px] bg-rose-50 text-rose-650 border border-rose-100 px-2 py-0.5 rounded font-semibold">{k}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {atsScoreData.suggestions?.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggestions for Improvement</span>
                            <div className="space-y-2">
                              {atsScoreData.suggestions.map((s, i) => (
                                <div key={i} className="text-xs space-y-0.5">
                                  <strong className="text-slate-800 block text-[11px]">{s.section} section:</strong>
                                  <p className="text-slate-500 text-[11px] leading-relaxed">{s.recommendation}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-2">Click Scan to evaluate your resume structure.</p>
                    )}
                  </div>

                  {/* Job Match segment */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-800 block">Job Description Compatibility Matcher</span>
                    <textarea
                      rows="4"
                      placeholder="Paste the target Job Description description details here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 text-xs text-slate-800 bg-slate-50/20 leading-relaxed font-sans"
                    />
                    
                    <button
                      onClick={handleJobMatch}
                      disabled={loadingJobMatch}
                      className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-white py-2 rounded-xl text-xs font-bold transition active:scale-95"
                    >
                      {loadingJobMatch ? 'Comparing...' : 'Analyze Compatibility Match'}
                    </button>

                    {loadingJobMatch ? (
                      <div className="py-6 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent mx-auto"></div>
                      </div>
                    ) : jobMatchData ? (
                      <div className="space-y-4 pt-3 border-t border-slate-100">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>Job Match Fit</span>
                            <span>{jobMatchData.matchPercentage}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${jobMatchData.matchPercentage}%` }} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Matching Skills</span>
                            <div className="flex flex-wrap gap-1">
                              {jobMatchData.matchingSkills?.map((s, i) => (
                                <span key={i} className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-semibold">{s}</span>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Missing / Recommended</span>
                            <div className="flex flex-wrap gap-1">
                              {jobMatchData.missingSkills?.map((s, i) => (
                                <span key={i} className="text-[9px] bg-rose-50 text-rose-700 border border-rose-100 px-1.5 py-0.5 rounded font-bold">+ {s}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {jobMatchData.recommendations?.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Key Adjustments</span>
                            <ul className="list-disc pl-4 text-slate-500 text-[11px] space-y-1 leading-relaxed">
                              {jobMatchData.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                </div>
              )}

              {/* COVER LETTER GENERATOR */}
              {aiTab === 'cover' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Paste Job Details (Optional)</label>
                    <textarea
                      rows="4"
                      placeholder="Paste target job descriptions to tailor the cover letter..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 text-xs bg-slate-50/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Tone</label>
                      <select
                        value={coverTone}
                        onChange={(e) => setCoverTone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-orange-500 bg-white"
                      >
                        <option value="Professional">Professional</option>
                        <option value="Confident">Confident / Authoritative</option>
                        <option value="Enthusiastic">Enthusiastic</option>
                      </select>
                    </div>

                    <button
                      onClick={handleCoverLetter}
                      disabled={loadingLetter}
                      className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 py-2.5 rounded-xl text-xs font-bold transition active:scale-95 self-end"
                    >
                      {loadingLetter ? 'Drafting...' : 'Generate Letter'}
                    </button>
                  </div>

                  {loadingLetter ? (
                    <div className="py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent mx-auto"></div>
                      <p className="text-[11px] text-slate-400 mt-2">Drafting letter structure...</p>
                    </div>
                  ) : generatedLetter ? (
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800">Drafted Output</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyText(generatedLetter)}
                            className="p-1.5 text-slate-550 border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm"
                            title="Copy to clipboard"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            onClick={() => downloadTextFile(generatedLetter, 'Cover_Letter.txt')}
                            className="p-1.5 text-slate-550 border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm"
                            title="Download text file"
                          >
                            <DownloadIcon size={13} />
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows="12"
                        value={generatedLetter}
                        onChange={(e) => setGeneratedLetter(e.target.value)}
                        className="w-full p-4 border border-slate-200 rounded-2xl text-xs bg-slate-50 font-serif leading-relaxed text-slate-700"
                      />
                    </div>
                  ) : null}
                </div>
              )}

              {/* INTERVIEW COACH */}
              {aiTab === 'coach' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl space-y-2 text-orange-800 text-xs">
                    <MessageSquare size={16} className="text-orange-600" />
                    <p className="font-semibold">Interactive Mock Preparation</p>
                    <p className="text-[11px] text-orange-700 leading-relaxed">
                      AI analyzes your projects, experiences, and languages to generate customized technical, scenario, and HR questions.
                    </p>
                  </div>

                  <button
                    onClick={handleInterviewCoach}
                    disabled={loadingInterview}
                    className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-white py-2.5 rounded-xl text-xs font-bold transition"
                  >
                    {loadingInterview ? 'Drafting Coach Guide...' : 'Generate custom Interview Q&A'}
                  </button>

                  {loadingInterview ? (
                    <div className="py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent mx-auto"></div>
                    </div>
                  ) : interviewPrep ? (
                    <div className="space-y-3">
                      {interviewPrep.map((q, idx) => {
                        const isExpanded = expandedInterviewQuestion === idx;
                        
                        return (
                          <div key={idx} className="border border-slate-200/60 rounded-2xl overflow-hidden bg-white shadow-sm">
                            <button
                              onClick={() => setExpandedInterviewQuestion(isExpanded ? null : idx)}
                              className="w-full flex justify-between items-start p-4 text-left hover:bg-slate-50/50 transition"
                            >
                              <div className="space-y-1">
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                  q.category === 'Technical' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                                }`}>
                                  {q.category}
                                </span>
                                <h4 className="text-xs font-bold text-slate-800 leading-relaxed">{q.question}</h4>
                              </div>
                              {isExpanded ? <ChevronUp size={14} className="shrink-0 mt-1" /> : <ChevronDown size={14} className="shrink-0 mt-1" />}
                            </button>
                            
                            {isExpanded && (
                              <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 animate-fade-in text-xs">
                                <div className="space-y-1">
                                  <strong className="text-slate-800 text-[10px] uppercase font-bold tracking-wider block">Recommended Response</strong>
                                  <p className="text-slate-650 leading-relaxed text-[11px] whitespace-pre-wrap">{q.sampleAnswer}</p>
                                </div>
                                <div className="space-y-1 border-t border-slate-100 pt-2.5">
                                  <strong className="text-slate-800 text-[10px] uppercase font-bold tracking-wider block">Prep & Focus Tips</strong>
                                  <p className="text-slate-500 leading-relaxed text-[11px]">{q.tips}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              )}

              {/* ROAST MODE */}
              {aiTab === 'roast' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-red-50 border border-red-100 p-4 rounded-2xl space-y-2 text-red-800 text-xs">
                    <Flame size={16} className="text-red-600 animate-bounce" />
                    <p className="font-bold">Brutally Honest Recruiter Mode</p>
                    <p className="text-[11px] text-red-700 leading-relaxed">
                      Warning: Our AI acts as a cynical headhunter. It will find formatting issues, buzzwords, and gaps and point them out.
                    </p>
                  </div>

                  <button
                    onClick={handleResumeRoast}
                    disabled={loadingRoast}
                    className="w-full bg-red-600 hover:bg-red-750 text-white py-2.5 rounded-xl text-xs font-bold transition active:scale-95"
                  >
                    {loadingRoast ? 'Roasting...' : 'Roast My Resume'}
                  </button>

                  {loadingRoast ? (
                    <div className="py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent mx-auto"></div>
                      <p className="text-xs text-slate-400 mt-2 font-mono">Critiquing margins...</p>
                    </div>
                  ) : roastData ? (
                    <div className="space-y-4">
                      {/* Critique paragraph */}
                      <div className="bg-stone-900 text-stone-200 p-4 rounded-2xl text-xs font-serif leading-relaxed italic border-l-4 border-red-650 shadow-inner">
                        "{roastData.roast}"
                      </div>

                      {/* Weak points */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Critical Fixes Recommended</span>
                        {roastData.weakpoints?.map((wp, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                            <span className="text-xs font-bold text-slate-800 block uppercase tracking-wider">{wp.area}</span>
                            <p className="text-[11px] text-red-600 font-medium leading-relaxed">Critique: {wp.critique}</p>
                            <p className="text-[11px] text-emerald-650 font-bold leading-relaxed">Action: {wp.fix}</p>
                          </div>
                        ))}
                      </div>

                      {/* Encouraging signoff */}
                      <p className="text-xs text-slate-500 font-bold italic text-center">
                        {roastData.encouragement}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* LINKEDIN OPTIMIZER */}
              {aiTab === 'linkedin' && (
                <div className="space-y-4 animate-fade-in">
                  <button
                    onClick={handleLinkedInOptimize}
                    disabled={loadingLinkedIn}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition"
                  >
                    {loadingLinkedIn ? 'Optimizing profile...' : 'Generate LinkedIn Profile Assets'}
                  </button>

                  {loadingLinkedIn ? (
                    <div className="py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                    </div>
                  ) : linkedInOptimized ? (
                    <div className="space-y-5">
                      
                      {/* Headline suggestions */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">LinkedIn Headline Alternatives</span>
                        {linkedInOptimized.headlines?.map((h, i) => (
                          <div key={i} className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                            <p className="flex-1 text-slate-700 font-semibold">{h}</p>
                            <button
                              onClick={() => copyText(h)}
                              className="p-1 hover:bg-white border hover:border-slate-200 rounded text-slate-400 hover:text-slate-600 transition shrink-0"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* About summary */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LinkedIn "About" Summary</span>
                          <button
                            onClick={() => copyText(linkedInOptimized.about)}
                            className="p-1 text-slate-500 hover:text-slate-700 border rounded hover:bg-slate-50 transition"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <textarea
                          rows="6"
                          readOnly
                          value={linkedInOptimized.about}
                          className="w-full p-4 border border-slate-200 rounded-2xl text-xs bg-slate-50 font-sans leading-relaxed text-slate-650"
                        />
                      </div>

                      {/* General tips */}
                      {linkedInOptimized.suggestions?.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Profile Suggestions</span>
                          <ul className="list-disc pl-4 text-slate-500 text-[11px] space-y-1.5 leading-relaxed">
                            {linkedInOptimized.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              {/* ACHIEVEMENT ENHANCER */}
              {aiTab === 'enhance' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-650 block">Achievement Sentence Draft</label>
                    <textarea
                      rows="3"
                      placeholder="e.g. I worked on the React frontend and helped fix database speed issues."
                      value={bulletDraft}
                      onChange={(e) => setBulletDraft(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 text-xs bg-slate-50/20 leading-relaxed"
                    />
                  </div>

                  <button
                    onClick={handleEnhanceAchievement}
                    disabled={loadingBullets}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-white py-2.5 rounded-xl text-xs font-bold transition"
                  >
                    {loadingBullets ? 'Transforming...' : 'Enhance using STAR Method'}
                  </button>

                  {loadingBullets ? (
                    <div className="py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent mx-auto"></div>
                      <p className="text-[10px] text-slate-400 mt-2">Computing impact metrics...</p>
                    </div>
                  ) : enhancedBullets ? (
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Enhanced STAR Bullet points (Click to copy)</span>
                      {enhancedBullets.map((b, i) => (
                        <div
                          key={i}
                          onClick={() => copyText(b)}
                          className="group bg-slate-50 hover:bg-orange-50/10 border border-slate-150 hover:border-orange-200 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed cursor-pointer transition flex items-start gap-2.5 shadow-sm"
                        >
                          <span className="text-orange-500 font-bold shrink-0 mt-0.5">•</span>
                          <span className="flex-1 group-hover:text-slate-900 transition-colors">{b}</span>
                          <span className="text-[9px] font-bold text-slate-400 group-hover:text-orange-650 shrink-0 select-none uppercase tracking-wider self-end border border-transparent group-hover:border-orange-100 bg-white/40 px-1 rounded">Copy</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ResumeBuilder;