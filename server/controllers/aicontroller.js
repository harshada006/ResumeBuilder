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

// Generate a complete resume from professional prompt
export const generateResumeFromPrompt = async (req, res) => {
  try {
    const { profession, experienceLevel, briefBackground, title } = req.body;
    const userId = req.userId;
    if (!profession || !experienceLevel) {
      return res.status(400).json({ message: "missing required fields" });
    }

    const systemPrompt = "You are an expert resume writer. Your task is to generate a comprehensive, premium, ATS-friendly resume as a structured JSON object matching the requested schema. Return ONLY valid JSON, no markdown formatting, no codeblocks.";

    const userPrompt = `Generate a realistic, professional, fully populated resume for:
Profession: ${profession}
Experience Level: ${experienceLevel}
Brief Background/Focus: ${briefBackground || "None provided"}

The output JSON MUST match this exact schema structure:
{
  "professional_summary": "compelling summary statement...",
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7", "Skill 8"],
  "personal_info": {
    "full_name": "Full Name",
    "email": "email@example.com",
    "profession": "${profession}",
    "phone": "+1 (555) 019-2834",
    "location": "San Francisco, CA",
    "linkedin": "linkedin.com/in/username"
  },
  "experience": [
    {
      "company": "Company A",
      "position": "Job Title",
      "start_date": "Jan 2021",
      "end_date": "Present",
      "description": "Led projects... achieved X using Y... (1-2 sentences of high impact)"
    },
    {
      "company": "Company B",
      "position": "Previous Job Title",
      "start_date": "Jun 2018",
      "end_date": "Dec 2020",
      "description": "Designed... implemented... improved performance by Z%..."
    }
  ],
  "projects": [
    {
      "name": "Project Alpha",
      "description": "A high-performance system that did X using Y, increasing conversion by 15%",
      "link": "https://github.com/username/project-alpha"
    },
    {
      "name": "Project Beta",
      "description": "An open source tool that automates Y, saving developers 10 hours a week",
      "link": "https://github.com/username/project-beta"
    }
  ],
  "education": [
    {
      "institution": "State University",
      "degree": "Bachelor of Science",
      "field_of_study": "Computer Science or related field",
      "graduation_date": "May 2018",
      "gpa": "3.7 / 4.0"
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified Solutions Architect",
      "issuer": "Amazon Web Services",
      "date": "2023"
    }
  ],
  "languages": [
    {
      "name": "English",
      "proficiency": "Native"
    }
  ],
  "interests": ["Open Source", "Hiking"]
}`;

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });

    const generatedText = response.choices[0].message.content;
    const parsedData = JSON.parse(generatedText);

    const newResume = await Resume.create({
      userId,
      title: title || `${profession} Resume (AI Generated)`,
      ...parsedData
    });

    return res.status(201).json({ resumeId: newResume._id });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Analyze resume ATS score and improvements
export const analyzeATS = async (req, res) => {
  try {
    const { resumeData } = req.body;
    if (!resumeData) {
      return res.status(400).json({ message: "missing required resume data" });
    }

    const systemPrompt = "You are a professional ATS system and recruiter analyzer. Analyze the provided resume and return an assessment in JSON format. Return ONLY valid JSON, no markdown formatting, no codeblocks.";

    const userPrompt = `Analyze the following resume details:
${JSON.stringify(resumeData)}

Provide the assessment in the following JSON format:
{
  "score": 85,
  "missingKeywords": ["keyword1", "keyword2"],
  "missingSections": ["section1"],
  "suggestions": [
    {
      "section": "string",
      "issue": "string description",
      "recommendation": "actionable tip"
    }
  ]
}`;

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Match resume against a job description
export const analyzeJobMatch = async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;
    if (!resumeData || !jobDescription) {
      return res.status(400).json({ message: "missing resume data or job description" });
    }

    const systemPrompt = "You are an AI Job Matching Assistant. Analyze the fit between the resume and the job description, and return the comparison as a JSON object. Return ONLY valid JSON, no markdown formatting, no codeblocks.";

    const userPrompt = `Compare this resume:
${JSON.stringify(resumeData)}

With this job description:
---
${jobDescription}
---

Provide the comparison in the following JSON format:
{
  "matchPercentage": 75,
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "recommendations": ["specific recommendation 1", "specific recommendation 2"]
}`;

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Generate cover letter
export const generateCoverLetter = async (req, res) => {
  try {
    const { resumeData, jobDescription, tone } = req.body;
    if (!resumeData) {
      return res.status(400).json({ message: "missing resume data" });
    }

    const systemPrompt = "You are a professional copywriter. Write a tailored, high-converting cover letter based on the resume and job description. Keep it structured, engaging, and recruiter-ready. Return ONLY raw text, no headings or markers other than standard letter paragraphs.";

    const userPrompt = `Write a cover letter with the following details:
Resume: ${JSON.stringify(resumeData)}
Job Description (Optional): ${jobDescription || "Not provided"}
Desired Tone: ${tone || "Professional"}

Ensure the letter includes:
1. Sender Info (Name, profession, contact placeholders if missing in resume)
2. Professional Greeting
3. Engaging introduction mentioning interest and job alignment
4. 2-3 body paragraphs highlighting relevant skills, projects, and achievements from the resume
5. Call to action and professional closing.
Do NOT include markdown syntax or labels like "Subject:" or "To:". Write a ready-to-use letter.`;

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    return res.status(200).json({ coverLetter: response.choices[0].message.content });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Generate tailored interview prep questions
export const generateInterviewPrep = async (req, res) => {
  try {
    const { resumeData } = req.body;
    if (!resumeData) {
      return res.status(400).json({ message: "missing resume data" });
    }

    const systemPrompt = "You are an expert technical interviewer and HR coach. Generate relevant interview questions, sample answers, and tips tailored to the resume in JSON format. Return ONLY valid JSON, no markdown formatting, no codeblocks.";

    const userPrompt = `Generate interview prep materials for this resume:
${JSON.stringify(resumeData)}

Generate:
- 2 HR/Behavioral questions
- 3 Technical questions (relevant to the resume's skills/experience)
- 2 Scenario/System design questions

Format the response exactly as this JSON structure:
{
  "questions": [
    {
      "category": "Technical",
      "question": "string",
      "sampleAnswer": "string",
      "tips": "string"
    }
  ]
}`;

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Generate optimized LinkedIn components
export const optimizeLinkedIn = async (req, res) => {
  try {
    const { resumeData } = req.body;
    if (!resumeData) {
      return res.status(400).json({ message: "missing resume data" });
    }

    const systemPrompt = "You are a LinkedIn Profile Specialist. Generate optimized profile components based on the resume data and return them in JSON format. Return ONLY valid JSON, no markdown formatting, no codeblocks.";

    const userPrompt = `Optimize LinkedIn details for this resume:
${JSON.stringify(resumeData)}

Provide the output in the following JSON structure:
{
  "headlines": ["Headline 1", "Headline 2", "Headline 3"],
  "about": "A compelling LinkedIn About section.",
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Roast resume
export const roastResume = async (req, res) => {
  try {
    const { resumeData } = req.body;
    if (!resumeData) {
      return res.status(400).json({ message: "missing resume data" });
    }

    const systemPrompt = "You are a sarcastic, extremely honest, but highly experienced technical recruiter. Roast the user's resume brutally but constructively. Return your critique in JSON format. Return ONLY valid JSON, no markdown formatting, no codeblocks.";

    const userPrompt = `Roast this resume:
${JSON.stringify(resumeData)}

Provide the roast in this JSON format:
{
  "roast": "Write a funny, witty, slightly roasting opening paragraph about the resume.",
  "weakpoints": [
    {
      "area": "string",
      "critique": "string",
      "fix": "string"
    }
  ],
  "encouragement": "string"
}`;

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Enhance bullet achievements (STAR method)
export const enhanceAchievements = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "missing text description to enhance" });
    }

    const systemPrompt = "You are an expert resume writer specialized in writing high-impact bullet points. Generate 3 distinct enhanced STAR-method bullet points based on the input text and return them in JSON format. Return ONLY valid JSON, no markdown formatting, no codeblocks.";

    const userPrompt = `Enhance this phrase or task description into high-impact metrics-driven accomplishments:
"${text}"

Format the response exactly as:
{
  "bullets": ["bullet 1", "bullet 2", "bullet 3"]
}`;

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Get aggregated career insights
export const getCareerInsights = async (req, res) => {
  try {
    const { resumeData } = req.body;
    if (!resumeData) {
      return res.status(400).json({ message: "missing resume data" });
    }

    const systemPrompt = "You are a career development strategist. Evaluate the user's resume data and output career metrics and skill gaps in JSON format. Return ONLY valid JSON, no markdown formatting, no codeblocks.";

    const userPrompt = `Analyze this resume:
${JSON.stringify(resumeData)}

Provide career insights in the following JSON format:
{
  "resumeStrength": 80,
  "interviewReadiness": 75,
  "marketReadiness": 70,
  "skillGapAnalysis": [
    {
      "skillGroup": "string",
      "present": ["skill1"],
      "recommended": ["recommended1"],
      "gapDescription": "string"
    }
  ],
  "marketOutlook": "string"
}`;

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};