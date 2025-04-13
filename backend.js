const admin = require("firebase-admin");
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// Load Firebase credentials
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-test-c1f02-default-rtdb.firebaseio.com",
});

const db = admin.database();
const messagesRef = db.ref("messages");
const usersRef = db.ref("user accounts");

// Store messages locally (for faster GUI updates)
let messages = [];
let usernames = [];
let userAccs = [];
let userKeyphr = [];

// Function to send a message
function sendMessage(username, message) {
  if (!message.trim()) return;
  
  messagesRef.push({
    text: message,
    user: username,
    timestamp: Date.now(),
  });

  //console.log("Message sent:", message);
}

function addUser(user, key) {
    if (!user.trim()) return;
    
    usersRef.push({
        username: user,
        keyphrase: key,
    });
}

// Function to get messages
function getMessages() {
  return messages;
}

function getUsernames() {
  return usernames;
}

function getUserAccs() {
    return userAccs;
}

function getUserKeyphr() {
  return userKeyphr;
}

usersRef.on("child_added", (snapshot) => {
    const AllUsers = snapshot.val().username;
    const AllPWS = snapshot.val().keyphrase;
    userAccs.push(AllUsers);
    userKeyphr.push(AllPWS);
});

// Listen for new messages in real-time
messagesRef.on("child_added", (snapshot) => {
  const newMessage = snapshot.val().text;
  const newUsername = snapshot.val().user;
  messages.push(newMessage);
  usernames.push(newUsername);
});

// Export functions for GUI to use
module.exports = { sendMessage, getMessages, getUsernames, addUser, getUserAccs, getUserKeyphr};
