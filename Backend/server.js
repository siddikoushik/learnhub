import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import connectDB from "./config/db.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import userRouter from "./routes/userRouter.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

dotenv.config();
connectDB();

const app = express();

/* -------------------- Middleware -------------------- */
app.use(cors());
app.use(express.json());

// Serve uploaded files (images, screenshots, etc.)
app.use("/images", express.static(path.join(process.cwd(), "uploads")));

/* -------------------- REST API Routes -------------------- */
app.use("/api/student", studentRoutes);
app.use("/api/user", userRouter);
app.use("/api/teacher", teacherRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRouter);

// Test route
app.get("/", (req, res) => {
  res.send("🚀 LearnHub Backend Running");
});

/* -------------------- 404 Handler -------------------- */
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

/* -------------------- Global Error Handler -------------------- */
app.use((err, req, res, next) => {
  console.error("💥 Unhandled Error:", err.stack || err.message || err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* -------------------- Start Server -------------------- */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ LearnHub Server running on http://localhost:${PORT}`);
});
