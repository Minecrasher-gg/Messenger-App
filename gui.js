const gi = require('node-gtk');
const Gtk = gi.require('Gtk', '3.0');
const backend = require('./backend'); // Import backend

let loggedIn = false;

gi.startLoop();
Gtk.init();

// Create window
const win = new Gtk.Window();
win.setTitle('Messenger');
win.setDefaultSize(400, 300);
win.connect('destroy', () => {
    Gtk.mainQuit();
    process.exit(0);
});
// Dark mode for the homies
const settings = Gtk.Settings.getDefault();
settings.gtkApplicationPreferDarkTheme = true;

// Box for putting all the Buttons n shit into
const vbox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10 });
win.add(vbox);

// Everything for the login window that needs to be accessed outside itself
const loginWin = new Gtk.Window();
const lbox = new Gtk.Box({
  orientation: Gtk.Orientation.VERTICAL,
  spacing: 10,
});
let PutInUsername = "";
let PutInKeyphr = "";

const loginButton = new Gtk.Button({ label: "login"});
loginButton.on("clicked", () => {
    loginWin.setTitle("Login prompt");
    loginWin.setDefaultSize(400, 200);
    const logintext = new Gtk.Label({ label: "Welcome back! Enter you username and password"});
    const usernametext = new Gtk.Label({ label: "Username:"});
    const passwordtext = new Gtk.Label({ label: "Password:"});
    const loginClicker = new Gtk.Button({ label: "login"});
    loginClicker.on("clicked", () => {
      PutInUsername = usernameEntry.getText();
      PutInKeyphr = passwordEntry.getText();
      TryLogin();
    });
    const usernameEntry = new Gtk.Entry();
    const passwordEntry = new Gtk.Entry();
    passwordEntry.connect('activate', TryLogin);
    lbox.packStart(logintext, false, false, 10);
    lbox.packStart(usernametext, false, false, 10);
    lbox.packStart(usernameEntry, false, false, 10);
    lbox.packStart(passwordtext, false, false, 0);
    lbox.packStart(passwordEntry, false, false, 10);
    lbox.packStart(loginClicker, false, false, 10);
    loginWin.add(lbox);
    loginWin.showAll();
})
vbox.packStart(loginButton, false, false, 0);

// Chat display
const chatDisplay = new Gtk.TextView();
chatDisplay.setEditable(false);
const chatBuffer = chatDisplay.getBuffer();
const scrolledWindow = new Gtk.ScrolledWindow();
scrolledWindow.add(chatDisplay);

// Login beggar
const LoginPlease = new Gtk.Label();
LoginPlease.setMarkup('<span foreground="red" size="20480">Please log in to view chat</span>');

// Input field
const entry = new Gtk.Entry();
ChatToolsShouldShow();

// Send button
const sendButton = new Gtk.Button({ label: 'Send' });

// Function to send a message
function sendMessage() {
    const message = entry.getText();
    const username = "Fryer";
    if (message.trim() !== '') {
        backend.sendMessage(username, message); // Call backend function
        entry.setText('');
    }
}

// function to hide and show chat stuff
function ChatToolsShouldShow() {
  if (loggedIn == true) {
    vbox.packStart(scrolledWindow, true, true, 0);
    vbox.packStart(entry, false, false, 0);
    vbox.packStart(sendButton, false, false, 0);
  }else {
    vbox.packStart(LoginPlease, false, false, 50);
  }
}

const NoUser = new Gtk.Label();
const WrongPw = new Gtk.Label();

// function for login validation
function TryLogin() {
  const UserAccs = backend.getUserAccs();
  const UserKeyphr = backend.getUserKeyphr();
  let position = UserAccs.indexOf(PutInUsername);
  if (position === -1) {
    lbox.remove(WrongPw);
    lbox.remove(NoUser);
    NoUser.setMarkup('<span foreground="red">User does not exist</span>');
    lbox.packStart(NoUser, false, false, 10);
    loginWin.showAll();
  }else if (UserKeyphr[position] === PutInKeyphr) {
    loggedIn = true;
    vbox.remove(LoginPlease);
    ChatToolsShouldShow();
    lbox.remove(WrongPw);
    lbox.remove(NoUser);
    win.showAll();
  }else {
    lbox.remove(WrongPw);
    lbox.remove(NoUser);
    WrongPw.setMarkup('<span foreground="red">Wrong password</span>');
    lbox.packStart(WrongPw, false, false, 10);
    loginWin.showAll();
  }
}

// Function to update chat display
let cachedMessageCount = 0;

function updateChatDisplay() {
  const messages = backend.getMessages();
  const usernames = backend.getUsernames();

  if (loggedIn == false) {
    chatBuffer.setText('', 0);
    const iter = chatBuffer.getEndIter();
    const markuplogin= `<span foreground="blue">loading messages...</span>\n`;
    chatBuffer.insertMarkup(iter, markuplogin, -1);
    return;
  }

  if (messages.length === cachedMessageCount) {
    return;
  }

  // Update cached message count
  cachedMessageCount = messages.length;

  chatBuffer.setText('', 0); // Clear the buffer
  const iter = chatBuffer.getEndIter();
  for (let i = 0; i < usernames.length; i++) {
    const markupUsername = `<span foreground="red">${usernames[i]}</span>\n`;
    const markupMessage = `<span foreground="grey">${messages[i]}</span>\n`;
    chatBuffer.insertMarkup(iter, markupUsername, -1);
    chatBuffer.insertMarkup(iter, markupMessage, -1);
  }
  // Scroll to bottom after updating chat
  const mark = chatBuffer.createMark(null, chatBuffer.getEndIter(), false);
  chatDisplay.scrollToMark(mark, 0, true, 0, 1); // chatView is your Gtk.TextView
}

// Real-time message updates
setInterval(updateChatDisplay, 1000); // Refresh every second

// Event listeners
sendButton.connect('clicked', sendMessage);
entry.connect('activate', sendMessage);

// Show window
win.showAll();
Gtk.main();
