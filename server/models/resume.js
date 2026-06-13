import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    title: {
      type: String,
      default: "Untitled Resume",
    },

    public: {
      type: Boolean,
      default: false,
    },

    template: {
      type: String,
      default: "Classic",
    },

    accent_color: {
      type: String,
      default: "#3b82f6",
    },

    professional_summary: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    personal_info: {
      image: {
        type: String,
        default: "",
      },
      full_name: {
        type: String,
        default: "",
      },
      email: {
        type: String,
        default: "",
      },
      profession: {
        type: String,
        default: "",
      },
      phone: {
        type: String,
        default: "",
      },
      location: {
        type: String,
        default: "",
      },
      linkedin: {
        type: String,
        default: "",
      },
    },

    experience: [
      {
        company: {
          type: String,
          default: "",
        },
        position: {
          type: String,
          default: "",
        },
        start_date: {
          type: String,
          default: "",
        },
        end_date: {
          type: String,
          default: "",
        },
        description: {
          type: String,
          default: "",
        },
      },
    ],

    projects: [
      {
        name: {
          type: String,
          default: "",
        },
        description: {
          type: String,
          default: "",
        },
        link: {
          type: String,
          default: "",
        },
      },
    ],

    education: [
      {
        institution: {
          type: String,
          default: "",
        },
        degree: {
          type: String,
          default: "",
        },
        field_of_study: {
          type: String,
          default: "",
        },
        graduation_date: {
          type: String,
          default: "",
        },
        gpa: {
          type: String,
          default: "",
        },
      },
    ],

    certifications: [
      {
        name: {
          type: String,
          default: "",
        },
        issuer: {
          type: String,
          default: "",
        },
        date: {
          type: String,
          default: "",
        },
      },
    ],

    languages: [
      {
        name: {
          type: String,
          default: "",
        },
        proficiency: {
          type: String,
          default: "",
        },
      },
    ],

    interests: {
      type: [String],
      default: [],
    },

    portfolio_layout: {
      type: String,
      default: "Sleek Dark",
    },

    portfolio_enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
