import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import ResumePreview from '../components/ResumePreview';
import { 
  ArrowLeft, Share2, Printer, Loader2, Link as LinkIcon, 
  Globe, Shield, ChevronDown, Check, Download 
} from 'lucide-react';

const Preview = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if we are in private app preview or public view
  const isPrivate = location.pathname.startsWith('/app');

  useEffect(() => {
    const fetchResume = async () => {
      setLoading(true);
      try {
        let response;
        if (isPrivate) {
          response = await api.get(`/resumes/get/${resumeId}`);
        } else {
          response = await api.get(`/resumes/public/${resumeId}`);
        }
        
        if (response.data?.resume) {
          setResume(response.data.resume);
        }
      } catch (err) {
        console.error('Error fetching resume for preview:', err);
        showToast(
          isPrivate 
            ? 'Error loading resume details.' 
            : 'Resume not found or is set to private.', 
          'error'
        );
        if (isPrivate) navigate('/app');
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [resumeId, isPrivate, navigate]);

  // Handle template switch or accent color in private preview
  const handleOptionChange = async (field, value) => {
    if (!isPrivate) return;
    
    // Update local state instantly for responsiveness
    const updatedResume = { ...resume, [field]: value };
    setResume(updatedResume);

    // Save choice to server
    try {
      const formData = new FormData();
      formData.append('resumeId', resumeId);
      formData.append('resumeData', JSON.stringify(updatedResume));
      await api.put('/resumes/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (err) {
      console.error('Error saving template option:', err);
    }
  };

  // Toggle public sharing status
  const handleTogglePublic = async () => {
    if (!isPrivate) return;
    setSaveLoading(true);
    const updatedStatus = !resume.public;
    
    const updatedResume = { ...resume, public: updatedStatus };
    setResume(updatedResume);

    try {
      const formData = new FormData();
      formData.append('resumeId', resumeId);
      formData.append('resumeData', JSON.stringify(updatedResume));
      await api.put('/resumes/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast(
        updatedStatus 
          ? 'Resume is now public! You can copy the shareable link.' 
          : 'Resume is now private.', 
        'success'
      );
    } catch (err) {
      console.error('Error toggling public status:', err);
      showToast('Error changing resume privacy.', 'error');
      // Revert state
      setResume((prev) => ({ ...prev, public: !updatedStatus }));
    } finally {
      setSaveLoading(false);
    }
  };

  // Copy shareable link to clipboard
  const copyShareableLink = () => {
    const publicUrl = `${window.location.origin}/view/${resumeId}`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Trigger browser print dialog for PDF generation
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
          <p className="mt-4 text-slate-600 font-medium">Loading preview page...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-100 shadow max-w-sm w-full">
          <Shield className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">Access Restrained</h3>
          <p className="text-slate-500 text-xs leading-relaxed mb-6">
            This resume is private or doesn't exist. If you own it, please log in and set its status to public.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Stylesheet for printing */}
      <style>{`
        @media print {
          /* Hide all UI elements */
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-area {
            box-shadow: none !important;
            border: none !important;
            margin: 0 auto !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Top Header Panel (no-print) */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 sticky top-[57px] z-30 shadow-sm no-print flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isPrivate && (
            <button
              onClick={() => navigate(`/app/builder/${resumeId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Editor</span>
            </button>
          )}
          <span className="text-sm font-bold text-slate-800 hidden sm:inline">
            Preview: {resume.title}
          </span>
        </div>

        {/* Action Options */}
        <div className="flex items-center flex-wrap gap-2.5">
          {isPrivate && (
            <>
              {/* Template Quick Select */}
              <select
                value={resume.template}
                onChange={(e) => handleOptionChange('template', e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 bg-white font-semibold outline-none focus:border-orange-500"
              >
                <option value="Classic">Classic</option>
                <option value="Modern">Modern</option>
                <option value="Professional">Professional</option>
                <option value="Creative">Creative</option>
              </select>

              {/* Privacy Control */}
              <button
                onClick={handleTogglePublic}
                disabled={saveLoading}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  resume.public 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100' 
                    : 'bg-slate-50 text-slate-655 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {resume.public ? <Globe className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                <span>{resume.public ? 'Public Link' : 'Private'}</span>
              </button>

              {/* Copy URL */}
              {resume.public && (
                <button
                  onClick={copyShareableLink}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <LinkIcon className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Link'}</span>
                </button>
              )}
            </>
          )}

          {/* PDF Download / Print */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md shadow-orange-600/10 transition cursor-pointer text-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Main Preview Frame */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-100">
        <div className="w-full max-w-[21cm] shadow-xl border border-slate-200 rounded-lg overflow-hidden bg-white print-area min-h-[29.7cm] mb-12">
          <ResumePreview resume={resume} />
        </div>
      </div>

      {/* Public Branding Footer (no-print) */}
      {!isPrivate && (
        <div className="bg-white border-t border-slate-250 py-4 text-center text-xs text-slate-400 no-print">
          <p>Created using <span className="font-bold text-slate-700">Resu<span className="text-orange-500">AI</span> Resume Builder</span></p>
        </div>
      )}
    </div>
  );
};

export default Preview;
