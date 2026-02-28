import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    // origin: "*",
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "http://192.168.0.203:5173",
      "http://192.168.0.199:5173",
      "http://192.168.0.122:5173",
    ],
    credentials: true,
    allowedHeaders: ["content-type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API is running...");
});

// routes
import userRouter from "./routes/v1/user.routes.js";
import leaveRouter from "./routes/v1/leave.routes.js";
import timeSheetRouter from "./routes/v1/timeSheet.routes.js";
import departmentRouter from "./routes/v1/department.routes.js";
import candidateRoutes from "./routes/v1/candidate.routes.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/leave", leaveRouter);
app.use("/api/v1/timesheet", timeSheetRouter);
app.use("/api/v1/department", departmentRouter);
app.use("/api/v1/candidates", candidateRoutes);

export default app;
