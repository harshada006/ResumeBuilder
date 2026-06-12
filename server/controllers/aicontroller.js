import Resume from "../models/resume.js";
import ai from "../configs/ai.js";

export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent) {
      return res.status(400).json({ message: "missing required fields" });
    }
    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert in resume writing .Your task is to enhance the professional summary of a resume .The sumaary should be  1-2 sentences also Highlighting  key-skills ,expirence,and carrer objectives .Make it compelling and ATS-friendly.and only return text no options or anything else",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });
    const enhancedContent = response.choices[0].message.content;
    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//controller for enhancing a resume's job description
//post:/api/ai/enhance-job-description
export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent) {
      return res.status(400).json({ message: "missing required fields" });
    }
    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert in resume writing.Your task is to enhance the job description of a resume .The job description should be only 1=2 sentences also highlighting key responsibilities and acheivements .Use action verbs and quantifiable results where possible .Make is ATS-friendly .and only return text no options or anything else ",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });
    const enhancedContent = response.choices[0].message.content;
    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//controller for uploading a resume to the database
//post:/api/ai/upload-

export const uploadResume = async (req, res) => {
  try {
    const { resumeText, title } = req.body;
    const userId = req.userId;
    if (!resumeText) {
      return res.status(400).json({ message: "missing required fields" });
    }

    const systemPrompt = "You are an expert in resume parsing and data extraction. Your task is to extract structured information from a resume text and return it as a clean JSON object matching the requested schema. Return ONLY valid JSON, no markdown formatting, no codeblocks.";
    
    const userPrompt = `Extract data from the following resume text:
---
${resumeText}
---

Provide the extracted data in the following JSON format:
{
  "professional_summary": "string summary",
  "skills": ["skill1", "skill2"],
  "personal_info": {
    "full_name": "string",
    "email": "string",
    "profession": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string"
  },
  "experience": [
    {
      "company": "string",
      "position": "string",
      "start_date": "string",
      "end_date": "string",
      "description": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "link": "string"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field_of_study": "string",
      "graduation_date": "string",
      "gpa": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string"
    }
  ],
  "languages": [
    {
      "name": "string",
      "proficiency": "string"
    }
  ],
  "interests": ["interest1", "interest2"]
}`;

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const extractedContent = response.choices[0].message.content;
    const parsedData = JSON.parse(extractedContent);
    
    const newResume = await Resume.create({
      userId,
      title: title || parsedData?.personal_info?.full_name || "Uploaded Resume",
      ...parsedData
    });
    
    return res.status(201).json({ resumeId: newResume._id });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const suggestSkills = async (req, res) => {
  try {
    const { profession } = req.body;
    if (!profession) {
      return res.status(400).json({ message: "missing required fields" });
    }
    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a professional resume advisor. Based on the job title or profession provided, suggest a list of 8 key professional skills. Only return a comma-separated list of skills, nothing else. Make sure the skills are short, ATS-friendly, and comma-separated.",
        },
        {
          role: "user",
          content: profession,
        },
      ],
    });
    const skillsText = response.choices[0].message.content;
    const skillsArray = skillsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    return res.status(200).json({ skills: skillsArray });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};