const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("message", (data) => {
    console.log("Message received:", data);
    io.emit("message", data); // Send to everyone
  });

  socket.on("disconnect", () => console.log("User disconnected"));
});

server.listen(3000, () => console.log("Backend running on port 3000"));
