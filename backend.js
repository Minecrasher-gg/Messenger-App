const admin = require("firebase-admin");
const fs = require("fs");

// Load Firebase credentials
const serviceAccount = JSON.parse(fs.readFileSync("./firebaseKey.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-test-c1f02-default-rtdb.firebaseio.com",
});

const db = admin.database();
const messagesRef = db.ref("messages");

// Store messages locally (for faster GUI updates)
let messages = [];

// Function to send a message
function sendMessage(message) {
  if (!message.trim()) return;
  
  messagesRef.push({
    text: message,
    timestamp: Date.now(),
  });

  console.log("Message sent:", message);
}

// Function to get messages
function getMessages() {
  return messages;
}

// Listen for new messages in real-time
messagesRef.on("child_added", (snapshot) => {
  const newMessage = snapshot.val().text;
  messages.push(newMessage);
  console.log("New Message:", newMessage);
});

// Export functions for GUI to use
module.exports = { sendMessage, getMessages };
