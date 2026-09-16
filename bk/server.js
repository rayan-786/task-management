require("dotenv").config();
const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const passport = require("./config/Passport");
const { setSocketIO } = require("./utils/activity");

// ================= APP INITIALIZATION =================
const app = express();
const server = http.createServer(app);

// ================= SECURITY MIDDLEWARE =================
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(passport.initialize());

// ================= CORS CONFIGURATION =================
const allowedOrigins = [
  "http://localhost:5173",
  "https://rayan-auth.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.some((o) => origin.startsWith(o.replace(/\/$/, "")))) {
        callback(null, true);
      } else {
        callback(null, true); // Allow dev origins seamlessly
      }
    },
    credentials: true,
  })
);

// ================= RATE LIMITING =================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 auth attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    msg: "Too many authentication attempts. Please try again later.",
  },
});

// ================= SOCKET.IO REALTIME =================
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

setSocketIO(io);

io.on("connection", (socket) => {
  // Join user-specific notification channel
  socket.on("join:user", (userId) => {
    if (userId) socket.join(`user_${userId}`);
  });

  // Join workspace channel
  socket.on("join:workspace", (workspaceId) => {
    if (workspaceId) socket.join(`workspace_${workspaceId}`);
  });

  // Join project channel for board live syncing
  socket.on("join:project", (projectId) => {
    if (projectId) socket.join(`project_${projectId}`);
  });

  socket.on("leave:project", (projectId) => {
    if (projectId) socket.leave(`project_${projectId}`);
  });
});

// ================= API ROUTES =================
const authRoutes = require("./routes/auth");
const workspaceRoutes = require("./routes/workspaceRoutes");
const projectRoutes = require("./routes/projectRoutes");
const issueRoutes = require("./routes/issueRoutes");
const sprintRoutes = require("./routes/sprintRoutes");
const commentRoutes = require("./routes/commentRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const searchRoutes = require("./routes/searchRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Legacy routes for backward compatibility
const taskRoutes = require("./routes/taskRoutes");
const teamUserRoutes = require("./routes/teamUserRoutes");

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/sprints", sprintRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);

// Preserved legacy compatibility
app.use("/api/tasks", taskRoutes);
app.use("/api/team", teamUserRoutes);

// ================= HEALTH CHECK =================
app.get(["/", "/api/health"], (req, res) => {
  res.status(200).json({
    success: true,
    name: "TaskFlow API",
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ================= ERROR HANDLING =================
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    msg: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// ================= DATABASE CONNECTION & SERVER START =================
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB Connected Successfully 🚀");
    server.listen(PORT, () => {
      console.log(`TaskFlow Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Error ❌:", error.message);
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server...");
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log("Server and DB connection closed.");
      process.exit(0);
    });
  });
});