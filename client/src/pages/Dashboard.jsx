import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeadshotGenerator from './HeadshotGenerator';
import { 
  FileText, Plus, Trash2, Edit, ExternalLink, Search, Sparkles, 
  User, Check, Globe, Lock, Layout as LayoutIcon, Briefcase, 
  GraduationCap, TrendingUp, AlertCircle, Copy, Share2, Clipboard, ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const { apiFetch, showToast } = useAuth();
  const navigate = useNavigate();
  
  // Dashboard view tab: 'resumes' | 'headshot' | 'insights' | 'portfolio'
  const [activeTab, setActiveTab] = useState('resumes');
  
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Resume Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createMode, setCreateMode] = useState('blank'); // 'blank' | 'ai' | 'prompt'
  
  // AI Prompt Generator state
  const [promptProfession, setPromptProfession] = useState('');
  const [promptExpLevel, setPromptExpLevel] = useState('Mid-level');
  const [promptBackground, setPromptBackground] = useState('');
  
  // AI Parse state
  const [rawResumeText, setRawResumeText] = useState('');
  const [creating, setCreating] = useState(false);

  // Career Insights state
  const [selectedResumeForInsights, setSelectedResumeForInsights] = useState('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsData, setInsightsData] = useState(null);

  // Fetch resumes
  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/user/resumes');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch resumes');
      setResumes(data.resumes || []);
      if (data.resumes?.length > 0 && !selectedResumeForInsights) {
        setSelectedResumeForInsights(data.resumes[0]._id);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // Fetch Career Insights from backend
  const fetchCareerInsights = async (resumeId) => {
    if (!resumeId) return;
    setLoadingInsights(true);
    try {
      // Get resume data first
      const getRes = await apiFetch(`/api/resumes/get/${resumeId}`);
      const getData = await getRes.json();
      if (!getRes.ok) throw new Error(getData.message || 'Failed to fetch resume details');

      const res = await apiFetch('/api/ai/career-insights', {
        method: 'POST',
        body: JSON.stringify({ resumeData: getData.resume })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch career insights');
      
      setInsightsData(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'insights' && selectedResumeForInsights) {
      fetchCareerInsights(selectedResumeForInsights);
    }
  }, [activeTab, selectedResumeForInsights]);

  // Handle Delete
  const handleDelete = async (e, resumeId) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }
    
    try {
      const res = await apiFetch(`/api/resumes/delete/${resumeId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete resume');
      
      setResumes((prev) => prev.filter((r) => r._id !== resumeId));
      showToast('Resume deleted successfully', 'success');
      if (selectedResumeForInsights === resumeId) {
        setInsightsData(null);
        setSelectedResumeForInsights('');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Create Resume Action
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createTitle.trim()) {
      showToast('Please enter a title for your resume', 'warning');
      return;
    }

    setCreating(true);
    try {
      if (createMode === 'blank') {
        const res = await apiFetch('/api/resumes/create', {
          method: 'POST',
          body: JSON.stringify({ title: createTitle }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create resume');
        
        showToast('Resume created successfully', 'success');
        setIsCreateModalOpen(false);
        navigate(`/app/builder/${data.resume._id}`);
      } else if (createMode === 'ai') {
        if (!rawResumeText.trim()) {
          showToast('Please paste your existing resume text to parse', 'warning');
          setCreating(false);
          return;
        }

        const res = await apiFetch('/api/ai/upload-resume', {
          method: 'POST',
          body: JSON.stringify({
            title: createTitle,
            resumeText: rawResumeText,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to parse resume');

        showToast('AI parser completed! Opening builder...', 'success');
        setIsCreateModalOpen(false);
        navigate(`/app/builder/${data.resumeId}`);
      } else if (createMode === 'prompt') {
        if (!promptProfession.trim()) {
          showToast('Please specify a profession/job title', 'warning');
          setCreating(false);
          return;
        }

        const res = await apiFetch('/api/ai/generate-resume-prompt', {
          method: 'POST',
          body: JSON.stringify({
            title: createTitle,
            profession: promptProfession,
            experienceLevel: promptExpLevel,
            briefBackground: promptBackground
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to generate resume');

        showToast('Resume generated by AI! Opening builder...', 'success');
        setIsCreateModalOpen(false);
        navigate(`/app/builder/${data.resumeId}`);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  // Update Portfolio Settings
  const handleUpdatePortfolio = async (resumeId, field, value) => {
    try {
      // Find local copy
      const index = resumes.findIndex((r) => r._id === resumeId);
      if (index === -1) return;
      
      const updatedResume = { ...resumes[index], [field]: value };
      
      const res = await apiFetch(`/api/resumes/update/${resumeId}`, {
        method: 'PUT',
        body: JSON.stringify({ resumeData: updatedResume }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update portfolio settings');
      
      // Update local state
      setResumes((prev) => prev.map((r) => (r._id === resumeId ? data.resume : r)));
      showToast('Portfolio configuration updated', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Portfolio link copied to clipboard!', 'success');
  };

  const filteredResumes = resumes.filter((resume) =>
    resume.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-65px)]">
      
      {/* Side Tab Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-350 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 no-print">
        <div className="space-y-6">
          <div className="px-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Career Hub</span>
            <p className="text-xs text-slate-400">All-in-one Career Assistant</p>
          </div>
          
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('resumes')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'resumes' 
                  ? 'bg-orange-500 text-white shadow shadow-orange-500/10' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText size={16} />
              My Resumes
            </button>

            <button
              onClick={() => setActiveTab('headshot')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'headshot' 
                  ? 'bg-orange-500 text-white shadow shadow-orange-500/10' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Sparkles size={16} />
              AI Headshot Generator
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'insights' 
                  ? 'bg-orange-500 text-white shadow shadow-orange-500/10' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <TrendingUp size={16} />
              Career Insights
            </button>

            <button
              onClick={() => setActiveTab('portfolio')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'portfolio' 
                  ? 'bg-orange-500 text-white shadow shadow-orange-500/10' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutIcon size={16} />
              Portfolio Websites
            </button>
          </nav>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/40 p-3 rounded-2xl space-y-1 text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Plan Status</p>
          <span className="text-[11px] font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full inline-block">AI PRO Account</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-50 min-h-full">
        
        {/* ==================== TAB 1: RESUMES ==================== */}
        {activeTab === 'resumes' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Resumes</h1>
                <p className="text-slate-500 text-sm mt-1">Create, edit, and optimize your resumes with professional templates.</p>
              </div>
              <button
                onClick={() => {
                  setCreateTitle('');
                  setCreateMode('blank');
                  setRawResumeText('');
                  setPromptProfession('');
                  setPromptBackground('');
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-orange-500/10 cursor-pointer transition-all self-start sm:self-center"
              >
                <Plus size={18} />
                Create Resume
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search by resume title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-55 outline-none focus:border-orange-500 focus:bg-white transition text-sm text-slate-800"
                />
              </div>
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Total Resumes: <span className="text-slate-800 font-bold">{resumes.length}</span>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white border border-slate-200/60 rounded-2xl p-5 h-44 flex flex-col justify-between shadow-sm animate-pulse">
                    <div>
                      <div className="h-6 w-32 bg-slate-200 rounded-md mb-2"></div>
                      <div className="h-4 w-24 bg-slate-100 rounded-md"></div>
                    </div>
                    <div className="h-9 w-20 bg-slate-100 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : filteredResumes.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-3xl p-12 bg-white/50 text-center min-h-[300px]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 mb-4 shadow-inner">
                  <FileText size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No resumes found</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-sm">
                  {searchQuery ? 'Try adjusting your search keywords.' : 'Create your first professional resume using our AI-assisted builder.'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-5 flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition cursor-pointer"
                  >
                    <Plus size={14} />
                    Get Started
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResumes.map((resume) => (
                  <div
                    key={resume._id}
                    onClick={() => navigate(`/app/builder/${resume._id}`)}
                    className="group bg-white border border-slate-200/60 hover:border-orange-500/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[176px]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                          {resume.title}
                        </h3>
                        {resume.public && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Public
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-450 mt-1">
                        Template: <span className="font-semibold text-slate-650">{resume.template || 'Classic'}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2">
                        Updated: {new Date(resume.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 border-t border-slate-50 pt-4 mt-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/builder/${resume._id}`);
                        }}
                        className="flex items-center gap-1 text-xs text-slate-600 hover:text-orange-600 hover:bg-orange-55 px-2.5 py-1.5 rounded-lg transition font-medium cursor-pointer"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      
                      <a
                        href={`/view/${resume._id}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-55 px-2.5 py-1.5 rounded-lg transition font-medium cursor-pointer"
                      >
                        <ExternalLink size={14} />
                        View Link
                      </a>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, resume._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition ml-auto cursor-pointer"
                        title="Delete resume"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: AI HEADSHOT ==================== */}
        {activeTab === 'headshot' && (
          <div className="animate-fade-in">
            <HeadshotGenerator />
          </div>
        )}

        {/* ==================== TAB 3: CAREER INSIGHTS ==================== */}
        {activeTab === 'insights' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="text-orange-500" size={28} />
                AI Career Insights Dashboard
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Evaluate your resume's readiness across key criteria: Strength, Interview Confidence, and Job Market alignment.
              </p>
            </div>

            {resumes.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                <AlertCircle className="mx-auto text-amber-500 mb-3" size={36} />
                <h3 className="font-extrabold text-slate-900 text-md">No resumes analyzed</h3>
                <p className="text-slate-500 text-sm mt-1">You must create a resume first to fetch career statistics.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Select resume dropdown */}
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-sm">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Analyze Statistics for:</label>
                    <select
                      value={selectedResumeForInsights}
                      onChange={(e) => setSelectedResumeForInsights(e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-orange-500 bg-slate-50/50 text-sm font-semibold text-slate-700 max-w-xs"
                    >
                      {resumes.map((r) => (
                        <option key={r._id} value={r._id}>{r.title}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={() => fetchCareerInsights(selectedResumeForInsights)}
                    disabled={loadingInsights}
                    className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    <RefreshCw size={14} className={loadingInsights ? 'animate-spin' : ''} />
                    Refresh Analytics
                  </button>
                </div>

                {loadingInsights ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent mx-auto mb-3"></div>
                    <p className="text-slate-500 text-xs font-bold">AI reviewing resume parameters...</p>
                  </div>
                ) : insightsData ? (
                  <div className="grid md:grid-cols-12 gap-6">
                    
                    {/* Score Cards (Left 5 cols) */}
                    <div className="md:col-span-5 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between items-center text-center space-y-6">
                      
                      {/* Strength circular progress */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resume Strength</p>
                        <div className="relative h-36 w-36 flex items-center justify-center">
                          <svg className="h-full w-full transform -rotate-90">
                            <circle cx="72" cy="72" r="62" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                            <circle cx="72" cy="72" r="62" stroke="#f97316" strokeWidth="12" fill="transparent"
                              strokeDasharray={2 * Math.PI * 62}
                              strokeDashoffset={2 * Math.PI * 62 * (1 - insightsData.resumeStrength / 100)}
                              strokeLinecap="round"
                              className="transition-all duration-1000"
                            />
                          </svg>
                          <span className="absolute text-3xl font-black text-slate-800">{insightsData.resumeStrength}%</span>
                        </div>
                      </div>

                      {/* Other stats bars */}
                      <div className="w-full space-y-4 pt-4 border-t border-slate-100">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>Interview Readiness</span>
                            <span>{insightsData.interviewReadiness}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                              style={{ width: `${insightsData.interviewReadiness}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>Job Market Readiness</span>
                            <span>{insightsData.marketReadiness}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                              style={{ width: `${insightsData.marketReadiness}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skill Gap Analysis & Outlook (Right 7 cols) */}
                    <div className="md:col-span-7 space-y-6">
                      
                      {/* Skill Gaps */}
                      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Clipboard size={14} className="text-orange-500" />
                          Skill Gap Assessment
                        </h3>
                        
                        <div className="space-y-4">
                          {insightsData.skillGapAnalysis?.map((gap, idx) => (
                            <div key={idx} className="border border-slate-100 p-4 rounded-2xl bg-slate-50/40 space-y-2">
                              <span className="text-xs font-bold text-slate-800 block">{gap.skillGroup} Category</span>
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Present:</span>
                                {gap.present?.map((s, i) => (
                                  <span key={i} className="text-[10px] bg-slate-100 border text-slate-600 px-2 py-0.5 rounded-md font-semibold">{s}</span>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-[10px] text-orange-500 font-bold uppercase mr-1">Recommended:</span>
                                {gap.recommended?.map((s, i) => (
                                  <span key={i} className="text-[10px] bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-md font-bold">+ {s}</span>
                                ))}
                              </div>
                              <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">{gap.gapDescription}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Outlook */}
                      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Briefcase size={14} className="text-orange-500" />
                          Market Trends Outlook
                        </h3>
                        <p className="text-slate-650 text-xs leading-relaxed">
                          {insightsData.marketOutlook}
                        </p>
                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                    <AlertCircle className="mx-auto text-orange-500 mb-3" size={36} />
                    <h3 className="font-extrabold text-slate-900 text-md">Click "Refresh Analytics" to analyze this resume</h3>
                    <p className="text-slate-500 text-sm mt-1">Our AI Career Coach will evaluate the resume details to plot custom statistics.</p>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 4: PORTFOLIOS ==================== */}
        {activeTab === 'portfolio' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <LayoutIcon className="text-orange-500" size={28} />
                Portfolio Website Generator
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Automatically convert your resume details into a hosted personal portfolio website. Choose styles, and share details.
              </p>
            </div>

            {resumes.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                <AlertCircle className="mx-auto text-amber-500 mb-3" size={36} />
                <h3 className="font-extrabold text-slate-900 text-md">No resumes found</h3>
                <p className="text-slate-500 text-sm mt-1">Generate or create a resume to host a personal portfolio website.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resumes.map((resume) => {
                  const shareUrl = `${window.location.origin}/portfolio/${resume._id}`;
                  
                  return (
                    <div key={resume._id} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-slate-900 text-md">{resume.title}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                            resume.portfolio_enabled !== false 
                              ? 'text-emerald-700 bg-emerald-50' 
                              : 'text-slate-500 bg-slate-100'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${resume.portfolio_enabled !== false ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            {resume.portfolio_enabled !== false ? 'Website Active' : 'Offline'}
                          </span>
                        </div>

                        {/* Settings rows */}
                        <div className="flex flex-wrap gap-4 text-xs">
                          {/* Enable/Disable Toggle */}
                          <button
                            onClick={() => handleUpdatePortfolio(resume._id, 'portfolio_enabled', resume.portfolio_enabled === false)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition ${
                              resume.portfolio_enabled !== false
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                          >
                            {resume.portfolio_enabled !== false ? <Globe size={13} /> : <Lock size={13} />}
                            {resume.portfolio_enabled !== false ? 'Public' : 'Disabled'}
                          </button>

                          {/* Layout Selection */}
                          <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-2.5 py-1 bg-white">
                            <span className="text-[10px] font-bold text-slate-450 uppercase mr-1">Style</span>
                            <select
                              value={resume.portfolio_layout || 'Sleek Dark'}
                              onChange={(e) => handleUpdatePortfolio(resume._id, 'portfolio_layout', e.target.value)}
                              className="text-[11px] font-bold bg-transparent border-none outline-none text-slate-700 cursor-pointer"
                            >
                              <option value="Sleek Dark">Sleek Dark (Technical)</option>
                              <option value="Creative Gradient">Creative Gradient (Startup)</option>
                              <option value="Minimalist Professional">Minimalist Professional (Executive)</option>
                            </select>
                          </div>
                        </div>

                        {/* Display Share Link */}
                        {resume.portfolio_enabled !== false && (
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-2.5 rounded-xl max-w-lg mt-2">
                            <input
                              type="text"
                              readOnly
                              value={shareUrl}
                              className="bg-transparent border-none outline-none font-mono text-[10px] text-slate-500 flex-1 truncate"
                            />
                            <button
                              onClick={() => copyToClipboard(shareUrl)}
                              className="p-1.5 text-slate-500 hover:text-orange-500 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition shadow-sm cursor-pointer"
                              title="Copy URL"
                            >
                              <Copy size={13} />
                            </button>
                            
                            <a
                              href={`/portfolio/${resume._id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition shadow-sm cursor-pointer"
                              title="Open Website"
                            >
                              <ExternalLink size={13} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Create Resume Modal (Includes AI generate prompt) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-xl border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Plus className="text-orange-500" size={20} />
                Create New Resume
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 p-1.5 rounded-lg transition hover:bg-slate-55 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate}>
              <div className="p-6 space-y-4">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Resume Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Product Designer Resume"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm text-slate-800"
                  />
                </div>

                {/* Mode Select Tabs */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateMode('blank')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                      createMode === 'blank'
                        ? 'border-orange-500 bg-orange-50/20 text-orange-600 font-bold shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Plus size={18} className="mb-1" />
                    <span className="text-[10px] font-semibold">Blank Form</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateMode('ai')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                      createMode === 'ai'
                        ? 'border-orange-500 bg-orange-50/20 text-orange-600 font-bold shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Share2 size={18} className="mb-1" />
                    <span className="text-[10px] font-semibold">AI Parse Upload</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateMode('prompt')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                      createMode === 'prompt'
                        ? 'border-orange-500 bg-orange-50/20 text-orange-600 font-bold shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Sparkles size={18} className="mb-1" />
                    <span className="text-[10px] font-semibold">AI Generate (Prompt)</span>
                  </button>
                </div>

                {/* AI Parse mode input */}
                {createMode === 'ai' && (
                  <div className="space-y-2 pt-2 animate-fade-in">
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex gap-2 text-xs text-orange-850">
                      <Sparkles size={16} className="shrink-0 mt-0.5 text-orange-600" />
                      <p>Paste your existing text details below and the AI parser will split it into structured resume nodes.</p>
                    </div>
                    <textarea
                      rows={5}
                      placeholder="Paste your raw text details here..."
                      value={rawResumeText}
                      onChange={(e) => setRawResumeText(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-xs font-mono bg-slate-55"
                    />
                  </div>
                )}

                {/* AI Generate Prompt mode inputs */}
                {createMode === 'prompt' && (
                  <div className="space-y-3 pt-2 animate-fade-in">
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex gap-2 text-xs text-orange-850">
                      <Sparkles size={16} className="shrink-0 mt-0.5 text-orange-600" />
                      <p>Input your profession targets and key experiences, and our AI will draft a complete starting resume instantly.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Profession Target</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Backend Developer"
                          value={promptProfession}
                          onChange={(e) => setPromptProfession(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-orange-500"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Experience Level</label>
                        <select
                          value={promptExpLevel}
                          onChange={(e) => setPromptExpLevel(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-orange-500 bg-white"
                        >
                          <option value="Entry-level">Entry-level</option>
                          <option value="Mid-level">Mid-level</option>
                          <option value="Senior-level">Senior-level</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Background Summary & Focus (Optional)</label>
                      <textarea
                        rows={3}
                        placeholder="e.g. 4 years of JavaScript/Python. Built cloud databases and REST APIs."
                        value={promptBackground}
                        onChange={(e) => setPromptBackground(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-55 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-650 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold px-4.5 py-2.5 rounded-lg shadow transition"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                      {createMode === 'prompt' ? 'Drafting...' : createMode === 'ai' ? 'Parsing...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {createMode === 'prompt' ? <Sparkles size={14} /> : <Plus size={14} />}
                      {createMode === 'prompt' ? 'Generate Resume' : createMode === 'ai' ? 'Parse & Open' : 'Create Blank'}
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
