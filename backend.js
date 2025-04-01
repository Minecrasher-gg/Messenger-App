const admin = require("firebase-admin");
const readline = require("readline");
const fs = require("fs");

// Load Firebase credentials
const serviceAccount = JSON.parse(fs.readFileSync("./firebaseKey.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com", // Replace this
});

const db = admin.database();
const messagesRef = db.ref("messages");

// Read user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function sendMessage() {
  rl.question("Enter your message: ", (message) => {
    if (message.toLowerCase() === "exit") {
      rl.close();
      process.exit();
    }

    messagesRef.push({
      text: message,
      timestamp: Date.now()
    });

    messagesRef.on("child_added", (snapshot) => {
        console.log("\nNew Message:", snapshot.val().text);
      });      

    console.log("Message sent!");
    sendMessage(); // Ask for another message
  });
}

sendMessage();
