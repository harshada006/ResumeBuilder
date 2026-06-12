import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Trash2, Edit, ExternalLink, Search, Sparkles, AlertCircle, FileUp, X } from 'lucide-react';

const Dashboard = () => {
  const { apiFetch, showToast } = useAuth();
  const navigate = useNavigate();
  
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createMode, setCreateMode] = useState('blank'); // 'blank' or 'ai'
  const [rawResumeText, setRawResumeText] = useState('');
  const [creating, setCreating] = useState(false);
  
  // Fetch user resumes
  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/user/resumes');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch resumes');
      setResumes(data.resumes || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // Handle Delete Resume
  const handleDelete = async (e, resumeId) => {
    e.stopPropagation(); // Prevent card click navigation
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
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Create Resume (Blank or AI parsed)
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
      } else {
        // AI Parse mode
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
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  // Filter resumes by search query
  const filteredResumes = resumes.filter((resume) =>
    resume.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section */}
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
            setIsCreateModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-orange-500/10 cursor-pointer transition-all self-start sm:self-center"
        >
          <Plus size={18} />
          Create Resume
        </button>
      </div>

      {/* Search & Stats Bar */}
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
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-orange-500 focus:bg-white transition text-sm text-slate-800"
          />
        </div>
        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
          Total Resumes: <span className="text-slate-800 font-bold">{resumes.length}</span>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        // Loading skeletons
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-slate-200/60 rounded-2xl p-5 h-44 flex flex-col justify-between shadow-sm animate-pulse">
              <div>
                <div className="h-6 w-32 bg-slate-200 rounded-md mb-2"></div>
                <div className="h-4 w-24 bg-slate-100 rounded-md"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-9 w-20 bg-slate-100 rounded-lg"></div>
                <div className="h-9 w-9 bg-slate-100 rounded-lg ml-auto"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredResumes.length === 0 ? (
        // Empty state
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
        // Cards Grid
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
                <p className="text-xs text-slate-400 mt-1">
                  Template: <span className="font-semibold text-slate-600">{resume.template || 'Classic'}</span>
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
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-orange-600 hover:bg-orange-50/50 px-2.5 py-1.5 rounded-lg transition font-medium cursor-pointer"
                >
                  <Edit size={14} />
                  Edit
                </button>
                
                <a
                  href={`/view/${resume._id}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 px-2.5 py-1.5 rounded-lg transition font-medium cursor-pointer"
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

      {/* Create Resume Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <FileText className="text-orange-500" size={20} />
                Create New Resume
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition hover:bg-slate-50 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate}>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Resume Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Engineer Resume"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-sm text-slate-800"
                  />
                </div>

                {/* Mode Toggles */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateMode('blank')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                      createMode === 'blank'
                        ? 'border-orange-500 bg-orange-50/20 text-orange-600 font-semibold shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Plus size={20} className="mb-1" />
                    <span className="text-xs">Blank Resume</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setCreateMode('ai')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                      createMode === 'ai'
                        ? 'border-orange-500 bg-orange-50/20 text-orange-600 font-semibold shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Sparkles size={20} className="mb-1" />
                    <span className="text-xs">AI Upload & Parse</span>
                  </button>
                </div>

                {/* AI Parse fields */}
                {createMode === 'ai' && (
                  <div className="space-y-2 pt-2 animate-fade-in">
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex gap-2.5 text-xs text-orange-800">
                      <Sparkles size={16} className="shrink-0 mt-0.5 text-orange-600" />
                      <p>
                        Paste your raw resume text (work history, contact info, skills, etc.) below. 
                        Our AI parser will automatically extract and structure your information into sections.
                      </p>
                    </div>
                    
                    <textarea
                      rows={6}
                      placeholder="Paste your resume text here..."
                      value={rawResumeText}
                      onChange={(e) => setRawResumeText(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition text-xs text-slate-800 font-mono bg-slate-50"
                    />
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow cursor-pointer transition-all"
                >
                  {creating ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      {createMode === 'ai' ? 'Parsing...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {createMode === 'ai' ? <Sparkles size={14} /> : <Plus size={14} />}
                      {createMode === 'ai' ? 'Parse & Create' : 'Create Blank'}
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
