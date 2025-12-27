const express = require("express");
const morgan = require("morgan");

const app = express();
const PORT = 80;

// ⚠️ PRACTICE ONLY — hard-coded API key
const API_KEY = "public-practice-api-key-123";

// Middleware
app.use(express.json());
app.use(morgan("combined"));

// Simple API key auth
function auth(req, res, next) {
  const key = req.headers["x-api-key"];
  if (key !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// In-memory data store
let tasks = [];
let idCounter = 1;

// Health check (public)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "API is live on the test 🚀",
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Get all tasks
app.get("/tasks", auth, (req, res) => {
  res.json(tasks);
});

// Create task
app.post("/tasks", auth, (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const task = {
    id: idCounter++,
    title,
    completed: false,
    createdAt: new Date()
  };

  tasks.push(task);
  res.status(201).json(task);
});

// Update task
app.put("/tasks/:id", auth, (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { title, completed } = req.body;
  if (title !== undefined) task.title = title;
  if (completed !== undefined) task.completed = completed;

  res.json(task);
});

// Delete task
app.delete("/tasks/:id", auth, (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const removed = tasks.splice(index, 1);
  res.json(removed[0]);
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌍 Server running publicly on port ${PORT}`);
  console.log(`🔑 API KEY: ${API_KEY}`);
});
