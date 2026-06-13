import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink, Calendar, Award, BookOpen, Briefcase, FileDown, CheckCircle, ArrowLeft, Send } from 'lucide-react';

const LinkedinIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const PortfolioView = () => {
  const { resumeId } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Contact Form simulation
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        setLoading(true);
        const storedToken = localStorage.getItem('token');
        let res;

        // Try authenticated fetch first
        if (storedToken) {
          try {
            res = await fetch(`${apiUrl}/api/resumes/get/${resumeId}`, {
              headers: { 'Authorization': `Bearer ${storedToken}` }
            });
          } catch (e) {
            console.warn("Auth fetch failed:", e.message);
          }
        }

        // Public fetch fallback
        if (!res || !res.ok) {
          res = await fetch(`${apiUrl}/api/resumes/public/${resumeId}`);
        }

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Portfolio not found or is private.');
        }
        setResume(data.resume);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResumeData();
  }, [resumeId, apiUrl]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent mb-4"></div>
        <p className="text-slate-500 font-medium">Loading personal portfolio...</p>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
          <Mail size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Portfolio Unavailable</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-sm">{error || 'This resume data does not exist or has portfolio disabled.'}</p>
        <Link to="/" className="mt-6 bg-orange-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow">
          Go to Homepage
        </Link>
      </div>
    );
  }

  const { personal_info, professional_summary, skills, experience, education, projects, certifications, languages, interests, portfolio_layout, accent_color } = resume;
  const layout = portfolio_layout || 'Sleek Dark';

  // ----------------------------------------------------
  // LAYOUT 1: SLEEK DARK (Developer layout)
  // ----------------------------------------------------
  if (layout === 'Sleek Dark') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white pb-16">
        {/* Floating navbar */}
        <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-900 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="font-extrabold text-lg bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
              {personal_info?.full_name || 'Portfolio'}
            </span>
            <div className="flex items-center gap-4">
              <a 
                href={`/view/${resumeId}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow shadow-orange-500/10 active:scale-95"
              >
                <FileDown size={14} />
                Resume PDF
              </a>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <span className="text-orange-500 font-mono text-xs uppercase tracking-widest block font-bold">Available for hire</span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-none">
              Hi, I'm <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">{personal_info?.full_name || 'Your Name'}</span>
            </h1>
            <h2 className="text-lg sm:text-xl font-bold text-slate-400">{personal_info?.profession || 'Profession'}</h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xl">{professional_summary}</p>
            
            {/* Quick Contact Tags */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 text-xs text-slate-500">
              {personal_info?.location && <span className="flex items-center gap-1"><MapPin size={12} /> {personal_info.location}</span>}
              {personal_info?.email && <span className="flex items-center gap-1"><Mail size={12} /> {personal_info.email}</span>}
              {personal_info?.phone && <span className="flex items-center gap-1"><Phone size={12} /> {personal_info.phone}</span>}
              {personal_info?.linkedin && <span className="flex items-center gap-1"><LinkedinIcon size={12} /> {personal_info.linkedin}</span>}
            </div>
          </div>
          {personal_info?.image && (
            <div className="shrink-0 relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 opacity-30 blur-lg"></div>
              <img 
                src={personal_info.image} 
                alt={personal_info.full_name} 
                className="w-36 h-36 md:w-44 md:h-44 rounded-3xl object-cover border-2 border-slate-800 relative z-10 shadow-2xl" 
              />
            </div>
          )}
        </section>

        {/* Main Body Grid */}
        <main className="max-w-4xl mx-auto px-6 grid gap-12">
          
          {/* Skills */}
          {skills && skills.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xs font-bold font-mono text-orange-500 uppercase tracking-widest">Superpowers</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span key={i} className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-medium text-slate-350 hover:border-orange-500/30 transition-colors">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Work Experience */}
          {experience && experience.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-xs font-bold font-mono text-orange-500 uppercase tracking-widest">Work History</h3>
              <div className="space-y-6">
                {experience.map((exp, i) => (
                  <div key={i} className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-2xl p-5 transition space-y-2">
                    <div className="flex justify-between items-baseline flex-wrap gap-2">
                      <h4 className="font-bold text-white text-md">{exp.position}</h4>
                      <span className="text-[10px] font-mono text-slate-500">{exp.start_date} – {exp.end_date || 'Present'}</span>
                    </div>
                    <p className="text-xs font-semibold text-orange-400/80">{exp.company}</p>
                    {exp.description && <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xs font-bold font-mono text-orange-500 uppercase tracking-widest">Featured Projects</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {projects.map((proj, i) => (
                  <div key={i} className="bg-slate-900/20 border border-slate-900 hover:border-orange-500/20 rounded-2xl p-5 transition-all flex flex-col justify-between group">
                    <div className="space-y-2">
                      <h4 className="font-bold text-white group-hover:text-orange-400 transition-colors text-sm">{proj.name}</h4>
                      {proj.description && <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{proj.description}</p>}
                    </div>
                    {proj.link && (
                      <a 
                        href={proj.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-1.5 text-[10px] font-bold text-orange-500 mt-4 hover:underline"
                      >
                        Launch Project
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education & Certs */}
          <div className="grid sm:grid-cols-2 gap-8">
            {education && education.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-xs font-bold font-mono text-orange-500 uppercase tracking-widest">Education</h3>
                <div className="space-y-4">
                  {education.map((edu, i) => (
                    <div key={i} className="space-y-1">
                      <h4 className="font-bold text-white text-xs">{edu.institution}</h4>
                      <p className="text-[11px] text-slate-400">{edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}</p>
                      <span className="text-[9px] font-mono text-slate-500 block">{edu.graduation_date} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {certifications && certifications.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-xs font-bold font-mono text-orange-500 uppercase tracking-widest">Certifications</h3>
                <div className="space-y-3">
                  {certifications.map((cert, i) => (
                    <div key={i} className="text-xs">
                      <h4 className="font-semibold text-white">{cert.name}</h4>
                      {cert.issuer && <p className="text-[10px] text-slate-500">{cert.issuer} {cert.date ? `| ${cert.date}` : ''}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Interactive Contact Form */}
          <section className="space-y-4 border-t border-slate-900 pt-8">
            <h3 className="text-xs font-bold font-mono text-orange-500 uppercase tracking-widest">Get In Touch</h3>
            
            <form onSubmit={handleContactSubmit} className="grid gap-3 bg-slate-900/20 border border-slate-900 p-6 rounded-2xl max-w-lg">
              <div className="grid sm:grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="Your Name"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-orange-500 transition"
                />
                <input 
                  type="email" 
                  placeholder="Your Email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-orange-500 transition"
                />
              </div>
              <textarea 
                rows="4" 
                placeholder="Write your message details..."
                required
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-orange-500 transition"
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer transition active:scale-95 self-start"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Send size={12} />
                    Send Message
                  </>
                )}
              </button>

              {submitSuccess && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mt-2 animate-fade-in">
                  <CheckCircle size={14} />
                  Message sent! I will review it and reply soon.
                </div>
              )}
            </form>
          </section>

        </main>
      </div>
    );
  }

  // ----------------------------------------------------
  // LAYOUT 2: CREATIVE GRADIENT
  // ----------------------------------------------------
  if (layout === 'Creative Gradient') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-800 font-sans selection:bg-purple-600 selection:text-white pb-16">
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b border-slate-100 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="font-extrabold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {personal_info?.full_name || 'Portfolio'}
            </span>
            <a 
              href={`/view/${resumeId}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow active:scale-95"
            >
              <FileDown size={14} />
              PDF Resume
            </a>
          </div>
        </header>

        <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          {personal_info?.image && (
            <div className="shrink-0 relative order-first md:order-last">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur-md"></div>
              <img 
                src={personal_info.image} 
                alt={personal_info.full_name} 
                className="w-36 h-36 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-white shadow-xl relative z-10" 
              />
            </div>
          )}
          <div className="flex-1 space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-none">
              Hello, I'm <span className="bg-gradient-to-r from-indigo-650 to-purple-650 bg-clip-text text-transparent">{personal_info?.full_name || 'Your Name'}</span>
            </h1>
            <h2 className="text-md font-bold uppercase tracking-widest text-indigo-600">{personal_info?.profession || 'Profession'}</h2>
            <p className="text-slate-650 text-sm leading-relaxed">{professional_summary}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 pt-2 text-xs text-slate-500">
              {personal_info?.location && <span className="flex items-center gap-1"><MapPin size={12} /> {personal_info.location}</span>}
              {personal_info?.email && <span className="flex items-center gap-1"><Mail size={12} /> {personal_info.email}</span>}
              {personal_info?.linkedin && <span className="flex items-center gap-1"><LinkedinIcon size={12} /> {personal_info.linkedin}</span>}
            </div>
          </div>
        </section>

        <main className="max-w-4xl mx-auto px-6 space-y-12">
          {/* Skills */}
          {skills && skills.length > 0 && (
            <section className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-sm border border-white/50 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">My Stack</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span key={i} className="text-xs bg-indigo-50/50 text-indigo-750 border border-indigo-100/50 px-3.5 py-1.5 rounded-full font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Experience Timeline */}
          {experience && experience.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">My Timeline</h3>
              <div className="relative pl-6 border-l-2 border-indigo-200/80 space-y-6 ml-3">
                {experience.map((exp, i) => (
                  <div key={i} className="relative group bg-white/60 hover:bg-white p-5 rounded-2xl border border-white/80 shadow-sm transition">
                    <span className="absolute -left-[32px] top-6 w-3.5 h-3.5 rounded-full border-2 border-indigo-500 bg-white shadow-sm"></span>
                    <div className="flex justify-between items-baseline flex-wrap gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{exp.position}</h4>
                      <span className="text-[10px] font-bold text-slate-400">{exp.start_date} – {exp.end_date || 'Present'}</span>
                    </div>
                    <p className="text-xs font-bold text-purple-650 mt-0.5">{exp.company}</p>
                    {exp.description && <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Portfolio Work</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {projects.map((proj, i) => (
                  <div key={i} className="bg-white/80 hover:bg-white border border-white/80 hover:scale-[1.01] rounded-2xl p-5 transition-all flex flex-col justify-between shadow-sm">
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-slate-950 text-sm">{proj.name}</h4>
                      {proj.description && <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{proj.description}</p>}
                    </div>
                    {proj.link && (
                      <a 
                        href={proj.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-1 text-[10px] font-bold text-purple-600 mt-4 hover:underline"
                      >
                        Link details
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education & Certifications */}
          <div className="grid sm:grid-cols-2 gap-6 bg-white/40 p-6 rounded-3xl border border-white/50">
            {education && education.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Education</h3>
                <div className="space-y-4">
                  {education.map((edu, i) => (
                    <div key={i}>
                      <h4 className="font-bold text-slate-900 text-xs">{edu.institution}</h4>
                      <p className="text-[11px] text-slate-650">{edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}</p>
                      <span className="text-[10px] text-slate-400 block font-medium mt-0.5">{edu.graduation_date} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {certifications && certifications.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Achievements</h3>
                <ul className="space-y-2.5">
                  {certifications.map((cert, i) => (
                    <li key={i} className="text-xs">
                      <span className="font-bold text-slate-800 block leading-tight">{cert.name}</span>
                      {cert.issuer && <span className="text-[10px] text-slate-500 mt-0.5 block">{cert.issuer} {cert.date ? `(${cert.date})` : ''}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Simple simulated contact */}
          <section className="bg-white/60 p-6 rounded-2xl border border-white/80 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Collaborate With Me</h3>
            <form onSubmit={handleContactSubmit} className="space-y-3 max-w-md">
              <input 
                type="text" 
                placeholder="Name" 
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200/60 rounded-xl text-xs outline-none focus:border-purple-500 transition"
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200/60 rounded-xl text-xs outline-none focus:border-purple-500 transition"
              />
              <textarea 
                rows="3" 
                placeholder="Message" 
                required
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200/60 rounded-xl text-xs outline-none focus:border-purple-500 transition"
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-indigo-650 to-purple-650 text-white text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer shadow transition active:scale-95 flex items-center gap-1.5"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
              {submitSuccess && <p className="text-emerald-600 text-xs font-bold">Thank you! Message transmitted successfully.</p>}
            </form>
          </section>

        </main>
      </div>
    );
  }

  // ----------------------------------------------------
  // LAYOUT 3: MINIMALIST PROFESSIONAL
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-800 selection:text-white pb-16">
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold uppercase tracking-wider text-sm text-stone-950">
            {personal_info?.full_name || 'Portfolio'}
          </span>
          <a 
            href={`/view/${resumeId}`} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1 border border-stone-850 hover:bg-stone-50 text-stone-900 text-xs font-semibold px-4 py-1.8 rounded transition"
          >
            <FileDown size={14} />
            PDF Resume
          </a>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 space-y-6">
        {personal_info?.image && (
          <img 
            src={personal_info.image} 
            alt={personal_info.full_name} 
            className="w-24 h-24 rounded-full object-cover border border-stone-200 shadow-sm mx-auto sm:mx-0" 
          />
        )}
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-serif text-stone-950">{personal_info?.full_name || 'Your Name'}</h1>
          <p className="text-xs uppercase tracking-widest text-stone-500 font-bold">{personal_info?.profession || 'Profession Title'}</p>
          <p className="text-stone-650 text-xs leading-relaxed max-w-2xl pt-2 font-serif">{professional_summary}</p>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-1.5 text-xs border-t border-stone-200 pt-4 text-stone-500 font-serif">
          {personal_info?.location && <span className="flex items-center gap-1"><MapPin size={11} /> {personal_info.location}</span>}
          {personal_info?.email && <span className="flex items-center gap-1"><Mail size={11} /> {personal_info.email}</span>}
          {personal_info?.linkedin && <span className="flex items-center gap-1"><LinkedinIcon size={11} /> {personal_info.linkedin}</span>}
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-6 space-y-12">
        {/* Skills */}
        {skills && skills.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Areas of Expertise</h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <span key={i} className="text-xs border border-stone-200 bg-white px-2.5 py-1 rounded">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Professional Experience</h3>
            <div className="space-y-6">
              {experience.map((exp, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-baseline flex-wrap gap-2 text-stone-950 font-semibold text-xs">
                    <h4>{exp.position}</h4>
                    <span className="text-[10px] text-stone-400 font-serif">{exp.start_date} – {exp.end_date || 'Present'}</span>
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-stone-500">{exp.company}</p>
                  {exp.description && <p className="text-xs text-stone-600 leading-relaxed font-serif pt-1 whitespace-pre-wrap">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Key Projects</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {projects.map((proj, i) => (
                <div key={i} className="bg-white border border-stone-250 p-4 rounded flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h4 className="font-semibold text-stone-950 text-xs">{proj.name}</h4>
                    {proj.description && <p className="text-xs text-stone-600 font-serif leading-relaxed line-clamp-3">{proj.description}</p>}
                  </div>
                  {proj.link && (
                    <a 
                      href={proj.link} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-1 text-[9px] font-bold text-stone-950 mt-3 hover:underline uppercase tracking-wider"
                    >
                      View Link
                      <ExternalLink size={9} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Certs */}
        <div className="grid sm:grid-cols-2 gap-8 border-t border-stone-200 pt-8">
          {education && education.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Education</h3>
              <div className="space-y-4">
                {education.map((edu, i) => (
                  <div key={i} className="text-xs">
                    <h4 className="font-bold text-stone-900">{edu.institution}</h4>
                    <p className="text-stone-600 font-serif">{edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}</p>
                    <span className="text-[10px] text-stone-400 font-serif block mt-0.5">{edu.graduation_date} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {certifications && certifications.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Certifications</h3>
              <ul className="space-y-2">
                {certifications.map((cert, i) => (
                  <li key={i} className="text-xs font-serif text-stone-700">
                    <strong className="text-stone-900 font-sans font-bold block">{cert.name}</strong>
                    {cert.issuer && <span className="text-[10px] text-stone-400 block">{cert.issuer} {cert.date ? `| ${cert.date}` : ''}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Contact Form */}
        <section className="space-y-3 border-t border-stone-200 pt-8">
          <h3 className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Contact</h3>
          <form onSubmit={handleContactSubmit} className="space-y-3 max-w-md">
            <div className="grid sm:grid-cols-2 gap-3">
              <input 
                type="text" 
                placeholder="Name" 
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 bg-white rounded text-xs outline-none focus:border-stone-800 transition"
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 bg-white rounded text-xs outline-none focus:border-stone-800 transition"
              />
            </div>
            <textarea 
              rows="3" 
              placeholder="Message Description" 
              required
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 bg-white rounded text-xs outline-none focus:border-stone-800 transition"
            />
            <button 
              type="submit"
              disabled={isSubmitting}
              className="border border-stone-850 hover:bg-stone-900 hover:text-white text-stone-950 font-bold text-xs py-2 px-4 rounded transition active:scale-95"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
            {submitSuccess && <p className="text-stone-600 text-xs italic mt-2">Your message has been submitted. Thank you.</p>}
          </form>
        </section>

      </main>
    </div>
  );
};

export default PortfolioView;
