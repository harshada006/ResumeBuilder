import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, Download, RefreshCw, Check, Sparkles, Sliders, Image as ImageIcon, Briefcase, Eye, ChevronRight, UserCheck } from 'lucide-react';

const HeadshotGenerator = () => {
  const { apiFetch, showToast } = useAuth();
  
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [loadingResumes, setLoadingResumes] = useState(false);
  
  // Image & Canvas state
  const [uploadedImage, setUploadedImage] = useState(null);
  const [zoom, setZoom] = useState(1.1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);
  
  // Selection States
  const [profession, setProfession] = useState('Software Engineer');
  const [seniority, setSeniority] = useState('Mid Level');
  const [attire, setAttire] = useState('Business Suit');
  const [background, setBackground] = useState('Corporate Office');
  const [filter, setFilter] = useState('Warm Studio');
  
  // Neck blending slider
  const [neckWidth, setNeckWidth] = useState(70); // adjustable neck width to fit different faces
  const [neckHeight, setNeckHeight] = useState(55); // neck vertical alignment
  
  // UI states
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [applying, setApplying] = useState(false);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Available Professions
  const professions = [
    'Software Engineer',
    'Product Manager',
    'Data Scientist',
    'Consultant',
    'Startup Founder',
    'Corporate Executive',
    'Marketing Manager',
    'Doctor',
    'Lawyer',
    'Teacher',
    'Other'
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
    'Business Suit': { name: 'Tailored Business Suit & Tie', color: '#1e293b', shirt: '#ffffff', tie: '#991b1b', cut: 'suit' },
    'Formal Blazer': { name: 'Formal Blazer & Open Shirt', color: '#111827', shirt: '#ffffff', tie: null, cut: 'blazer' },
    'Smart Casual': { name: 'Crewneck Sweater & Cardigan', color: '#374151', shirt: '#e2e8f0', tie: null, cut: 'casual' },
    'Executive Style': { name: 'Pinstripe Suit & Premium Tie', color: '#0f172a', shirt: '#f1f5f9', tie: '#0369a1', cut: 'executive' }
  };

  // Background Options mapping
  const backgroundOptions = {
    'Corporate Office': { type: 'office', colors: ['#e2e8f0', '#cbd5e1'], highlight: 'rgba(251,191,36,0.03)' },
    'Premium Studio': { type: 'studio', colors: ['#475569', '#1e293b'], highlight: 'rgba(59,130,246,0.03)' },
    'Modern Workspace': { type: 'workspace', colors: ['#cbd5e1', '#94a3b8'], highlight: 'rgba(16,185,129,0.02)' },
    'Neutral Professional': { type: 'neutral', colors: ['#e2e8f0', '#475569'], highlight: 'rgba(255,255,255,0.04)' }
  };

  // Filters
  const filtersList = ['Normal', 'Warm Studio', 'Cold Office', 'LinkedIn Blue', 'Noir'];

  useEffect(() => {
    fetchResumes();
  }, []);

  // Redraw canvas on changes
  useEffect(() => {
    if (uploadedImage) {
      drawCanvas();
    }
  }, [uploadedImage, zoom, offsetX, offsetY, rotation, attire, background, filter, neckWidth, neckHeight, profession, seniority]);

  const fetchResumes = async () => {
    try {
      setLoadingResumes(true);
      const res = await apiFetch('/api/user/resumes');
      const data = await res.json();
      if (res.ok) {
        setResumes(data.resumes || []);
        if (data.resumes?.length > 0) {
          setSelectedResumeId(data.resumes[0]._id);
        }
      }
    } catch (err) {
      console.error('Resumes list retrieval failed:', err.message);
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          setUploadedImage(img);
          setZoom(1.1);
          setOffsetX(0);
          setOffsetY(0);
          setRotation(0);
          setGeneratedResult(null);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // High-fidelity Canvas compositing
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const width = 500;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    const bgConfig = backgroundOptions[background];
    const suitConfig = attireOptions[attire];

    // 1. RENDER BACKGROUND WITH SOFT DEPTH-OF-FIELD (BOKEH) & LIGHT BEAMS
    ctx.save();
    if (background === 'Premium Studio') {
      // Base dark radial gradient
      const grad = ctx.createRadialGradient(width/2, height/2, 50, width/2, height/2, width * 0.9);
      grad.addColorStop(0, '#475569');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw mottled studio texture (randomized overlapping soft radial spots)
      ctx.globalAlpha = 0.15;
      const spots = [
        { x: 100, y: 120, r: 150, c: '#64748b' },
        { x: 380, y: 150, r: 180, c: '#475569' },
        { x: 250, y: 350, r: 200, c: '#334155' },
        { x: 150, y: 400, r: 120, c: '#1e293b' },
        { x: 420, y: 380, r: 160, c: '#64748b' }
      ];
      spots.forEach(s => {
        const spotGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
        spotGrad.addColorStop(0, s.c);
        spotGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Diagonal studio spotlight beam
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const beamGrad = ctx.createLinearGradient(0, 0, width, height);
      beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.03)');
      beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width * 0.5, 0);
      ctx.lineTo(width, height * 0.8);
      ctx.lineTo(0, height * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

    } else if (background === 'Corporate Office') {
      // Soft blurred premium office setting
      // Background gradient representing sky/office light
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#f1f5f9');
      grad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Simulated office window frame (blurred rectangles)
      ctx.fillStyle = '#94a3b8';
      ctx.globalAlpha = 0.25;
      ctx.fillRect(50, 0, 45, height); // Column
      ctx.fillRect(0, 180, width, 30); // Window bar
      ctx.fillRect(320, 0, 15, height); // Thin pane frame

      // Soft light flare
      ctx.globalAlpha = 0.4;
      const flare = ctx.createRadialGradient(400, 80, 0, 400, 80, 250);
      flare.addColorStop(0, '#ffffff');
      flare.addColorStop(0.5, 'rgba(255,255,255,0.4)');
      flare.addColorStop(1, 'transparent');
      ctx.fillStyle = flare;
      ctx.beginPath();
      ctx.arc(400, 80, 250, 0, Math.PI * 2);
      ctx.fill();

      // Bokeh light circles
      ctx.globalAlpha = 0.3;
      const bokehs = [
        { x: 120, y: 100, r: 25, c: '#ffffff' },
        { x: 300, y: 150, r: 15, c: '#fef08a' },
        { x: 260, y: 80, r: 20, c: '#ffffff' },
        { x: 450, y: 220, r: 35, c: '#ffffff' }
      ];
      bokehs.forEach(b => {
        const bGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        bGrad.addColorStop(0, b.c);
        bGrad.addColorStop(0.8, b.c);
        bGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

    } else if (background === 'Modern Workspace') {
      // Creative wooden/plant open workspace environment
      // Warm background base
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#fafaf9');
      grad.addColorStop(1, '#e7e5e4');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Blurred warm wood panels
      ctx.fillStyle = '#d6d3d1';
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.ellipse(380, 200, 110, 250, Math.PI/4, 0, Math.PI*2);
      ctx.fill();

      // Green plants bokeh (deep blurred leaves shape)
      ctx.fillStyle = '#86efac';
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.arc(50, 120, 70, 0, Math.PI*2);
      ctx.arc(100, 80, 80, 0, Math.PI*2);
      ctx.arc(20, 200, 90, 0, Math.PI*2);
      ctx.fill();

      // Warm hanging lights bokeh
      ctx.globalAlpha = 0.4;
      const lights = [
        { x: 220, y: 60, r: 20, c: '#ffedd5' },
        { x: 340, y: 80, r: 30, c: '#fef3c7' }
      ];
      lights.forEach(l => {
        const lGrad = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
        lGrad.addColorStop(0, l.c);
        lGrad.addColorStop(0.7, 'rgba(254, 243, 199, 0.6)');
        lGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = lGrad;
        ctx.beginPath();
        ctx.arc(l.x, l.y, l.r, 0, Math.PI*2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

    } else {
      // Neutral Professional: Linen-textured dark slate gradient
      const grad = ctx.createRadialGradient(width/2, height/2, 20, width/2, height/2, width * 0.85);
      grad.addColorStop(0, '#e2e8f0');
      grad.addColorStop(1, '#475569');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle textured linen pattern on background
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 4) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();

    // 2. RENDER USER PHOTO WITH RADIAL FEATHERED VIGNETTE MASK
    if (uploadedImage) {
      ctx.save();
      
      // We render the user image on a temporary canvas, apply a feathered radial mask, and draw it back.
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');
      
      // Draw user image aligned & cropped on temp canvas
      tempCtx.save();
      tempCtx.translate(width / 2 + offsetX, height / 2 - 30 + offsetY);
      tempCtx.rotate((rotation * Math.PI) / 180);
      
      const baseScale = Math.min(270 / uploadedImage.width, 270 / uploadedImage.height);
      const s = baseScale * zoom;
      const w = uploadedImage.width * s;
      const h = uploadedImage.height * s;
      
      tempCtx.drawImage(uploadedImage, -w / 2, -h / 2, w, h);
      tempCtx.restore();
      
      // Apply feathered mask on temp canvas
      tempCtx.save();
      tempCtx.globalCompositeOperation = 'destination-in';
      
      const faceX = width / 2 + offsetX;
      const faceY = height / 2 - 30 + offsetY;
      
      // Face bounding details
      const rInner = 100 * zoom;
      const rOuter = 210 * zoom;
      
      const maskGrad = tempCtx.createRadialGradient(faceX, faceY, rInner, faceX, faceY, rOuter);
      maskGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      maskGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.98)');
      maskGrad.addColorStop(0.85, 'rgba(255, 255, 255, 0.4)');
      maskGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      tempCtx.fillStyle = maskGrad;
      tempCtx.fillRect(0, 0, width, height);
      tempCtx.restore();
      
      // Draw the user image onto main canvas
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.restore();
      
      // Draw soft neck-to-collar bridge (blending helper)
      ctx.save();
      const neckGrad = ctx.createLinearGradient(width/2, height/2 - 20, width/2, height/2 + 40);
      neckGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      neckGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
      neckGrad.addColorStop(0.9, 'rgba(255, 255, 255, 0.85)');
      neckGrad.addColorStop(1, 'rgba(255, 255, 255, 0.98)');
      ctx.fillStyle = neckGrad;
      ctx.fillRect(width/2 - neckWidth, height/2 - 20, neckWidth * 2, 70);
      ctx.restore();
    }

    // 3. RENDER BESPOKE 3D-SHADED ATTIRE & ACCESSORIES
    ctx.save();
    
    // Virtual Lighting setup: Key light from top-left, fill light from right
    
    // Neck variables
    const collarY = height - neckHeight * 2; // collar center depth
    const collarTipOffset = neckHeight * 1.1; // collar points drop
    const neckCenter = width / 2;

    // A. CHIN & JAWLINE SHADOW CASTING ON COLLAR
    ctx.save();
    const shadowGrad = ctx.createRadialGradient(neckCenter, collarY - 15, 10, neckCenter, collarY + 30, neckWidth * 1.5);
    shadowGrad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
    shadowGrad.addColorStop(0.4, 'rgba(15, 23, 42, 0.2)');
    shadowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(neckCenter, collarY, neckWidth * 1.2, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // B. INNER COLLAR HOLLOW SHADOW
    ctx.fillStyle = 'rgba(28, 25, 23, 0.95)'; // dark charcoal/brown inside fold
    ctx.beginPath();
    ctx.moveTo(neckCenter - neckWidth/1.3, collarY);
    ctx.bezierCurveTo(neckCenter - neckWidth/2, collarY + 8, neckCenter + neckWidth/2, collarY + 8, neckCenter + neckWidth/1.3, collarY);
    ctx.bezierCurveTo(neckCenter + neckWidth/2, collarY + 28, neckCenter - neckWidth/2, collarY + 28, neckCenter - neckWidth/1.3, collarY);
    ctx.closePath();
    ctx.fill();

    // C. SHIRT COLLAR BAND
    ctx.save();
    const collarBandGrad = ctx.createLinearGradient(neckCenter - neckWidth, collarY, neckCenter + neckWidth, collarY);
    collarBandGrad.addColorStop(0, '#e2e8f0'); // shadow on left side
    collarBandGrad.addColorStop(0.2, '#f8fafc');
    collarBandGrad.addColorStop(0.5, '#ffffff'); // bright front
    collarBandGrad.addColorStop(0.8, '#f8fafc');
    collarBandGrad.addColorStop(1, '#cbd5e1'); // shadow on right side
    ctx.fillStyle = collarBandGrad;
    
    ctx.beginPath();
    ctx.moveTo(neckCenter - neckWidth/1.3, collarY);
    ctx.bezierCurveTo(neckCenter - neckWidth/2, collarY + 12, neckCenter + neckWidth/2, collarY + 12, neckCenter + neckWidth/1.3, collarY);
    ctx.lineTo(neckCenter + neckWidth/1.4, collarY + 15);
    ctx.bezierCurveTo(neckCenter + neckWidth/2, collarY + 22, neckCenter - neckWidth/2, collarY + 22, neckCenter - neckWidth/1.4, collarY + 15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // D. SHIRT FRONT PLACKET (Under tie/collar)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(neckCenter - 15, collarY + 15, 30, height - (collarY + 15));
    // Placket line/shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(neckCenter, collarY + 15);
    ctx.lineTo(neckCenter, height);
    ctx.stroke();

    // E. THE TIE (for Business Suit & Executive Style)
    const hasTie = attire === 'Business Suit' || attire === 'Executive Style';
    if (hasTie) {
      const tieColor = suitConfig.tie;
      
      // Tie knot drop shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 6;
      
      // Draw Knot (rounded inverted trapezoid)
      const knotGrad = ctx.createRadialGradient(neckCenter - 3, collarY + 20, 2, neckCenter, collarY + 22, 18);
      knotGrad.addColorStop(0, '#ffffff'); // tie silk sheen highlight
      knotGrad.addColorStop(0.3, tieColor);
      knotGrad.addColorStop(1, '#1e1b4b'); // deep shadow edge
      
      ctx.fillStyle = knotGrad;
      ctx.beginPath();
      ctx.moveTo(neckCenter - 11, collarY + 12);
      ctx.lineTo(neckCenter + 11, collarY + 12);
      ctx.lineTo(neckCenter + 14, collarY + 32);
      ctx.lineTo(neckCenter - 14, collarY + 32);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Tie Knot creases
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(neckCenter - 7, collarY + 31);
      ctx.bezierCurveTo(neckCenter - 3, collarY + 27, neckCenter + 3, collarY + 27, neckCenter + 7, collarY + 31);
      ctx.stroke();

      // Tie Body
      ctx.save();
      // Drop shadow from knot onto body
      const tieBodyGrad = ctx.createLinearGradient(neckCenter - 18, 0, neckCenter + 18, 0);
      tieBodyGrad.addColorStop(0, '#111827');
      tieBodyGrad.addColorStop(0.4, tieColor);
      tieBodyGrad.addColorStop(0.6, tieColor);
      tieBodyGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = tieBodyGrad;

      // Draw tie shape
      ctx.beginPath();
      ctx.moveTo(neckCenter - 13, collarY + 32);
      ctx.lineTo(neckCenter + 13, collarY + 32);
      ctx.lineTo(neckCenter + 20, height - 20);
      ctx.lineTo(neckCenter + 12, height);
      ctx.lineTo(neckCenter - 12, height);
      ctx.lineTo(neckCenter - 20, height - 20);
      ctx.closePath();
      ctx.fill();

      // Add silk sheen highlight streak
      ctx.globalCompositeOperation = 'screen';
      const silkHighlight = ctx.createLinearGradient(neckCenter - 10, 0, neckCenter + 10, 0);
      silkHighlight.addColorStop(0, 'rgba(255,255,255,0)');
      silkHighlight.addColorStop(0.5, 'rgba(255,255,255,0.08)');
      silkHighlight.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = silkHighlight;
      ctx.fillRect(neckCenter - 18, collarY + 32, 36, height);
      ctx.restore();

      // Draw tie patterns (elegant diagonal stripes)
      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
      ctx.strokeStyle = attire === 'Executive Style' ? '#eab308' : '#ffffff'; // gold or white stripes
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.28;
      for (let y = collarY + 40; y < height + 50; y += 22) {
        ctx.beginPath();
        ctx.moveTo(neckCenter - 30, y);
        ctx.lineTo(neckCenter + 30, y - 25);
        ctx.stroke();
      }
      ctx.restore();
      
      // Draw tie clip for executive style
      if (attire === 'Executive Style') {
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetY = 2;
        // Metallic gold clip
        const clipGrad = ctx.createLinearGradient(neckCenter, collarY + 90, neckCenter + 16, collarY + 90);
        clipGrad.addColorStop(0, '#f59e0b');
        clipGrad.addColorStop(0.5, '#fef08a');
        clipGrad.addColorStop(1, '#b45309');
        ctx.fillStyle = clipGrad;
        ctx.fillRect(neckCenter - 2, collarY + 88, 18, 5);
        ctx.restore();
      }
    }

    // F. SHIRT COLLAR FOLDS (Left & Right leaves overlapping placket/tie)
    // Left collar point
    ctx.save();
    ctx.shadowColor = 'rgba(15,23,42,0.18)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;
    
    const leftCollarGrad = ctx.createLinearGradient(neckCenter - neckWidth/2, collarY, neckCenter - neckWidth/4, collarY + collarTipOffset);
    leftCollarGrad.addColorStop(0, '#f8fafc');
    leftCollarGrad.addColorStop(1, '#ffffff');
    ctx.fillStyle = leftCollarGrad;
    
    ctx.beginPath();
    ctx.moveTo(neckCenter - neckWidth/1.3, collarY);
    ctx.lineTo(neckCenter - neckWidth/1.7, collarY + collarTipOffset);
    ctx.lineTo(neckCenter, collarY + 12);
    ctx.closePath();
    ctx.fill();

    // Subtle collar fold seam
    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 1]);
    ctx.beginPath();
    ctx.moveTo(neckCenter - neckWidth/1.3 - 1, collarY + 1);
    ctx.lineTo(neckCenter - neckWidth/1.7, collarY + collarTipOffset - 1);
    ctx.lineTo(neckCenter - 1, collarY + 12 - 1);
    ctx.stroke();
    ctx.restore();

    // Right collar point
    ctx.save();
    ctx.shadowColor = 'rgba(15,23,42,0.18)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;

    const rightCollarGrad = ctx.createLinearGradient(neckCenter + neckWidth/2, collarY, neckCenter + neckWidth/4, collarY + collarTipOffset);
    rightCollarGrad.addColorStop(0, '#cbd5e1'); // slightly darker due to light angle (right shadow)
    rightCollarGrad.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = rightCollarGrad;

    ctx.beginPath();
    ctx.moveTo(neckCenter + neckWidth/1.3, collarY);
    ctx.lineTo(neckCenter + neckWidth/1.7, collarY + collarTipOffset);
    ctx.lineTo(neckCenter, collarY + 12);
    ctx.closePath();
    ctx.fill();

    // Right collar seam
    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 1]);
    ctx.beginPath();
    ctx.moveTo(neckCenter + neckWidth/1.3 + 1, collarY + 1);
    ctx.lineTo(neckCenter + neckWidth/1.7, collarY + collarTipOffset - 1);
    ctx.lineTo(neckCenter + 1, collarY + 12 - 1);
    ctx.stroke();
    ctx.restore();

    // Draw shirt button if open collar (Formal Blazer)
    if (attire === 'Formal Blazer') {
      // Small plastic button peeking below collar opening
      ctx.save();
      const btnX = neckCenter;
      const btnY = collarY + 35;
      
      // Button shadow
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.arc(btnX, btnY + 1, 4, 0, Math.PI*2);
      ctx.fill();

      // Button white body
      ctx.fillStyle = '#f1f5f9';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(btnX, btnY, 4, 0, Math.PI*2);
      ctx.fill();
      ctx.stroke();

      // Button holes
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(btnX - 1.5, btnY - 0.5, 1, 1);
      ctx.fillRect(btnX + 0.5, btnY - 0.5, 1, 1);
      ctx.restore();
    }

    // G. BESPOKE JACKET/SUIT BODY
    const drawJacketPath = (ctx) => {
      ctx.beginPath();
      // Start bottom left
      ctx.moveTo(0, height);
      // Left shoulder curve
      ctx.bezierCurveTo(35, height - 125, neckCenter - 110, height - 120, neckCenter - 75, height - 142);
      // Left neckline opening
      ctx.lineTo(neckCenter - 22, collarY + 15);
      // Right neckline opening
      ctx.lineTo(neckCenter + 22, collarY + 15);
      // Right shoulder neckline anchor
      ctx.lineTo(neckCenter + 75, height - 142);
      // Right shoulder curve
      ctx.bezierCurveTo(neckCenter + 110, height - 120, width - 35, height - 125, width, height);
      ctx.closePath();
    };

    // Draw suit base color & 3D shadow gradient
    ctx.save();
    drawJacketPath(ctx);
    
    // Jacket shading gradient matching key light (top-left)
    const jacketGrad = ctx.createLinearGradient(0, height - 150, width, height);
    jacketGrad.addColorStop(0, suitConfig.color); // Left side base
    jacketGrad.addColorStop(0.5, suitConfig.color);
    // Darken right side to simulate natural light drop-off
    const rColor = attire === 'Smart Casual' ? '#27272a' : '#090d16';
    jacketGrad.addColorStop(1, rColor);
    ctx.fillStyle = jacketGrad;
    ctx.fill();

    // H. PROCEDURAL TEXTILE FABRIC WEAVE TEXTURE
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 4;
    patternCanvas.height = 4;
    const pCtx = patternCanvas.getContext('2d');
    
    // Fine textile cross-hatch structure
    pCtx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    pCtx.fillRect(0, 0, 4, 4);
    pCtx.fillStyle = 'rgba(0, 0, 0, 0.07)';
    pCtx.fillRect(0, 0, 2, 2);
    pCtx.fillRect(2, 2, 2, 2);
    
    const suitPattern = ctx.createPattern(patternCanvas, 'repeat');
    ctx.fillStyle = suitPattern;
    ctx.fillRect(0, height - 170, width, 170);
    ctx.restore();

    // I. DYNAMIC SUIT COLLAR & LAPEL FOLDS
    // Left Lapel
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;

    const leftLapelGrad = ctx.createLinearGradient(neckCenter - 75, height - 142, neckCenter - 22, collarY + 60);
    leftLapelGrad.addColorStop(0, suitConfig.color);
    leftLapelGrad.addColorStop(0.7, suitConfig.color);
    leftLapelGrad.addColorStop(1, '#334155'); // reflect light on lapel edge
    ctx.fillStyle = leftLapelGrad;

    ctx.beginPath();
    ctx.moveTo(neckCenter - 75, height - 142);
    ctx.lineTo(neckCenter - 62, height - 105); // notch drop
    ctx.lineTo(neckCenter - 76, height - 102); // notch cut
    ctx.lineTo(neckCenter - 22, collarY + 38);  // collar join
    ctx.lineTo(neckCenter - 20, collarY + 15);
    ctx.lineTo(neckCenter - 22, collarY + 38);
    ctx.lineTo(neckCenter - 8, height);
    ctx.lineTo(neckCenter - 45, height);
    ctx.closePath();
    ctx.fill();

    // Lapel outer highlight stroke
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Right Lapel (drawn with shadow)
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = -4;
    ctx.shadowOffsetY = 4;

    const rightLapelGrad = ctx.createLinearGradient(neckCenter + 75, height - 142, neckCenter + 22, collarY + 60);
    rightLapelGrad.addColorStop(0, rColor); // darker right lapel
    rightLapelGrad.addColorStop(1, suitConfig.color);
    ctx.fillStyle = rightLapelGrad;

    ctx.beginPath();
    ctx.moveTo(neckCenter + 75, height - 142);
    ctx.lineTo(neckCenter + 62, height - 105); // notch drop
    ctx.lineTo(neckCenter + 76, height - 102); // notch cut
    ctx.lineTo(neckCenter + 22, collarY + 38);  // collar join
    ctx.lineTo(neckCenter + 20, collarY + 15);
    ctx.lineTo(neckCenter + 22, collarY + 38);
    ctx.lineTo(neckCenter + 8, height);
    ctx.lineTo(neckCenter + 45, height);
    ctx.closePath();
    ctx.fill();

    // Lapel outer highlight stroke
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // J. Vertical Pinstripes for Executive Style
    if (attire === 'Executive Style') {
      ctx.save();
      drawJacketPath(ctx);
      ctx.clip();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.lineWidth = 1;
      // Draw pinstripes across shoulders and body
      for (let x = -width; x < width * 2; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x + (width/2 - x)*0.06, collarY);
        ctx.lineTo(x + (width/2 - x)*0.15, height);
        ctx.stroke();
      }
      ctx.restore();
    }

    // K. Smart Casual Crewneck Collar overlay
    if (attire === 'Smart Casual') {
      ctx.save();
      const sweaterColor = '#374151'; // Slate dark grey
      const sweaterCollarGrad = ctx.createLinearGradient(neckCenter - neckWidth - 5, collarY + 15, neckCenter + neckWidth + 5, collarY + 15);
      sweaterCollarGrad.addColorStop(0, '#1f2937');
      sweaterCollarGrad.addColorStop(0.5, sweaterColor);
      sweaterCollarGrad.addColorStop(1, '#111827');
      
      ctx.fillStyle = sweaterCollarGrad;
      ctx.beginPath();
      // Draw a thick rounded collar wrapping around collar base
      ctx.moveTo(neckCenter - neckWidth - 6, collarY + 8);
      ctx.bezierCurveTo(neckCenter - neckWidth/2, collarY + 38, neckCenter + neckWidth/2, collarY + 38, neckCenter + neckWidth + 6, collarY + 8);
      ctx.lineTo(neckCenter + neckWidth + 1, collarY + 22);
      ctx.bezierCurveTo(neckCenter + neckWidth/2, collarY + 48, neckCenter - neckWidth/2, collarY + 48, neckCenter - neckWidth - 1, collarY + 22);
      ctx.closePath();
      ctx.fill();

      // Knit rib texture lines
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(neckCenter - neckWidth - 6, collarY + 8);
      ctx.bezierCurveTo(neckCenter - neckWidth/2, collarY + 38, neckCenter + neckWidth/2, collarY + 38, neckCenter + neckWidth + 6, collarY + 8);
      ctx.lineTo(neckCenter + neckWidth + 1, collarY + 22);
      ctx.bezierCurveTo(neckCenter + neckWidth/2, collarY + 48, neckCenter - neckWidth/2, collarY + 48, neckCenter - neckWidth - 1, collarY + 22);
      ctx.clip();
      
      // Draw short radial lines matching rib directions
      for (let i = -30; i <= 30; i += 2) {
        const angle = (i * Math.PI) / 90;
        const lineX = neckCenter + Math.sin(angle) * (neckWidth + 10);
        const lineY = collarY + 25 + Math.cos(angle) * 12;
        ctx.beginPath();
        ctx.moveTo(lineX - Math.sin(angle)*8, lineY - Math.cos(angle)*8);
        ctx.lineTo(lineX + Math.sin(angle)*8, lineY + Math.cos(angle)*8);
        ctx.stroke();
      }
      ctx.restore();
      ctx.restore();
    }

    // L. Pocket Square for Executive Style
    if (attire === 'Executive Style') {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(width * 0.2, height - 72, 55, 3);
      ctx.fillStyle = '#ffffff'; // pocket square white fold
      ctx.beginPath();
      ctx.moveTo(width * 0.23, height - 72);
      ctx.lineTo(width * 0.27, height - 85);
      ctx.lineTo(width * 0.31, height - 72);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(width * 0.28, height - 72);
      ctx.lineTo(width * 0.32, height - 88);
      ctx.lineTo(width * 0.36, height - 72);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // M. Ambient shadows along shoulders
    ctx.save();
    drawJacketPath(ctx);
    ctx.clip();
    const shoulderShadow = ctx.createLinearGradient(0, height - 90, 0, height);
    shoulderShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
    shoulderShadow.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = shoulderShadow;
    ctx.fillRect(0, height - 120, width, 120);
    ctx.restore();

    ctx.restore(); // restore suit context

    // 4. APPLY AMBIENT LIGHT HARMONIZATION & PHOTOGRAPHIC POST-PROCESSING
    ctx.save();
    
    // Ambient color light overlay (harmonizes face and clothing colors with the backdrop)
    const ambientColor = bgConfig.colors ? bgConfig.colors[0] : '#f1f5f9';
    ctx.fillStyle = ambientColor;
    ctx.globalAlpha = 0.035; // subtle 3.5% tint overlay
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // Central lighting highlight (vignette focus)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const softLight = ctx.createRadialGradient(width/2, height/2 - 40, 50, width/2, height/2 - 40, width*0.7);
    softLight.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    softLight.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
    softLight.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = softLight;
    ctx.beginPath();
    ctx.arc(width/2, height/2 - 40, width*0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Apply color filters & High-resolution film grain (camera noise)
    ctx.save();
    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    const len = pixels.length;

    for (let i = 0; i < len; i += 4) {
      let r = pixels[i];
      let g = pixels[i + 1];
      let b = pixels[i + 2];

      // A. Active lighting filters
      if (filter === 'Warm Studio') {
        r = Math.min(255, r * 1.05);
        g = Math.min(255, g * 1.02);
        b = b * 0.95;
      } else if (filter === 'Cold Office') {
        r = r * 0.95;
        g = Math.min(255, g * 1.01);
        b = Math.min(255, b * 1.08);
      } else if (filter === 'LinkedIn Blue') {
        r = r * 0.90;
        g = Math.min(255, g * 1.01);
        b = Math.min(255, b * 1.10);
      } else if (filter === 'Noir') {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const contrast = 1.15;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        const finalGray = Math.max(0, Math.min(255, factor * (gray - 128) + 128));
        r = finalGray;
        g = finalGray;
        b = finalGray;
      }

      // B. High-resolution film grain (camera sensor noise texture)
      const grainStrength = 5.0; // subtle photographic texture
      const noise = (Math.random() - 0.5) * grainStrength;
      
      pixels[i] = Math.max(0, Math.min(255, r + noise));
      pixels[i + 1] = Math.max(0, Math.min(255, g + noise));
      pixels[i + 2] = Math.max(0, Math.min(255, b + noise));
    }
    
    ctx.putImageData(imgData, 0, 0);
    ctx.restore();
    
    // Post-processing dark border vignette
    ctx.save();
    const vignette = ctx.createRadialGradient(width/2, height/2, width*0.5, width/2, height/2, width*0.8);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  };

  // Run AI simulation scanning effect
  const handleGenerate = () => {
    if (!uploadedImage) {
      showToast('Please upload a photo first', 'warning');
      return;
    }
    setGenerating(true);
    setGenerationStep(0);
    
    const stepsCount = 5;
    const interval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev >= stepsCount - 1) {
          clearInterval(interval);
          setGenerating(false);
          // Export A4 high-res composite
          const dataUrl = canvasRef.current.toDataURL('image/png');
          setGeneratedResult(dataUrl);
          showToast('Premium Corporate Headshot Generated!', 'success');
          return stepsCount;
        }
        return prev + 1;
      });
    }, 1200);
  };

  const getStepText = () => {
    switch (generationStep) {
      case 0: return 'Mapping facial coordinates and expression...';
      case 1: return 'Draping bespoke tailored business attire...';
      case 2: return 'Applying shadow drop-shadow under chin...';
      case 3: return 'Balancing background ambient color temperature...';
      case 4: return 'Enhancing 4K photography texture grain...';
      default: return 'Finishing up...';
    }
  };

  const handleApplyToResume = async () => {
    if (!generatedResult) {
      showToast('Please generate your headshot first', 'warning');
      return;
    }
    if (!selectedResumeId) {
      showToast('Please create a resume first to apply your image', 'warning');
      return;
    }

    setApplying(true);
    try {
      const getRes = await apiFetch(`/api/resumes/get/${selectedResumeId}`);
      const getData = await getRes.json();
      if (!getRes.ok) throw new Error(getData.message || 'Failed to fetch resume details');
      
      const resumeData = getData.resume;
      if (!resumeData.personal_info) resumeData.personal_info = {};
      resumeData.personal_info.image = generatedResult;

      const saveRes = await apiFetch(`/api/resumes/update/${selectedResumeId}`, {
        method: 'PUT',
        body: JSON.stringify({ resumeData }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.message || 'Failed to update resume avatar');
      
      showToast(`Headshot successfully set on resume "${resumeData.title}"!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setApplying(false);
    }
  };

  const handleDownload = () => {
    if (!generatedResult) return;
    const link = document.createElement('a');
    link.download = `${profession.toLowerCase().replace(' ', '_')}_headshot.png`;
    link.href = generatedResult;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Sparkles className="text-orange-500 fill-orange-500/10" size={28} />
          AI Professional Headshot Generator
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Dynamically transform uploaded portraits into high-resolution corporate studio headshots. Tailor suits, seniorities, and lighting without static assets.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Editor Area (Left 7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/70 p-6 shadow-sm flex flex-col items-center">
            
            {/* Real-time Canvas */}
            <div className="w-full max-w-[420px] aspect-square rounded-2xl border border-slate-200 shadow-lg overflow-hidden relative bg-slate-50">
              
              {/* Guidance grid if uploading but not generated yet */}
              {!generatedResult && uploadedImage && !generating && (
                <div className="absolute inset-0 border-2 border-dashed border-orange-400/30 rounded-full pointer-events-none m-8 flex items-center justify-center">
                  <div className="text-[10px] text-orange-400 font-bold uppercase bg-white/85 px-2 py-0.5 rounded-md border border-orange-100">
                    Align Face Here
                  </div>
                </div>
              )}

              {/* Canvas element */}
              <canvas ref={canvasRef} className="w-full h-full object-cover" />

              {/* Upload Dropzone */}
              {!uploadedImage && (
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="h-14 w-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4 shadow-inner">
                    <Upload size={28} />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Upload Casual Photo</h3>
                  <p className="text-slate-400 text-xs mt-1 max-w-[240px]">
                    Drag and drop your file here, or click to browse. Supports JPG, PNG up to 5MB.
                  </p>
                </div>
              )}

              {/* Generating overlay scan animation */}
              {generating && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-white animate-fade-in">
                  <div className="relative h-20 w-20 flex items-center justify-center mb-5">
                    <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    <Sparkles className="text-orange-500 animate-pulse" size={28} />
                  </div>
                  <h4 className="font-bold text-md text-orange-400">AI Composing Photo</h4>
                  <p className="text-xs text-slate-300 mt-2 max-w-xs h-8">
                    {getStepText()}
                  </p>
                  
                  {/* Progress Line */}
                  <div className="w-full max-w-[200px] h-1.5 bg-slate-800 rounded-full overflow-hidden mt-4">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-300"
                      style={{ width: `${(generationStep / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />

            {/* Canvas reposition sliders */}
            {uploadedImage && !generatedResult && !generating && (
              <div className="w-full mt-6 space-y-4 border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <Sliders size={14} className="text-slate-500" />
                  Align and Crop Face
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-650">
                      <span>Face Zoom</span>
                      <span>{Math.round(zoom * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="3.0" 
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-orange-500" 
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-650">
                      <span>Face Rotation</span>
                      <span>{rotation}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="-45" 
                      max="45" 
                      step="1"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full accent-orange-500" 
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-650">
                      <span>Horizontal Offset</span>
                      <span>{offsetX}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="-150" 
                      max="150" 
                      step="2"
                      value={offsetX}
                      onChange={(e) => setOffsetX(parseInt(e.target.value))}
                      className="w-full accent-orange-500" 
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-650">
                      <span>Vertical Offset</span>
                      <span>{offsetY}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="-150" 
                      max="150" 
                      step="2"
                      value={offsetY}
                      onChange={(e) => setOffsetY(parseInt(e.target.value))}
                      className="w-full accent-orange-500" 
                    />
                  </div>

                  <div className="space-y-1 col-span-1 sm:col-span-2 pt-2 border-t border-slate-50">
                    <div className="flex justify-between text-xs font-bold text-slate-650">
                      <span>Collar Neck Width Blending</span>
                      <span>{neckWidth}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="100" 
                      step="1"
                      value={neckWidth}
                      onChange={(e) => setNeckWidth(parseInt(e.target.value))}
                      className="w-full accent-orange-500" 
                    />
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-3">
                  <button
                    onClick={() => {
                      setZoom(1.1);
                      setOffsetX(0);
                      setOffsetY(0);
                      setRotation(0);
                      setNeckWidth(70);
                      setNeckHeight(55);
                    }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-55 transition cursor-pointer"
                  >
                    Reset Alignment
                  </button>
                  
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center gap-1.5 text-orange-655 border border-orange-100 hover:bg-orange-50/50 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <ImageIcon size={14} />
                    Choose Different Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customization Settings panel (Right 5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/70 p-6 shadow-sm space-y-5">
            
            {/* Profession Preset */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Profession Selection</label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-orange-500 bg-white text-xs text-slate-800"
              >
                {professions.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Seniority Level */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Seniority Level</label>
              <select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-orange-500 bg-white text-xs text-slate-800"
              >
                {seniorityLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            {/* Custom Attire Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Select Corporate Attire</label>
              <select
                value={attire}
                onChange={(e) => setAttire(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-orange-500 bg-white text-xs text-slate-800"
              >
                {Object.keys(attireOptions).map((a) => (
                  <option key={a} value={a}>{attireOptions[a].name}</option>
                ))}
              </select>
            </div>

            {/* Background Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Choose Studio Backdrop</label>
              <select
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-orange-500 bg-white text-xs text-slate-800"
              >
                {Object.keys(backgroundOptions).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Lighting filters */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Studio Lighting filter</label>
              <div className="flex flex-wrap gap-1.5">
                {filtersList.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-[10px] font-semibold rounded-lg border transition cursor-pointer ${
                      filter === f 
                        ? 'bg-slate-900 text-white border-slate-900 font-bold' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-650'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              {!generatedResult ? (
                <button
                  onClick={handleGenerate}
                  disabled={!uploadedImage || generating}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-orange-500/10 cursor-pointer transition-all active:scale-95"
                >
                  <Sparkles size={14} />
                  Compose Corporate Headshot
                </button>
              ) : (
                <div className="space-y-3 animate-fade-in">
                  
                  {/* Apply to resume select */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Apply Directly to Resume</p>
                    
                    {loadingResumes ? (
                      <div className="text-xs text-slate-400 italic">Loading resumes...</div>
                    ) : resumes.length === 0 ? (
                      <div className="text-xs text-slate-400 italic">No resumes found. Make a resume to test.</div>
                    ) : (
                      <div className="flex gap-2">
                        <select
                          value={selectedResumeId}
                          onChange={(e) => setSelectedResumeId(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 bg-white text-xs text-slate-700"
                        >
                          {resumes.map((r) => (
                            <option key={r._id} value={r._id}>{r.title}</option>
                          ))}
                        </select>
                        <button
                          onClick={handleApplyToResume}
                          disabled={applying}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                        >
                          {applying ? <RefreshCw size={12} className="animate-spin" /> : <Check size={14} />}
                          Save
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold text-xs shadow cursor-pointer transition-all active:scale-95"
                    >
                      <Download size={14} />
                      Download Portrait
                    </button>
                    
                    <button
                      onClick={() => setGeneratedResult(null)}
                      className="p-3 border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl transition cursor-pointer"
                      title="New composition"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default HeadshotGenerator;
