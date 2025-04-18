const admin = require("firebase-admin");
const { Server } = require("http");
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
const usersRef = db.ref("user accounts");
const ServerKeys = db.ref("Server Keys");

// Store messages locally (for faster GUI updates)
let userAccs = [];
let userKeyphr = [];
let ServerKeyphrs = [];
let ServersWithKey = [];
let CurrentServer = 1;

// --------- ALL SERVER INFO ---------
let messages = [];
let usernames = [];

// Function to send a message
function sendMessage(username, message, serverName) {
  if (!message.trim()) return;
  let Server2Ref = db.ref("servers/"+ serverName);

  Server2Ref.push({
    text: message,
    user: username,
    timestamp: Date.now(),
  });
}

function addUser(user, key) {
    if (!user.trim()) return;
    
    usersRef.push({
        username: user,
        keyphrase: key,
    });
}

// Function to get messages
async function getMessages(ID) {
  await GetDynamicMessages(ID);
  CurrentServer = ID;
  return messages;
}

async function GetDynamicMessages(ref) {
  const ThisRef = db.ref("servers/" + ref);
  console.log("Current ref:", "servers/" + ref);

  messages = []; // Clear old messages
  usernames = [];

  const snapshot = await ThisRef.once("value");
  snapshot.forEach(childSnapshot => {
    const newMessage = childSnapshot.val().text;
    const newUsername = childSnapshot.val().user;
    messages.push(newMessage);
    usernames.push(newUsername);
  });
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

function ServerHasKey(Name) {
  return ServersWithKey.includes(Name);
}

function GetServerKey(Name) {
  return ServerKeyphrs[ServersWithKey.indexOf(Name)];
}

function CheckServerExists(serverID) {
  const AttemptRef = db.ref("servers/"+ serverID);

  return AttemptRef.once('value')
    .then(snapshot => {
      return snapshot.exists();
    })
    .catch(error => {
      console.error("Error checking server:", error);
      return false;
    });
};

usersRef.on("child_added", (snapshot) => {
  const AllUsers = snapshot.val().username;
  const AllPWS = snapshot.val().keyphrase;
  userAccs.push(AllUsers);
  userKeyphr.push(AllPWS);
});

ServerKeys.on("child_added", (snapshot) => {
  const AllServers = snapshot.val().serverID;
  const ServerKeyphrase = snapshot.val().SKey;
  ServersWithKey.push(AllServers);
  ServerKeyphrs.push(ServerKeyphrase);
});

// Export functions for GUI to use
module.exports = { sendMessage, getMessages, getUsernames, addUser, getUserAccs, getUserKeyphr, CheckServerExists, ServerHasKey, GetServerKey};
