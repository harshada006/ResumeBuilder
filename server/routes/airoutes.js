import express from 'express';
import protect from "../middlewares/authmiddleware.js";
import { enhanceJobDescription, enhanceProfessionalSummary, uploadResume, suggestSkills }
 from '../controllers/aicontroller.js';

const airouter = express.Router();

airouter.post('/enhance-pro-sum', protect, enhanceProfessionalSummary);
airouter.post('/enhance-job-description', protect, enhanceJobDescription);
airouter.post('/upload-resume', protect, uploadResume);
airouter.post('/suggest-skills', protect, suggestSkills);

export default airouter;
