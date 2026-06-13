import express from 'express';
import protect from "../middlewares/authmiddleware.js";
import { 
  enhanceJobDescription, 
  enhanceProfessionalSummary, 
  uploadResume, 
  suggestSkills,
  generateResumeFromPrompt,
  analyzeATS,
  analyzeJobMatch,
  generateCoverLetter,
  generateInterviewPrep,
  optimizeLinkedIn,
  roastResume,
  enhanceAchievements,
  getCareerInsights
} from '../controllers/aicontroller.js';

const airouter = express.Router();

airouter.post('/enhance-pro-sum', protect, enhanceProfessionalSummary);
airouter.post('/enhance-job-description', protect, enhanceJobDescription);
airouter.post('/upload-resume', protect, uploadResume);
airouter.post('/suggest-skills', protect, suggestSkills);

// New Career Platform Endpoints
airouter.post('/generate-resume-prompt', protect, generateResumeFromPrompt);
airouter.post('/analyze-ats', protect, analyzeATS);
airouter.post('/job-match', protect, analyzeJobMatch);
airouter.post('/cover-letter', protect, generateCoverLetter);
airouter.post('/interview-coach', protect, generateInterviewPrep);
airouter.post('/linkedin', protect, optimizeLinkedIn);
airouter.post('/roast', protect, roastResume);
airouter.post('/enhance-achievements', protect, enhanceAchievements);
airouter.post('/career-insights', protect, getCareerInsights);

export default airouter;
