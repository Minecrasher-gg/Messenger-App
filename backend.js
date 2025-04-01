const http = require("http");
const { Server } = require("socket.io");
const admin = require("firebase-admin");
const fs = require("fs");

// Load Firebase credentials
const serviceAccount = JSON.parse(fs.readFileSync("./firebaseKey.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const server = http.createServer();
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("message", async (data) => {
    console.log("Message received:", data);

    // Save message to Firestore
    await db.collection("messages").add({
      text: data.text,
      timestamp: new Date(),
    });

    io.emit("message", data); // Send message to all users
  });

  socket.on("disconnect", () => console.log("User disconnected"));
});

server.listen(3000, () => console.log("Backend running on port 3000"));
