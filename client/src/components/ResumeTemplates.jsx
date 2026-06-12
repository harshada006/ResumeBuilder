import React from 'react';
import { Mail, Phone, MapPin, Globe, Calendar, Award, BookOpen, Briefcase, Code, GraduationCap } from 'lucide-react';

const Linkedin = ({ size = 16, className = "", style = {} }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// ==========================================
// TEMPLATE 1: CLASSIC (Traditional single column)
// ==========================================
const ClassicTemplate = ({ data, accentColor }) => {
  const { personal_info, professional_summary, skills, experience, education, projects, certifications, languages, interests } = data;

  return (
    <div className="p-8 font-serif text-slate-800 bg-white min-h-full leading-relaxed" style={{ wordBreak: 'break-word' }}>
      {/* Header */}
      <div className="text-center border-b-2 pb-5" style={{ borderColor: accentColor }}>
        {personal_info?.image && (
          <img
            src={personal_info.image}
            alt={personal_info.full_name}
            className="w-24 h-24 rounded-full mx-auto object-cover border-2 shadow-sm mb-3"
            style={{ borderColor: accentColor }}
          />
        )}
        <h1 className="text-3.5xl font-bold uppercase tracking-wide text-slate-900">{personal_info?.full_name || 'Your Name'}</h1>
        <p className="text-md font-semibold italic mt-1" style={{ color: accentColor }}>{personal_info?.profession || 'Profession Title'}</p>
        
        {/* Contact Info */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-600 font-sans">
          {personal_info?.email && (
            <span className="flex items-center gap-1">
              <Mail size={12} /> {personal_info.email}
            </span>
          )}
          {personal_info?.phone && (
            <span className="flex items-center gap-1">
              <Phone size={12} /> {personal_info.phone}
            </span>
          )}
          {personal_info?.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {personal_info.location}
            </span>
          )}
          {personal_info?.linkedin && (
            <span className="flex items-center gap-1">
              <Linkedin size={12} /> {personal_info.linkedin}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {professional_summary && (
        <div className="mt-5">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-2 text-slate-900" style={{ borderColor: accentColor + '30' }}>Professional Summary</h2>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">{professional_summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mt-5">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-3 text-slate-900" style={{ borderColor: accentColor + '30' }}>Work Experience</h2>
          <div className="space-y-3">
            {experience.map((exp, idx) => (
              <div key={idx} className="font-sans">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{exp.position || 'Role'}</h3>
                    <p className="text-xs text-slate-500 font-medium">{exp.company || 'Company Name'}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {exp.start_date || 'Start'} – {exp.end_date || 'Present'}
                  </span>
                </div>
                {exp.description && <p className="text-xs text-slate-600 mt-1 font-serif leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mt-5">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-3 text-slate-900" style={{ borderColor: accentColor + '30' }}>Projects</h2>
          <div className="space-y-3 font-sans">
            {projects.map((proj, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {proj.name || 'Project Name'}
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noreferrer" className="text-[10px] underline font-normal" style={{ color: accentColor }}>
                        Link
                      </a>
                    )}
                  </h3>
                </div>
                {proj.description && <p className="text-xs text-slate-600 mt-1 font-serif leading-relaxed">{proj.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mt-5">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-3 text-slate-900" style={{ borderColor: accentColor + '30' }}>Education</h2>
          <div className="space-y-3 font-sans">
            {education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{edu.institution || 'School Name'}</h3>
                  <p className="text-xs text-slate-600">{edu.degree || 'Degree'} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">{edu.graduation_date || 'Graduation'}</span>
                  {edu.gpa && <span className="text-[10px] text-slate-500 block">GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="mt-5">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-2 text-slate-900" style={{ borderColor: accentColor + '30' }}>Skills</h2>
          <div className="flex flex-wrap gap-2 pt-1 font-sans">
            {skills.map((skill, idx) => (
              <span key={idx} className="text-xs bg-slate-50 text-slate-700 border px-2.5 py-0.5 rounded-md">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications, Languages, Interests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5 border-t pt-4" style={{ borderColor: accentColor + '15' }}>
        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-950">Certifications</h3>
            <ul className="space-y-1.5 font-sans">
              {certifications.map((cert, idx) => (
                <li key={idx} className="text-xs text-slate-700">
                  <span className="font-bold text-slate-900">{cert.name}</span>
                  {cert.issuer && <span className="text-slate-500 text-[10px] block">{cert.issuer} {cert.date ? `| ${cert.date}` : ''}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Languages & Interests */}
        <div className="space-y-4">
          {languages && languages.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-950">Languages</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 font-sans">
                {languages.map((lang, idx) => (
                  <span key={idx} className="text-xs text-slate-700">
                    <strong className="text-slate-900">{lang.name}:</strong> {lang.proficiency}
                  </span>
                ))}
              </div>
            </div>
          )}

          {interests && interests.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-950">Interests</h3>
              <div className="flex flex-wrap gap-1.5 font-sans">
                {interests.map((interest, idx) => (
                  <span key={idx} className="text-xs bg-slate-50 border text-slate-600 px-2 py-0.5 rounded">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// TEMPLATE 2: MODERN (Two columns layout)
// ==========================================
const ModernTemplate = ({ data, accentColor }) => {
  const { personal_info, professional_summary, skills, experience, education, projects, certifications, languages, interests } = data;

  return (
    <div className="flex flex-col md:flex-row min-h-full font-sans text-slate-800 bg-white" style={{ wordBreak: 'break-word' }}>
      {/* Sidebar (Left column) */}
      <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-200/50 p-6 flex flex-col gap-6">
        {/* Profile */}
        <div className="text-center md:text-left">
          {personal_info?.image ? (
            <img
              src={personal_info.image}
              alt={personal_info.full_name}
              className="w-24 h-24 rounded-full mx-auto md:mx-0 object-cover border-2 shadow-sm mb-4"
              style={{ borderColor: accentColor }}
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold shadow-sm mb-4 mx-auto md:mx-0" style={{ backgroundColor: accentColor }}>
              {personal_info?.full_name?.[0] || 'U'}
            </div>
          )}
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{personal_info?.full_name || 'Your Name'}</h1>
          <p className="text-xs font-bold mt-1.5" style={{ color: accentColor }}>{personal_info?.profession || 'Profession Title'}</p>
        </div>

        {/* Contacts */}
        <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-200/60 pt-4">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Contact Details</h3>
          {personal_info?.email && (
            <p className="flex items-center gap-2 truncate">
              <Mail size={13} className="shrink-0" style={{ color: accentColor }} /> {personal_info.email}
            </p>
          )}
          {personal_info?.phone && (
            <p className="flex items-center gap-2">
              <Phone size={13} className="shrink-0" style={{ color: accentColor }} /> {personal_info.phone}
            </p>
          )}
          {personal_info?.location && (
            <p className="flex items-center gap-2">
              <MapPin size={13} className="shrink-0" style={{ color: accentColor }} /> {personal_info.location}
            </p>
          )}
          {personal_info?.linkedin && (
            <p className="flex items-center gap-2 truncate">
              <Linkedin size={13} className="shrink-0" style={{ color: accentColor }} /> {personal_info.linkedin}
            </p>
          )}
        </div>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div className="border-t border-slate-200/60 pt-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Key Competencies</h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, idx) => (
                <span key={idx} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div className="border-t border-slate-200/60 pt-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Languages</h3>
            <div className="space-y-1.5">
              {languages.map((lang, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800">{lang.name}</span>
                  <span className="text-slate-500 italic text-[10px]">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {interests && interests.length > 0 && (
          <div className="border-t border-slate-200/60 pt-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Interests</h3>
            <div className="flex flex-wrap gap-1">
              {interests.map((interest, idx) => (
                <span key={idx} className="text-[10px] text-slate-600 bg-slate-200/50 px-2 py-0.5 rounded">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Area (Right column) */}
      <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">
        {/* Summary */}
        {professional_summary && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: accentColor }}>Profile Summary</h2>
            <p className="text-xs text-slate-700 leading-relaxed">{professional_summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider mb-3.5" style={{ color: accentColor }}>Professional Experience</h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="relative pl-4 border-l border-slate-200">
                  {/* Dot */}
                  <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border bg-white" style={{ borderColor: accentColor }}></span>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{exp.position}</h3>
                      <p className="text-[11px] text-slate-500 font-semibold">{exp.company}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {exp.start_date} – {exp.end_date || 'Present'}
                    </span>
                  </div>
                  {exp.description && <p className="text-xs text-slate-600 mt-1.5 leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider mb-3.5" style={{ color: accentColor }}>Featured Projects</h2>
            <div className="space-y-3">
              {projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">{proj.name}</h3>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noreferrer" className="text-[10px] underline font-semibold flex items-center gap-0.5" style={{ color: accentColor }}>
                        View Link
                      </a>
                    )}
                  </div>
                  {proj.description && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{proj.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: accentColor }}>Academic History</h2>
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{edu.institution}</h4>
                    <p className="text-slate-600 text-[11px]">{edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">{edu.graduation_date}</span>
                    {edu.gpa && <span className="text-[10px] text-slate-500 font-medium block">GPA: {edu.gpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider mb-2.5" style={{ color: accentColor }}>Certifications & Awards</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {certifications.map((cert, idx) => (
                <li key={idx} className="text-xs bg-slate-50 border border-slate-100 rounded-lg p-2">
                  <p className="font-bold text-slate-900 line-clamp-1">{cert.name}</p>
                  {cert.issuer && <p className="text-slate-500 text-[10px] mt-0.5">{cert.issuer} {cert.date ? `(${cert.date})` : ''}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// TEMPLATE 3: PROFESSIONAL (Clean corporate)
// ==========================================
const ProfessionalTemplate = ({ data, accentColor }) => {
  const { personal_info, professional_summary, skills, experience, education, projects, certifications, languages, interests } = data;

  return (
    <div className="p-8 font-sans text-slate-800 bg-white min-h-full leading-relaxed" style={{ wordBreak: 'break-word' }}>
      {/* Header Layout */}
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start border-b pb-5 mb-5 border-slate-200">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{personal_info?.full_name || 'Your Name'}</h1>
          <p className="text-sm font-bold mt-1 uppercase tracking-wider" style={{ color: accentColor }}>{personal_info?.profession || 'Profession Title'}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col items-center sm:items-end gap-1.5 text-xs text-slate-600">
          {personal_info?.email && <span className="flex items-center gap-1">{personal_info.email} <Mail size={12} style={{ color: accentColor }} /></span>}
          {personal_info?.phone && <span className="flex items-center gap-1">{personal_info.phone} <Phone size={12} style={{ color: accentColor }} /></span>}
          {personal_info?.location && <span className="flex items-center gap-1">{personal_info.location} <MapPin size={12} style={{ color: accentColor }} /></span>}
          {personal_info?.linkedin && <span className="flex items-center gap-1">{personal_info.linkedin} <Linkedin size={12} style={{ color: accentColor }} /></span>}
        </div>
      </div>

      {/* Summary */}
      {professional_summary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-l-4 pl-2.5 mb-2.5" style={{ borderColor: accentColor }}>Executive Summary</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">{professional_summary}</p>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-l-4 pl-2.5 mb-2.5" style={{ borderColor: accentColor }}>Core Expertise</h2>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {skills.map((skill, idx) => (
              <span key={idx} className="text-xs bg-slate-55 border px-2.5 py-0.5 rounded text-slate-700 border-slate-200">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-l-4 pl-2.5 mb-3.5" style={{ borderColor: accentColor }}>Work Experience</h2>
          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-xs font-bold text-slate-900">{exp.position} <span className="font-normal text-slate-400">|</span> <span className="text-slate-500 font-semibold">{exp.company}</span></h3>
                  <span className="text-[10px] text-slate-400 font-semibold">{exp.start_date} – {exp.end_date || 'Present'}</span>
                </div>
                {exp.description && <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-l-4 pl-2.5 mb-3.5" style={{ borderColor: accentColor }}>Key Projects</h2>
          <div className="space-y-3">
            {projects.map((proj, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-slate-900">{proj.name}</h3>
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noreferrer" className="text-[10px] underline font-semibold" style={{ color: accentColor }}>
                      View Project
                    </a>
                  )}
                </div>
                {proj.description && <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{proj.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-l-4 pl-2.5 mb-3" style={{ borderColor: accentColor }}>Education</h2>
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs">
                <div>
                  <h3 className="font-bold text-slate-900">{edu.institution}</h3>
                  <p className="text-slate-600 text-[11px] font-medium">{edu.degree} in {edu.field_of_study}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block">{edu.graduation_date}</span>
                  {edu.gpa && <span className="text-[10px] text-slate-500 font-semibold block">GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certs, Langs, Interests */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 border-t pt-4 border-slate-100">
        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-900 mb-2.5">Certifications</h3>
            <ul className="space-y-2">
              {certifications.map((cert, idx) => (
                <li key={idx} className="text-xs">
                  <span className="font-bold text-slate-800">{cert.name}</span>
                  {cert.issuer && <span className="text-slate-400 text-[10px] ml-1.5">({cert.issuer} {cert.date ? `- ${cert.date}` : ''})</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Languages & Interests */}
        <div className="space-y-4">
          {languages && languages.length > 0 && (
            <div>
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-900 mb-2.5">Languages</h3>
              <ul className="space-y-1">
                {languages.map((lang, idx) => (
                  <li key={idx} className="text-xs text-slate-700">
                    <strong className="text-slate-900">{lang.name}:</strong> {lang.proficiency}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {interests && interests.length > 0 && (
            <div>
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-900 mb-2.5">Interests</h3>
              <p className="text-xs text-slate-600 flex flex-wrap gap-1">
                {interests.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// TEMPLATE 4: CREATIVE (Trendy and bold)
// ==========================================
const CreativeTemplate = ({ data, accentColor }) => {
  const { personal_info, professional_summary, skills, experience, education, projects, certifications, languages, interests } = data;

  return (
    <div className="font-sans text-slate-800 bg-white min-h-full flex flex-col" style={{ wordBreak: 'break-word' }}>
      {/* Top Banner Header */}
      <div className="p-8 text-white flex flex-col sm:flex-row items-center gap-6 shadow-inner" style={{ backgroundColor: accentColor }}>
        {personal_info?.image ? (
          <img
            src={personal_info.image}
            alt={personal_info.full_name}
            className="w-24 h-24 rounded-2xl object-cover border-4 border-white/30 shadow-lg"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-4xl font-black shadow-lg">
            {personal_info?.full_name?.[0] || 'U'}
          </div>
        )}
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-3.5xl font-black tracking-tight leading-none">{personal_info?.full_name || 'Your Name'}</h1>
          <p className="text-sm font-semibold uppercase tracking-widest text-white/95 mt-2">{personal_info?.profession || 'Profession Title'}</p>
          
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 mt-4 text-[11px] text-white/90">
            {personal_info?.email && <span>{personal_info.email}</span>}
            {personal_info?.phone && <span>• {personal_info.phone}</span>}
            {personal_info?.location && <span>• {personal_info.location}</span>}
            {personal_info?.linkedin && <span>• {personal_info.linkedin}</span>}
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
        {/* Main Side */}
        <div className="md:col-span-2 space-y-6">
          {/* Summary */}
          {professional_summary && (
            <div>
              <h2 className="text-md font-bold tracking-tight mb-2 border-b-2 pb-1 inline-block" style={{ borderColor: accentColor }}>About Me</h2>
              <p className="text-xs text-slate-650 leading-relaxed">{professional_summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <div>
              <h2 className="text-md font-bold tracking-tight mb-3 border-b-2 pb-1 inline-block" style={{ borderColor: accentColor }}>Journey & Career</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="group relative">
                    <h3 className="text-xs font-bold text-slate-900">{exp.position}</h3>
                    <div className="flex justify-between items-baseline mt-0.5">
                      <span className="text-[11px] font-bold" style={{ color: accentColor }}>{exp.company}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{exp.start_date} – {exp.end_date || 'Present'}</span>
                    </div>
                    {exp.description && <p className="text-xs text-slate-600 mt-1.5 leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div>
              <h2 className="text-md font-bold tracking-tight mb-3 border-b-2 pb-1 inline-block" style={{ borderColor: accentColor }}>Portfolio Work</h2>
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 hover:scale-[1.01] transition-transform">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-900">{proj.name}</h4>
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noreferrer" className="text-[10px] font-bold px-2 py-0.5 bg-white border rounded shadow-sm" style={{ color: accentColor }}>
                          Link
                        </a>
                      )}
                    </div>
                    {proj.description && <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{proj.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Side */}
        <div className="space-y-6">
          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-md font-bold tracking-tight mb-3.5 border-b-2 pb-1 inline-block" style={{ borderColor: accentColor }}>Superpowers</h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
                  <span key={idx} className="text-xs font-medium px-2.5 py-1 rounded-xl text-white shadow-sm" style={{ backgroundColor: accentColor }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div>
              <h2 className="text-md font-bold tracking-tight mb-3 border-b-2 pb-1 inline-block" style={{ borderColor: accentColor }}>Education</h2>
              <div className="space-y-3.5">
                {education.map((edu, idx) => (
                  <div key={idx} className="text-xs">
                    <h4 className="font-bold text-slate-900">{edu.institution}</h4>
                    <p className="text-slate-500 text-[10px] mt-0.5">{edu.degree}</p>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{edu.graduation_date} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div>
              <h2 className="text-md font-bold tracking-tight mb-3 border-b-2 pb-1 inline-block" style={{ borderColor: accentColor }}>Achievements</h2>
              <ul className="space-y-2">
                {certifications.map((cert, idx) => (
                  <li key={idx} className="text-xs flex gap-1.5 items-start">
                    <span className="mt-0.5 text-orange-500 font-bold">★</span>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{cert.name}</p>
                      {cert.issuer && <p className="text-[10px] text-slate-400 mt-0.5">{cert.issuer}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div>
              <h2 className="text-md font-bold tracking-tight mb-3 border-b-2 pb-1 inline-block" style={{ borderColor: accentColor }}>Languages</h2>
              <div className="space-y-1 text-xs">
                {languages.map((lang, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="font-semibold text-slate-800">{lang.name}</span>
                    <span className="text-slate-500 italic">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {interests && interests.length > 0 && (
            <div>
              <h2 className="text-md font-bold tracking-tight mb-2 border-b-2 pb-1 inline-block" style={{ borderColor: accentColor }}>Interests</h2>
              <p className="text-xs text-slate-500 italic">
                {interests.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN TEMPLATE CONTAINER WITH PRINT STYLES
// ==========================================
export const ResumeTemplates = ({ templateName = 'Classic', data, accentColor = '#f97316' }) => {
  if (!data) return <div className="p-8 text-center text-slate-400">No data available</div>;

  const renderTemplate = () => {
    switch (templateName) {
      case 'Classic':
        return <ClassicTemplate data={data} accentColor={accentColor} />;
      case 'Modern':
        return <ModernTemplate data={data} accentColor={accentColor} />;
      case 'Professional':
        return <ProfessionalTemplate data={data} accentColor={accentColor} />;
      case 'Creative':
        return <CreativeTemplate data={data} accentColor={accentColor} />;
      default:
        return <ClassicTemplate data={data} accentColor={accentColor} />;
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* Inject Print CSS Stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
          html, body {
            height: 100%;
            margin: 0 !important; 
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
          }
        }
      `}} />

      {/* Wrapping Print Area Container */}
      <div id="print-area" className="w-full h-full min-h-full bg-white shadow-sm overflow-y-auto">
        {renderTemplate()}
      </div>
    </div>
  );
};
export default ResumeTemplates;
