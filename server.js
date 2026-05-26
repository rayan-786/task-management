require("dotenv").config();

const express =
  require("express");

const mongoose =
  require("mongoose");

const cors =
  require("cors");

const cookieParser =
  require("cookie-parser");

// ================= APP =================

const app = express();

// ================= MIDDLEWARE =================

// JSON

app.use(express.json());

// COOKIE

app.use(cookieParser());

// CORS

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL,

     credentials: true,
  })
);

// ================= ROUTES =================

const authRoutes =
  require("./routes/auth");

const taskRoutes =
  require("./routes/taskRoutes");

const teamUserRoutes =
  require(
    "./routes/teamUserRoutes"
  );

// ================= API ROUTES =================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/tasks",
  taskRoutes
);

app.use(
  "/api/team",
  teamUserRoutes
);

// ================= HEALTH ROUTE =================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,

    message:
      "TaskFlow API Running 🚀",
  });
});

// ================= DATABASE CONNECTION =================

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log(
      "MongoDB Connected Successfully 🚀"
    );

    // ================= SERVER START =================

    const PORT =
      process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`
🚀 Server Running:
http://localhost:${PORT}
      `);
    });
  })
  .catch((error) => {
    console.log(
      "MongoDB Connection Error ❌"
    );

    console.log(error.message);
  });