import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import resumeRouter from "./routes/resumeroutes.js";
import airouter from "./routes/airoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Database Connection
await connectDB();

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("Server is live..");
});

app.use("/api/user", userRouter)
app.use('/api/resumes', resumeRouter)
app.use('/api/ai', airouter)


// Start Server
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;