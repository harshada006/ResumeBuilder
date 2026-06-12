import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    const MONGODB_URL = process.env.MONGODB_URL;
    const projectName = "ResumeBuilder";

    await mongoose.connect(`${MONGODB_URL}/${projectName}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export default connectDB;