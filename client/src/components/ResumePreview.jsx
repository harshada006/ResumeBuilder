import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Calendar, Globe, Award, Briefcase, GraduationCap, FolderGit } from 'lucide-react';

const ResumePreview = ({ resume }) => {
  if (!resume) return <div className="text-slate-400 text-center py-10">No resume data available</div>;

  const {
    title = 'Untitled Resume',
    template = 'Classic',
    accent_color = '#3b82f6',
    professional_summary = '',
    skills = [],
    personal_info = {},
    experience = [],
    projects = [],
    education = [],
    certifications = [],
    languages = [],
    interests = []
  } = resume;

  const {
    full_name = '',
    email = '',
    profession = '',
    phone = '',
    location = '',
    linkedin = '',
    image = ''
  } = personal_info;

  // Custom styling elements based on accent color
  const primaryTextColor = { color: accent_color };
  const primaryBgColor = { backgroundColor: accent_color };
  const primaryBorderColor = { borderColor: accent_color };

  // ==========================================
  // TEMPLATE 1: CLASSIC (Centered, Serif, Clean)
  // ==========================================
  const renderClassic = () => (
    <div className="font-serif p-8 text-slate-800 bg-white min-h-full leading-normal text-sm antialiased select-text">
      {/* Header */}
      <div className="text-center pb-5 border-b border-slate-200">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">{full_name || 'Your Full Name'}</h1>
        <p className="text-base font-semibold italic text-slate-600 mb-3">{profession || 'Your Profession'}</p>
        
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
          {email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {email}
            </span>
          )}
          {phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {phone}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {location}
            </span>
          )}
          {linkedin && (
            <span className="flex items-center gap-1">
              <Linkedin className="w-3.5 h-3.5 text-slate-400" />
              {linkedin}
            </span>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="mt-5 space-y-6">
        {/* Profile Image (if uploaded) */}
        {image && (
          <div className="flex justify-center mb-4">
            <img src={image} alt={full_name} className="w-24 h-24 rounded-full object-cover border-2 shadow-sm" style={primaryBorderColor} />
          </div>
        )}

        {/* Summary */}
        {professional_summary && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-1.5 border-b-2 pb-0.5" style={{ ...primaryTextColor, ...primaryBorderColor }}>
              Professional Summary
            </h2>
            <p className="text-slate-700 text-justify text-xs leading-relaxed">{professional_summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b-2 pb-0.5" style={{ ...primaryTextColor, ...primaryBorderColor }}>
              Work Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-900 mb-0.5">
                    <span>{exp.position || 'Position'} at {exp.company || 'Company'}</span>
                    <span className="text-slate-500 font-normal">{exp.start_date || 'Start'} - {exp.end_date || 'Present'}</span>
                  </div>
                  <p className="text-slate-700 text-justify leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b-2 pb-0.5" style={{ ...primaryTextColor, ...primaryBorderColor }}>
              Key Projects
            </h2>
            <div className="space-y-3">
              {projects.map((proj, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-900 mb-0.5">
                    <span>{proj.name || 'Project Name'}</span>
                    {proj.link && <span className="text-slate-500 font-normal text-[10px] underline">{proj.link}</span>}
                  </div>
                  <p className="text-slate-700 leading-relaxed">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two column split for minor items */}
        <div className="grid grid-cols-2 gap-6">
          {/* Education */}
          {education && education.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b-2 pb-0.5" style={{ ...primaryTextColor, ...primaryBorderColor }}>
                Education
              </h2>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={idx} className="text-xs">
                    <p className="font-bold text-slate-900">{edu.degree || 'Degree'} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}</p>
                    <p className="text-slate-700">{edu.institution || 'Institution'}</p>
                    <div className="flex justify-between text-slate-500 text-[10px] mt-0.5">
                      <span>Graduated: {edu.graduation_date || 'N/A'}</span>
                      {edu.gpa && <span>GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Right Side Column (Skills & Certifications) */}
          <div className="space-y-5">
            {/* Skills */}
            {skills && skills.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b-2 pb-0.5" style={{ ...primaryTextColor, ...primaryBorderColor }}>
                  Skills
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-800 text-[10px] px-2 py-0.5 rounded font-medium border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications && certifications.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b-2 pb-0.5" style={{ ...primaryTextColor, ...primaryBorderColor }}>
                  Certifications
                </h2>
                <div className="space-y-1.5 text-xs">
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-1">
                      <div>
                        <p className="font-semibold text-slate-850">{cert.name}</p>
                        <p className="text-[10px] text-slate-500">{cert.issuer}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{cert.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b-2 pb-0.5" style={{ ...primaryTextColor, ...primaryBorderColor }}>
                  Languages
                </h2>
                <p className="text-xs text-slate-700">
                  {languages.map((l, i) => `${l.name} (${l.proficiency || 'Conversational'})`).join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // TEMPLATE 2: MODERN (Sidebar Column Layout)
  // ==========================================
  const renderModern = () => (
    <div className="font-sans p-0 text-slate-800 bg-white min-h-full leading-normal text-xs grid grid-cols-12 select-text antialiased">
      {/* Sidebar (4 cols) */}
      <div className="col-span-4 bg-slate-900 text-slate-200 p-6 flex flex-col gap-6">
        {/* Profile Image */}
        <div className="flex flex-col items-center text-center">
          {image ? (
            <img src={image} alt={full_name} className="w-24 h-24 rounded-full object-cover border-4 mb-4" style={primaryBorderColor} />
          ) : (
            <div className="w-20 h-20 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-3xl mb-4 border-2 border-slate-700">
              {full_name ? full_name[0] : 'U'}
            </div>
          )}
          <h2 className="text-lg font-bold text-white leading-tight">{full_name || 'Your Full Name'}</h2>
          <p className="text-xs text-orange-400 font-medium mt-1">{profession || 'Your Profession'}</p>
        </div>

        {/* Contact Info */}
        <div className="space-y-3.5 border-t border-slate-800 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-1" style={primaryTextColor}>Contact</h3>
          {email && (
            <div className="flex items-center gap-2 text-[10px]">
              <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-[10px]">
              <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{phone}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 text-[10px]">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{location}</span>
            </div>
          )}
          {linkedin && (
            <div className="flex items-center gap-2 text-[10px]">
              <Linkedin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{linkedin}</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-1" style={primaryTextColor}>Skills</h3>
            <div className="flex flex-wrap gap-1">
              {skills.map((skill, idx) => (
                <span key={idx} className="bg-slate-800 text-slate-200 text-[9px] px-2 py-0.5 rounded font-medium border border-slate-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-1" style={primaryTextColor}>Languages</h3>
            <div className="space-y-1.5">
              {languages.map((l, i) => (
                <div key={i} className="text-[10px] flex justify-between">
                  <span className="font-semibold text-slate-350">{l.name}</span>
                  <span className="text-slate-500 italic">{l.proficiency || 'Conversational'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content (8 cols) */}
      <div className="col-span-8 p-6 space-y-5">
        {/* Professional Summary */}
        {professional_summary && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider pb-1 border-b-2" style={{ ...primaryTextColor, ...primaryBorderColor }}>
              Profile Summary
            </h3>
            <p className="text-slate-650 text-justify leading-relaxed text-[11px]">{professional_summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider pb-1 border-b-2" style={{ ...primaryTextColor, ...primaryBorderColor }}>
              Professional Experience
            </h3>
            <div className="space-y-3">
              {experience.map((exp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-baseline font-bold text-slate-900 text-[11px]">
                    <span>{exp.position} at <span className="font-bold" style={primaryTextColor}>{exp.company}</span></span>
                    <span className="text-slate-400 font-medium text-[10px]">{exp.start_date} - {exp.end_date || 'Present'}</span>
                  </div>
                  <p className="text-slate-600 text-justify text-[10px] leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider pb-1 border-b-2" style={{ ...primaryTextColor, ...primaryBorderColor }}>
              Projects
            </h3>
            <div className="space-y-2.5">
              {projects.map((proj, idx) => (
                <div key={idx} className="text-[11px]">
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <span>{proj.name}</span>
                    {proj.link && <span className="text-[9px] text-slate-400 hover:text-slate-600 underline font-normal">{proj.link}</span>}
                  </div>
                  <p className="text-slate-600 text-[10px] leading-relaxed mt-0.5">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider pb-1 border-b-2" style={{ ...primaryTextColor, ...primaryBorderColor }}>
              Education
            </h3>
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={idx} className="text-[11px] flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-950">{edu.degree} in {edu.field_of_study}</p>
                    <p className="text-slate-600 text-[10px]">{edu.institution}</p>
                  </div>
                  <div className="text-right text-[10px] text-slate-400 font-medium">
                    <p>{edu.graduation_date}</p>
                    {edu.gpa && <p className="text-[9px] text-slate-500">GPA: {edu.gpa}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider pb-1 border-b-2" style={{ ...primaryTextColor, ...primaryBorderColor }}>
              Awards & Certifications
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {certifications.map((cert, idx) => (
                <div key={idx} className="text-[10px] flex justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{cert.name}</p>
                    <p className="text-[9px] text-slate-400">{cert.issuer}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 italic">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ==========================================
  // TEMPLATE 3: PROFESSIONAL (Top Accent block, Clean grid)
  // ==========================================
  const renderProfessional = () => (
    <div className="font-sans p-8 text-slate-800 bg-white min-h-full leading-normal text-xs select-text antialiased">
      {/* Header with Dark/Color Accent Block */}
      <div className="p-6 rounded-xl text-white flex justify-between items-center mb-6" style={primaryBgColor}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{full_name || 'Your Full Name'}</h1>
          <p className="text-sm font-semibold opacity-90 mt-0.5">{profession || 'Your Profession'}</p>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-[10px] opacity-80">
            {email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {email}</span>}
            {phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {phone}</span>}
            {location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {location}</span>}
            {linkedin && <span className="flex items-center gap-1"><Linkedin className="w-3.5 h-3.5" /> {linkedin}</span>}
          </div>
        </div>

        {image && (
          <img src={image} alt={full_name} className="w-20 h-20 rounded-full object-cover border-4 border-white/50" />
        )}
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left column - 8 grid units */}
        <div className="col-span-8 space-y-6">
          {/* Summary */}
          {professional_summary && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1" style={primaryBorderColor}>Executive Summary</h3>
              <p className="text-slate-600 text-justify leading-relaxed text-[11px]">{professional_summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1" style={primaryBorderColor}>Employment History</h3>
              <div className="space-y-3.5">
                {experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                      <span>{exp.position} <span className="font-normal text-slate-400">at</span> {exp.company}</span>
                      <span className="text-slate-450 font-normal text-[10px]">{exp.start_date} - {exp.end_date || 'Present'}</span>
                    </div>
                    <p className="text-slate-600 text-justify text-[10px] leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1" style={primaryBorderColor}>Key Engagements & Projects</h3>
              <div className="space-y-3">
                {projects.map((proj, idx) => (
                  <div key={idx} className="text-[11px]">
                    <div className="flex justify-between items-center font-bold text-slate-800">
                      <span>{proj.name}</span>
                      {proj.link && <span className="text-[9px] text-slate-400 font-normal underline">{proj.link}</span>}
                    </div>
                    <p className="text-slate-600 text-[10px] leading-relaxed mt-0.5">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column - 4 grid units */}
        <div className="col-span-4 space-y-6">
          {/* Skills */}
          {skills && skills.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1" style={primaryBorderColor}>Competencies</h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
                  <span key={idx} className="bg-slate-50 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium border border-slate-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1" style={primaryBorderColor}>Education</h3>
              <div className="space-y-2.5">
                {education.map((edu, idx) => (
                  <div key={idx} className="text-[10px]">
                    <p className="font-bold text-slate-850">{edu.degree}</p>
                    <p className="text-slate-600">{edu.institution}</p>
                    <p className="text-slate-400 text-[9px] mt-0.5">{edu.graduation_date} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1" style={primaryBorderColor}>Credentials</h3>
              <div className="space-y-2 text-[10px]">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="leading-tight">
                    <p className="font-semibold text-slate-800">{cert.name}</p>
                    <p className="text-[9px] text-slate-400">{cert.issuer} ({cert.date})</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1" style={primaryBorderColor}>Languages</h3>
              <div className="space-y-1 text-[10px] text-slate-650">
                {languages.map((l, i) => (
                  <p key={i}><span className="font-semibold text-slate-800">{l.name}</span>: {l.proficiency || 'Conversational'}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ==========================================
  // TEMPLATE 4: CREATIVE (Stylized Header, Clean, Pills)
  // ==========================================
  const renderCreative = () => (
    <div className="font-sans p-6 text-slate-800 bg-white min-h-full leading-normal text-xs select-text antialiased">
      {/* Decorative colored strip */}
      <div className="h-2 rounded-t-lg -mx-6 -mt-6 mb-6" style={primaryBgColor}></div>

      {/* Styled Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b-2 border-dashed border-slate-100 mb-6">
        <div className="flex items-center gap-4">
          {image ? (
            <img src={image} alt={full_name} className="w-20 h-20 rounded-full object-cover border-2 shadow" style={primaryBorderColor} />
          ) : (
            <div className="w-16 h-16 rounded-full text-white flex items-center justify-center font-black text-2xl shadow" style={primaryBgColor}>
              {full_name ? full_name[0] : 'U'}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{full_name || 'Your Full Name'}</h1>
            <p className="text-sm font-bold tracking-wide mt-0.5" style={primaryTextColor}>{profession || 'Your Profession'}</p>
          </div>
        </div>

        {/* Contact Block Card */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5 text-[10px] text-slate-600 max-w-xs w-full">
          {email && <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {email}</p>}
          {phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {phone}</p>}
          {location && <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {location}</p>}
          {linkedin && <p className="flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5 text-slate-400" /> {linkedin}</p>}
        </div>
      </div>

      {/* 2 Column Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Side (Skills, Edu, Lang) */}
        <div className="col-span-4 space-y-6">
          {/* Skills */}
          {skills && skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-4 rounded-full" style={primaryBgColor}></span>
                <span>My Superpowers</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
                  <span key={idx} className="text-[10px] px-2.5 py-1 rounded-full text-white font-bold tracking-tight shadow-sm" style={primaryBgColor}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-4 rounded-full" style={primaryBgColor}></span>
                <span>Education</span>
              </h3>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={idx} className="text-[10px] border-l-2 pl-3 py-0.5 space-y-0.5" style={primaryBorderColor}>
                    <p className="font-bold text-slate-850 leading-tight">{edu.degree} in {edu.field_of_study}</p>
                    <p className="text-slate-655">{edu.institution}</p>
                    <p className="text-[9px] text-slate-400 font-semibold">{edu.graduation_date} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-4 rounded-full" style={primaryBgColor}></span>
                <span>Languages</span>
              </h3>
              <div className="space-y-2">
                {languages.map((l, i) => (
                  <div key={i} className="text-[10px]">
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>{l.name}</span>
                      <span className="text-slate-500 font-normal">{l.proficiency || 'Conversational'}</span>
                    </div>
                    {/* Progress Bar for Visual Interest */}
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: l.proficiency?.toLowerCase()?.includes('fluent') || l.proficiency?.toLowerCase()?.includes('native') ? '100%' : 
                                 l.proficiency?.toLowerCase()?.includes('professional') ? '80%' : 
                                 l.proficiency?.toLowerCase()?.includes('intermediate') ? '60%' : '40%',
                          ...primaryBgColor
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side (Summary, Exp, Projects) */}
        <div className="col-span-8 space-y-6">
          {/* Summary */}
          {professional_summary && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-4 rounded-full" style={primaryBgColor}></span>
                <span>Professional Story</span>
              </h3>
              <p className="text-slate-600 text-justify leading-relaxed text-[11px]">{professional_summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <div className="space-y-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-4 rounded-full" style={primaryBgColor}></span>
                <span>Journey & Roles</span>
              </h3>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1 relative pl-4 border-l border-slate-150">
                    {/* Bullet dot */}
                    <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-white" style={primaryBgColor}></span>
                    <div className="flex justify-between items-baseline font-bold text-slate-800 text-[11px]">
                      <span>{exp.position} <span className="font-medium text-slate-400">@</span> {exp.company}</span>
                      <span className="text-slate-450 font-normal text-[10px]">{exp.start_date} - {exp.end_date || 'Present'}</span>
                    </div>
                    <p className="text-slate-600 text-justify text-[10px] leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div className="space-y-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-4 rounded-full" style={primaryBgColor}></span>
                <span>Cool Stuff Built</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-3 border border-slate-100 rounded-xl bg-slate-50/25 flex flex-col justify-between">
                    <div>
                      <p className="font-bold text-slate-800 text-[11px]">{proj.name}</p>
                      <p className="text-slate-550 text-[10px] leading-relaxed mt-1 text-justify">{proj.description}</p>
                    </div>
                    {proj.link && (
                      <a 
                        href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] mt-2.5 font-bold flex items-center gap-0.5 hover:underline"
                        style={primaryTextColor}
                      >
                        <Globe className="w-3 h-3" />
                        <span>Visit Project</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  switch (template) {
    case 'Modern':
      return renderModern();
    case 'Professional':
      return renderProfessional();
    case 'Creative':
      return renderCreative();
    case 'Classic':
    default:
      return renderClassic();
  }
};

export default ResumePreview;
