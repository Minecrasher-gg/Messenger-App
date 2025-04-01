const firebase = require("firebase");

const sendButton = document.getElementById('sendButton');
const messageInput = document.getElementById('messageInput');
const messagesDiv = document.getElementById('messages');

// Load Firebase credentials
const serviceAccount = JSON.parse(fs.readFileSync("./firebaseKey.json", "utf8"));

firebase.initializeApp(config);
const db = firebase.database();
const messagesRef = db.ref("messages");

// Display new messages
messagesRef.on("child_added", (snapshot) => {
    const message = snapshot.val().text;
    const messageDiv = document.createElement("div");
    messageDiv.textContent = message;
    messagesDiv.appendChild(messageDiv);
  });
  
  // Send a message
  sendButton.addEventListener('click', () => {
    const message = messageInput.value;
    if (message) {
      messagesRef.push({ text: message });
      messageInput.value = ''; // Clear the input field
    }
  });