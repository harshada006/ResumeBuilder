import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ResumeTemplates from '../components/ResumeTemplates';
import { 
  ArrowLeft, Save, Printer, Eye, Lock, Globe, Sparkles, Plus, Trash2, 
  ChevronDown, ChevronUp, User, FileText, Briefcase, GraduationCap, 
  Code, Award, Globe2, Heart, Upload, RefreshCw
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
  
  // AI states
  const [aiLoading, setAiLoading] = useState({
    summary: false,
    skills: false,
    experience: {} // keys are index numbers
  });
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  
  // Temp tags
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

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

  // Auto-save debounced or effect-based on template/color updates
  const handleTemplateOrColorChange = async (key, val) => {
    setResume((prev) => {
      const updated = { ...prev, [key]: val };
      // Perform save immediately on cosmetic updates
      setTimeout(() => handleSave(true), 100);
      return updated;
    });
  };

  // ==========================================
  // AI CONTROLLER TRIGGERS
  // ==========================================

  // AI Enhance Professional Summary
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

  // AI Suggest Skills
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

  // AI Enhance Experience Job Description
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

  // ==========================================
  // ARRAY ITEMS HANDLING (Experience, Projects, etc)
  // ==========================================
  
  // Experience
  const addExperience = () => {
    const updated = [...resume.experience, { company: '', position: '', start_date: '', end_date: '', description: '' }];
    updateField(null, 'experience', updated);
  };
  const removeExperience = (index) => {
    const updated = resume.experience.filter((_, idx) => idx !== index);
    updateField(null, 'experience', updated);
  };
  const changeExperience = (index, field, value) => {
    const updated = [...resume.experience];
    updated[index][field] = value;
    updateField(null, 'experience', updated);
  };

  // Projects
  const addProject = () => {
    const updated = [...resume.projects, { name: '', description: '', link: '' }];
    updateField(null, 'projects', updated);
  };
  const removeProject = (index) => {
    const updated = resume.projects.filter((_, idx) => idx !== index);
    updateField(null, 'projects', updated);
  };
  const changeProject = (index, field, value) => {
    const updated = [...resume.projects];
    updated[index][field] = value;
    updateField(null, 'projects', updated);
  };

  // Education
  const addEducation = () => {
    const updated = [...resume.education, { institution: '', degree: '', field_of_study: '', graduation_date: '', gpa: '' }];
    updateField(null, 'education', updated);
  };
  const removeEducation = (index) => {
    const updated = resume.education.filter((_, idx) => idx !== index);
    updateField(null, 'education', updated);
  };
  const changeEducation = (index, field, value) => {
    const updated = [...resume.education];
    updated[index][field] = value;
    updateField(null, 'education', updated);
  };

  // Certifications
  const addCertification = () => {
    const updated = [...resume.certifications, { name: '', issuer: '', date: '' }];
    updateField(null, 'certifications', updated);
  };
  const removeCertification = (index) => {
    const updated = resume.certifications.filter((_, idx) => idx !== index);
    updateField(null, 'certifications', updated);
  };
  const changeCertification = (index, field, value) => {
    const updated = [...resume.certifications];
    updated[index][field] = value;
    updateField(null, 'certifications', updated);
  };

  // Languages
  const addLanguage = () => {
    const updated = [...resume.languages, { name: '', proficiency: '' }];
    updateField(null, 'languages', updated);
  };
  const removeLanguage = (index) => {
    const updated = resume.languages.filter((_, idx) => idx !== index);
    updateField(null, 'languages', updated);
  };
  const changeLanguage = (index, field, value) => {
    const updated = [...resume.languages];
    updated[index][field] = value;
    updateField(null, 'languages', updated);
  };

  // Skills Array tags
  const addSkillTag = (skillText) => {
    const cleaned = skillText.trim();
    if (cleaned && !resume.skills.includes(cleaned)) {
      updateField(null, 'skills', [...resume.skills, cleaned]);
    }
  };
  const removeSkillTag = (skillText) => {
    updateField(null, 'skills', resume.skills.filter(s => s !== skillText));
  };

  // Interests Array tags
  const addInterestTag = (interestText) => {
    const cleaned = interestText.trim();
    if (cleaned && !resume.interests.includes(cleaned)) {
      updateField(null, 'interests', [...resume.interests, cleaned]);
    }
  };
  const removeInterestTag = (interestText) => {
    updateField(null, 'interests', resume.interests.filter(i => i !== interestText));
  };

  // Switch sections helper
  const toggleAccordion = (section) => {
    setActiveSection(activeSection === section ? '' : section);
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
    <div className="min-h-[calc(100vh-65px)] bg-slate-55 flex flex-col">
      {/* Action Bar */}
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
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            {resume.public ? <Globe size={14} /> : <Lock size={14} />}
            {resume.public ? 'Public Link On' : 'Private'}
          </button>

          {/* Accent Color picker */}
          <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1 bg-white">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Color</span>
            {['#f97316', '#3b82f6', '#10b981', '#6366f1', '#ec4899', '#475569'].map((c) => (
              <button
                key={c}
                onClick={() => handleTemplateOrColorChange('accent_color', c)}
                className={`w-5 h-5 rounded-full border transition-transform cursor-pointer hover:scale-110 ${
                  resume.accent_color === c ? 'border-slate-800 scale-105 shadow-inner' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Template Selector */}
          <div className="flex items-center gap-1.5">
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
          </div>

          {/* Print & Save */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
          >
            <Printer size={14} />
            Print / PDF
          </button>
          
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
          >
            {saving ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save Resume
          </button>
        </div>
      </div>

      {/* Main split screens */}
      <div className="flex-1 grid lg:grid-cols-2 gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        {/* Left Form Panel */}
        <div className="no-print space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
          
          {/* Accordion 1: Personal Info */}
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
                {/* Photo Upload Row */}
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
                    <label className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:border-orange-500 cursor-pointer shadow-sm">
                      <Upload size={12} />
                      Choose File
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={resume.personal_info?.full_name || ''}
                      onChange={(e) => updateField('personal_info', 'full_name', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm text-slate-800 bg-slate-50/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Profession Title</label>
                    <input
                      type="text"
                      placeholder="Senior React Developer"
                      value={resume.personal_info?.profession || ''}
                      onChange={(e) => updateField('personal_info', 'profession', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm text-slate-800 bg-slate-50/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      placeholder="jane.doe@example.com"
                      value={resume.personal_info?.email || ''}
                      onChange={(e) => updateField('personal_info', 'email', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm text-slate-800 bg-slate-50/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 019-2834"
                      value={resume.personal_info?.phone || ''}
                      onChange={(e) => updateField('personal_info', 'phone', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm text-slate-800 bg-slate-50/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location (City, State/Country)</label>
                    <input
                      type="text"
                      placeholder="San Francisco, CA"
                      value={resume.personal_info?.location || ''}
                      onChange={(e) => updateField('personal_info', 'location', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm text-slate-800 bg-slate-50/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">LinkedIn Profile Link</label>
                    <input
                      type="text"
                      placeholder="linkedin.com/in/janedoe"
                      value={resume.personal_info?.linkedin || ''}
                      onChange={(e) => updateField('personal_info', 'linkedin', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm text-slate-800 bg-slate-50/20"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 2: Professional Summary */}
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
                    {aiLoading.summary ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    AI Enhance summary
                  </button>
                </div>
                <textarea
                  rows="4"
                  placeholder="Write a brief summary highlighting your key skills, years of experience, and career goals..."
                  value={resume.professional_summary || ''}
                  onChange={(e) => updateField(null, 'professional_summary', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm text-slate-800 leading-relaxed bg-slate-50/20"
                />
              </div>
            )}
          </div>

          {/* Accordion 3: Skills */}
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
                    {aiLoading.skills ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    AI Suggest skills
                  </button>
                </div>

                {/* Tag Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. JavaScript, AWS, System Design (Press Enter)"
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
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm text-slate-800"
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

                {/* Suggested skills board */}
                {suggestedSkills.length > 0 && (
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-2">
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

                {/* Active Skills tags list */}
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
                          className="text-slate-400 hover:text-slate-600 font-bold ml-1 text-[10px]"
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

          {/* Accordion 4: Work Experience */}
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
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 rounded transition hover:bg-rose-50 cursor-pointer animate-fade-in"
                      title="Remove experience entry"
                    >
                      <Trash2 size={15} />
                    </button>

                    <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider">Experience Entry #{index + 1}</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
                        <input
                          type="text"
                          placeholder="Google Inc"
                          value={exp.company}
                          onChange={(e) => changeExperience(index, 'company', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Position Title</label>
                        <input
                          type="text"
                          placeholder="Senior Software Engineer"
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
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date (or 'Present')</label>
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
                          {aiLoading.experience[index] ? (
                            <RefreshCw size={10} className="animate-spin" />
                          ) : (
                            <Sparkles size={10} />
                          )}
                          AI Optimize points
                        </button>
                      </div>
                      <textarea
                        rows="3"
                        placeholder="Detail your roles, projects, and achievements using action verbs. e.g. Led a team of 4 to deploy a React app, reducing load latency by 20%..."
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

          {/* Accordion 5: Projects */}
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

                    <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider">Project Entry #{index + 1}</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Name</label>
                        <input
                          type="text"
                          placeholder="AI Resume Builder"
                          value={proj.name}
                          onChange={(e) => changeProject(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Live/Github Link</label>
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
                        placeholder="Summarize the project technology stack and objectives..."
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

          {/* Accordion 6: Education */}
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

                    <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider">Education Entry #{index + 1}</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">School / Institution</label>
                        <input
                          type="text"
                          placeholder="Stanford University"
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
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GPA (Optional)</label>
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

          {/* Accordion 7: Certifications */}
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

                    <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider">Certification #{index + 1}</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Certification Name</label>
                        <input
                          type="text"
                          placeholder="AWS Certified Solutions Architect"
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

          {/* Accordion 8: Languages */}
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

                    <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider">Language #{index + 1}</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Language Name</label>
                        <input
                          type="text"
                          placeholder="Spanish"
                          value={lang.name}
                          onChange={(e) => changeLanguage(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Proficiency Level</label>
                        <input
                          type="text"
                          placeholder="Fluent / Professional Professional"
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

          {/* Accordion 9: Interests */}
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
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Add Interests</label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Photography, Hiking, Open Source (Press Enter)"
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
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm text-slate-800"
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
    </div>
  );
};

export default ResumeBuilder;