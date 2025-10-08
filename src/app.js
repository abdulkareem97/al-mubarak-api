import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import path from "path";
import memberRoutes from "./routes/member.routes.js";
import userRoutes from "./routes/user.routes.js";
import usersRoutes from "./routes/user.route.js";
import tourPackageRoutes from "./routes/tourPackageRoute.js";
import tourMembersRoutes from "./routes/tourMemberRoutes.js";
import dashboardRoutes from "./routes/dashboard.js";
import paymentReminderRoutes from "./routes/paymentReminderRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: "*",
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files for uploaded documents
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*"); // allow all origins
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // key for images
    },
  })
);

// API Routes
app.use("/api/v1/members", memberRoutes);
app.use("/api/v1/tour-packages", tourPackageRoutes);
app.use("/api/v1/tour-members", tourMembersRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.use("/api/v1/payment-reminders", paymentReminderRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/usersR", usersRoutes);

// Routes

// app.use("/ai/v1/users", usersRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
// app.use("(.*)", (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found'
//   });
// });

export default app;
