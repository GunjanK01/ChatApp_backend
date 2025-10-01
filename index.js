import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // later restrict to your Expo dev URL
    methods: ["GET", "POST"]
  }
});

// REST test route
app.get("/", (req, res) => {
  res.send("Chat backend is running 🚀");
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("send_message", (data) => {
    console.log("📩 Message received of send_message:", data);
    // broadcast to everyone
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Start server
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
