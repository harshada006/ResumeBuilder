import imagekit from "../configs/imagekit.js";
import Resume from "../models/resume.js";
import fs from "fs";

// ================= CREATE RESUME =================
// post: /api/resumes/create
export const createResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.body;
    
    const newResume = await Resume.create({
      userId,
      title: title || "Untitled Resume"
    });

    return res.status(201).json({
      message: "Resume created successfully",
      resume: newResume
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// ================= DELETE RESUME =================
// delete: /api/resumes/delete/:resumeId
export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    const resume = await Resume.findOneAndDelete({ _id: resumeId, userId });
    
    if (!resume) {
      return res.status(404).json({
        message: "Resume not found or unauthorized"
      });
    }

    return res.status(200).json({
      message: "Resume deleted successfully"
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// ================= GET RESUME BY ID =================
// get: /api/resumes/get/:resumeId
export const getResumeById = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    const resume = await Resume.findOne({ _id: resumeId, userId });
    
    if (!resume) {
      return res.status(404).json({
        message: "Resume not found"
      });
    }

    return res.status(200).json({
      resume
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// ================= GET PUBLIC RESUME BY ID =================
// get: /api/resumes/public/:resumeId
export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findOne({ public: true, _id: resumeId });
    
    if (!resume) {
      return res.status(404).json({
        message: "Resume not found or is private"
      });
    }

    return res.status(200).json({
      resume
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// ================= UPDATE RESUME =================
// put: /api/resumes/update/:resumeId (or put: /api/resumes/update with body.resumeId)
export const updateResume = async (req, res) => {
  try {
    const userId = req.userId;
    let resumeId = req.params.resumeId || req.body.resumeId;
    const { resumeData, removeBackground } = req.body;

    let resumeDatacopy = {};
    if (resumeData) {
      resumeDatacopy = typeof resumeData === "string" ? JSON.parse(resumeData) : resumeData;
    }

    if (!resumeId && resumeDatacopy) {
      resumeId = resumeDatacopy._id || resumeDatacopy.id;
    }

    if (!resumeId) {
      return res.status(400).json({
        message: "Resume ID is required"
      });
    }

    const image = req.file;
    if (image) {
      try {
        const hasImageKitConfig = process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT;
        if (hasImageKitConfig && !process.env.IMAGEKIT_PUBLIC_KEY.includes("dummy")) {
          const imageBufferData = fs.createReadStream(image.path);
          const uploadResponse = await imagekit.upload({
            file: imageBufferData,
            fileName: `resume_${resumeId}.png`,
            folder: 'user-resumes',
          });
          
          if (!resumeDatacopy.personal_info) {
            resumeDatacopy.personal_info = {};
          }
          resumeDatacopy.personal_info.image = uploadResponse.url;
        } else {
          // Fallback to base64 encoding if ImageKit credentials are not configured
          const fileData = fs.readFileSync(image.path);
          const base64Image = fileData.toString("base64");
          const mimeType = image.mimetype || "image/png";
          if (!resumeDatacopy.personal_info) {
            resumeDatacopy.personal_info = {};
          }
          resumeDatacopy.personal_info.image = `data:${mimeType};base64,${base64Image}`;
          console.log("ImageKit is not fully configured. Storing image as Base64 data URL.");
        }
      } catch (ikError) {
        console.error("ImageKit upload failed, falling back to base64:", ikError.message);
        try {
          const fileData = fs.readFileSync(image.path);
          const base64Image = fileData.toString("base64");
          const mimeType = image.mimetype || "image/png";
          if (!resumeDatacopy.personal_info) {
            resumeDatacopy.personal_info = {};
          }
          resumeDatacopy.personal_info.image = `data:${mimeType};base64,${base64Image}`;
        } catch (fallbackError) {
          console.error("Image base64 fallback conversion failed:", fallbackError.message);
        }
      } finally {
        // Clean up temp file
        if (fs.existsSync(image.path)) {
          fs.unlinkSync(image.path);
        }
      }
    }

    // Clean up fields to avoid schema overwrite issues
    delete resumeDatacopy.userId;
    delete resumeDatacopy._id;
    delete resumeDatacopy.createdAt;
    delete resumeDatacopy.updatedAt;
    delete resumeDatacopy.__v;

    const resume = await Resume.findOneAndUpdate(
      { _id: resumeId, userId },
      { $set: resumeDatacopy },
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found or unauthorized"
      });
    }

    return res.status(200).json({
      message: "Resume updated successfully",
      resume
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};