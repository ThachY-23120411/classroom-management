const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRouter = require("./modules/auth/auth.router");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Use the auth router
app.use(authRouter);
app.use("/auth", authRouter);
app.use(require("./modules/students/students.router"));
app.use(require("./modules/chat/chat.router"));

module.exports = app;
