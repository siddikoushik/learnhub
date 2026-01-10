import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import connectDB from "./config/db.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import userRouter from "./routes/userRouter.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();
connectDB();

const app = express();

/* -------------------- Middleware -------------------- */
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/images", express.static(path.join(process.cwd(), "uploads")));

/* -------------------- REST API Routes -------------------- */
app.use("/api/student", studentRoutes);
app.use("/api/user", userRouter);
app.use("/api/teacher", teacherRoutes);
app.use("/api/booking", bookingRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("🚀 LearnHub Backend Running");
});

/* -------------------- HTTP Server -------------------- */
const server = http.createServer(app);

/* -------------------- Socket.IO Setup -------------------- */
const io = new Server(server, {
  cors: {
    origin: "*", // later restrict to frontend URL
    methods: ["GET", "POST"],
  },
});

/* -------------------- Socket Logic -------------------- */
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  // User Room Setup (for private notifications)
  socket.on("setup", (userData) => {
    if (userData && userData._id) {
      socket.join(userData._id);
      console.log(`👤 User ${userData._id} joined their private room`);
      socket.emit("connected");
    }
  });

  // Notify Student
  socket.on("notify-start", (data) => {
    // data: { studentId, teacherName, roomId }
    if (data.studentId) {
      io.to(data.studentId).emit("class-started", data);
      console.log(`🔔 Notification sent to student ${data.studentId}`);
    } else {
      // Fallback: broadcast to room if student is there
      socket.to(data.roomId).emit("class-started", data);
    }
  });

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`📌 ${socket.id} joined room ${roomId}`);
  });

  // Air draw
  socket.on("draw", (data) => {
    socket.to(data.roomId).emit("draw", data);
  });

  // Speech → text
  socket.on("speech-text", (data) => {
    socket.to(data.roomId).emit("speech-text", data);
  });

  // Clear board
  socket.on("clear-board", (roomId) => {
    socket.to(roomId).emit("clear-board");
  });

  /* --- WebRTC Signaling --- */

  // 1. Initiate Call (Broadcast to room that someone is calling)
  // Client (Teacher) calls this. We send "callUser" to others in room.
  // Actually, simple-peer "signal" needs a specific target usually, or we broadcast "hello".
  // Let's do this: User A joins. User B joins.
  // We can emit "me" event?
  // Let's stick to the code in Classroom.jsx logic:

  // Teacher clicks "Start Class" -> emits "initiate-call"
  socket.on("initiate-call", ({ roomId, name }) => {
    // Broadcast to room: "Hey, teacher is calling, send me your signal"
    // But wait, simple-peer needs initiator to generate signal first.
    // Simplified flow:
    // 1. Teacher generates signal (on load or click). 
    // 2. We skip "initiate-call" and focus on "callUser"
    // Let's assume Classroom.jsx calls "callUser" with { signalData, from, name }
    // But who is "userToCall"? In a room, we just broadcast to "others"

    // Correcting Classroom.jsx assumptions via Server logic:
    // If user emits "callUser", we act as a relay to the ROOM (excluding sender)
    socket.to(roomId).emit("callUser", {
      signal: null, // Initial "Hello"
      from: socket.id,
      name: name
    });
    // This triggers "receivingCall" on Student side. 
    // Student then generates signal answer? No, peer connection flow is strict.
    // Initiator (Teacher) must create peer, generate signal.
  });

  // 2. Direct Signaling
  socket.on("callUser", (data) => {
    // data: { userToCall, signalData, from, name }
    // If userToCall is null (room mode), broadcast to room
    if (!data.userToCall) {
      // It's a broadcast to room
      socket.to(data.roomId).emit("callUser", {
        signal: data.signalData,
        from: data.from,
        name: data.name
      });
    } else {
      // Direct P2P
      io.to(data.userToCall).emit("callUser", {
        signal: data.signalData,
        from: data.from,
        name: data.name
      });
    }
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  // Hand raise
  socket.on("hand-raise", (data) => {
    socket.to(data.roomId).emit("hand-raise", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

/* -------------------- Start Server -------------------- */
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
