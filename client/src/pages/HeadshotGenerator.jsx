import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Copy, ExternalLink, Save, Check, Trash2, Info, BookOpen, ChevronRight } from 'lucide-react';

const HeadshotGenerator = () => {
  const { showToast } = useAuth();
  
  // Customization States
  const [profession, setProfession] = useState('Software Engineer');
  const [seniority, setSeniority] = useState('Mid Level');
  const [attire, setAttire] = useState('Business Suit');
  const [background, setBackground] = useState('Corporate Office');
  const [customInstructions, setCustomInstructions] = useState('');
  const [savedPrompts, setSavedPrompts] = useState([]);

  // Available Professions
  const professions = [
    'Software Engineer',
    'Senior Software Engineer',
    'Data Scientist',
    'Product Manager',
    'Consultant',
    'Startup Founder',
    'Corporate Executive'
  ];

  // Available Seniority Levels
  const seniorityLevels = [
    'Student',
    'Entry Level',
    'Mid Level',
    'Senior Professional',
    'Manager',
    'Director',
    'Executive'
  ];

  // Attire Options mapping
  const attireOptions = {
    'Business Suit': 'Tailored Business Suit & Tie',
    'Formal Blazer': 'Formal Blazer & Open Shirt',
    'Smart Casual': 'Crewneck Sweater & Collared Shirt',
    'Executive Style': 'Pinstripe Suit & Premium Tie'
  };

  // Background Options mapping
  const backgroundOptions = {
    'Corporate Office': 'Corporate Office with window lighting and blurred workstations',
    'Premium Studio': 'Premium Portrait Studio backdrop with soft spotlight',
    'Modern Workspace': 'Modern Open Workspace with green plant accents and warm natural lighting',
    'Neutral Professional': 'Neutral Studio Backdrop with soft depth-of-field blur'
  };

  useEffect(() => {
    // Load saved prompts from localStorage
    const saved = localStorage.getItem('saved_headshot_prompts');
    if (saved) {
      try {
        setSavedPrompts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved prompts:', e);
      }
    }
  }, []);

  // Generate prompt text dynamically based on selected presets
  const getGeminiPrompt = () => {
    const templates = {
      'Software Engineer': "Transform my uploaded photo into a premium corporate headshot for a Software Engineer. Preserve my exact facial features, skin tone, hairstyle, and identity. Replace my casual clothing with a modern navy blue business suit, white shirt, and a professional tie. Use a clean corporate office background with subtle technology elements. Symmetrical composition, head and shoulders framing, approachable smile, ultra-realistic details, and high-end studio lighting.",
      'Senior Software Engineer': "Transform my uploaded photo into a premium corporate headshot for a Senior Software Engineer. Preserve my exact facial features, skin tone, hairstyle, and identity. Replace my casual clothing with a high-end navy blue or charcoal business suit, white dress shirt, and a professional silk tie. Symmetrical composition, confident and approachable smile, polished grooming, and high-end studio lighting. Background is a clean, modern corporate workspace with blurred computer monitors showing abstract developer code layouts.",
      'Data Scientist': "Transform my uploaded photo into a premium professional corporate headshot for a Data Scientist. Preserve my exact facial features, skin tone, hairstyle, and identity. Replace my casual clothing with a dark charcoal business suit, light blue dress shirt, and a clean professional tie. Symmetrical composition, head and shoulders framing, confident expression, ultra-realistic details. Background is a modern data-driven office with soft bokeh showing blurred graphical screens and charts.",
      'Product Manager': "Transform this casual photo into a premium professional corporate headshot for a Product Manager. Preserve my exact facial features, skin tone, hairstyle, and identity. Replace my casual clothing with a formal blazer, a crisp white open-collar dress shirt (no tie), and elegant professional styling. Symmetrical composition, head and shoulders framing, and a friendly, confident, and approachable smile. Background is a bright modern collaborative workspace with soft depth-of-field blur.",
      'Consultant': "Transform this casual photo into a premium professional corporate headshot for a Consultant. Preserve my exact facial features, skin tone, hairstyle, and identity. Replace my casual clothing with a high-end grey pinstripe suit, white shirt, and a premium silk tie. Symmetrical composition, head and shoulders framing, and a trustworthy, confident, and approachable expression under realistic studio lighting. Background is a professional neutral boardroom with soft depth-of-field blur.",
      'Corporate Executive': "Transform this casual photo into a premium professional corporate headshot for a Corporate Executive. Preserve my exact facial features, skin tone, hairstyle, and identity. Replace my casual clothing with a custom black executive suit, white dress shirt, and a burgundy silk tie. Symmetrical composition, head and shoulders framing, confident leadership posture, and a strong professional smile. Background is a premium executive boardroom with deep bokeh blur.",
      'Startup Founder': "Transform this casual photo into a premium professional corporate headshot for a Startup Founder. Preserve my exact facial features, skin tone, hairstyle, and identity. Replace my casual clothing with smart casual attire, a premium dark crewneck sweater worn over a collared shirt. Symmetrical composition, head and shoulders framing, and a confident, vision-driven, and approachable smile. Background is a vibrant open startup office with warm lighting and blurred green plants."
    };

    let basePrompt = templates[profession] || `Transform this casual photo into a premium professional corporate headshot for a ${profession} (${seniority} level). Preserve my exact facial features, skin tone, hairstyle, and identity. Replace my casual clothing with ${attireOptions[attire].toLowerCase()}. Symmetrical composition, head and shoulders framing, natural expression with a confident and approachable smile, and high-end studio lighting. Background is a ${backgroundOptions[background].toLowerCase()} with a soft depth-of-field blur.`;

    if (customInstructions.trim()) {
      basePrompt += ` Additional styling details: ${customInstructions.trim()}`;
    }

    return basePrompt;
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(getGeminiPrompt());
    showToast('Prompt copied to clipboard!', 'success');
  };

  const handleOpenGemini = () => {
    window.open('https://gemini.google.com/', '_blank');
  };

  const handleSavePrompt = () => {
    const newSaved = [
      {
        id: Date.now(),
        profession,
        seniority,
        attire,
        background,
        customInstructions,
        prompt: getGeminiPrompt(),
        date: new Date().toLocaleDateString()
      },
      ...savedPrompts
    ];
    setSavedPrompts(newSaved);
    localStorage.setItem('saved_headshot_prompts', JSON.stringify(newSaved));
    showToast('Prompt saved locally!', 'success');
  };

  const handleDeleteSaved = (id) => {
    const updated = savedPrompts.filter(item => item.id !== id);
    setSavedPrompts(updated);
    localStorage.setItem('saved_headshot_prompts', JSON.stringify(updated));
    showToast('Saved prompt deleted', 'info');
  };

  const handleLoadSaved = (item) => {
    setProfession(item.profession);
    setSeniority(item.seniority);
    setAttire(item.attire);
    setBackground(item.background);
    setCustomInstructions(item.customInstructions || '');
    showToast(`Loaded saved prompt for ${item.profession}`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Header Banner */}
      <div className="mb-8 bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-700/30">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="text-orange-500 fill-orange-500/10" size={28} />
            Gemini AI Headshot Assistant
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
            Generate fine-tuned descriptive AI prompts tailored to your profession. Copy the prompt, open Gemini in a new tab, upload your photo, and let the AI draft a photorealistic LinkedIn corporate portrait.
          </p>
        </div>
        <button
          onClick={handleOpenGemini}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
        >
          Open Google Gemini
          <ExternalLink size={14} />
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Panel: Options Configuration (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/70 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <BookOpen size={18} className="text-orange-500" />
              Configure Portrait Parameters
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Profession Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Target Profession</label>
                <select
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white text-xs text-slate-800"
                >
                  {professions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Seniority Level */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Seniority Tier</label>
                <select
                  value={seniority}
                  onChange={(e) => setSeniority(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white text-xs text-slate-800"
                >
                  {seniorityLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              {/* Custom Attire Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Attire Selection</label>
                <select
                  value={attire}
                  onChange={(e) => setAttire(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white text-xs text-slate-800"
                >
                  {Object.keys(attireOptions).map((a) => (
                    <option key={a} value={a}>{attireOptions[a]}</option>
                  ))}
                </select>
              </div>

              {/* Background Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Backdrop Setting</label>
                <select
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white text-xs text-slate-800"
                >
                  {Object.keys(backgroundOptions).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Instructions */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Custom Style Rules (Optional)</label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Example: Wearing silver-framed glasses, clean-shaven, hair tied back neatly, neutral facial expression..."
                rows={3}
                className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-xs text-slate-800 leading-relaxed resize-none"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
              <Info className="text-orange-500 shrink-0 mt-0.5" size={16} />
              <div className="text-[11px] text-slate-500 leading-relaxed">
                <strong className="text-slate-800">Pro Tip for Google Gemini:</strong> When using Gemini, upload your high-quality casual selfie, paste the generated prompt from this page, and press submit. Gemini will analyze your facial dimensions and render an identical executive headshot using the outfit, posture, and lighting settings defined in the prompt.
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Prompt Preview and Actions (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Prompt Generator Card */}
          <div className="bg-white rounded-3xl border border-slate-200/70 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sparkles size={18} className="text-orange-500" />
              Generated Gemini Prompt
            </h2>

            {/* Prompt Preview Textarea */}
            <div className="relative group">
              <textarea
                readOnly
                value={getGeminiPrompt()}
                rows={10}
                className="w-full p-4 rounded-2xl border border-slate-250/80 outline-none bg-slate-50/50 font-mono text-[11px] text-slate-700 leading-relaxed select-all border-dashed"
              />
              <div className="absolute right-3 top-3 bg-white/90 backdrop-blur-sm border border-slate-150 px-2 py-0.5 rounded text-[9px] text-slate-400 font-bold uppercase tracking-wider pointer-events-none">
                Read-Only Preview
              </div>
            </div>

            {/* Prompt Actions */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleCopyPrompt}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-orange-500/10 cursor-pointer transition-all active:scale-95"
              >
                <Copy size={14} />
                Copy Prompt
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={handleOpenGemini}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                >
                  <ExternalLink size={14} />
                  Open Gemini
                </button>
                <button
                  onClick={handleSavePrompt}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                >
                  <Save size={14} />
                  Save Prompt
                </button>
              </div>
            </div>
          </div>

          {/* Saved Prompts configurations panel */}
          {savedPrompts.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/70 p-6 shadow-sm space-y-4 max-h-[300px] overflow-y-auto">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Saved Prompts</h3>
              <div className="space-y-2">
                {savedPrompts.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group">
                    <div className="cursor-pointer flex-1" onClick={() => handleLoadSaved(item)}>
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        {item.profession}
                        <span className="text-[9px] text-slate-400 font-normal">({item.date})</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {item.attire} • {item.background}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSaved(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Delete saved prompt"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeadshotGenerator;
