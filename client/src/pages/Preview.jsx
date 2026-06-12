import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ResumeTemplates from '../components/ResumeTemplates';
import { FileText, Printer, ArrowRight, Lock, EyeOff } from 'lucide-react';

const Preview = () => {
  const { resumeId } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        const storedToken = localStorage.getItem('token');
        let res;
        
        // Attempt to fetch as authenticated user first (allows viewing private resumes owned by current user)
        if (storedToken) {
          try {
            res = await fetch(`${apiUrl}/api/resumes/get/${resumeId}`, {
              headers: {
                'Authorization': `Bearer ${storedToken}`
              }
            });
          } catch (tokenErr) {
            console.warn("Authenticated fetch failed, falling back to public:", tokenErr.message);
          }
        }
        
        // If not logged in or if authenticated fetch failed, fall back to public fetch
        if (!res || !res.ok) {
          res = await fetch(`${apiUrl}/api/resumes/public/${resumeId}`);
        }
        
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'This resume is private or does not exist.');
        }
        setResume(data.resume);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [resumeId, apiUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-500 animate-pulse mb-4">
          <FileText size={24} />
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Loading preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mb-4 shadow-inner">
          <EyeOff size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-sm leading-relaxed">{error}</p>
        <Link
          to="/login"
          className="mt-6 flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition"
        >
          Build Your Own Resume
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Visitor Control Bar - hidden during print */}
      <div className="no-print sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-orange-500 text-white font-extrabold flex items-center justify-center text-sm">
            R
          </div>
          <span className="font-bold text-sm text-slate-800 hidden sm:inline">
            ResumeBuilder Shared Link
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-650 text-xs font-semibold px-3.5 py-1.8 rounded-xl transition cursor-pointer"
          >
            <Printer size={14} />
            Download PDF / Print
          </button>
          
          <Link
            to="/login"
            className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-semibold px-3.5 py-1.8 rounded-xl transition shadow shadow-orange-500/10"
          >
            Create Your Own
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Embedded Resume Box */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex justify-center">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200/60 w-full min-h-[1123px]">
          <ResumeTemplates
            templateName={resume.template}
            data={resume}
            accentColor={resume.accent_color}
          />
        </div>
      </div>
    </div>
  );
};

export default Preview;
