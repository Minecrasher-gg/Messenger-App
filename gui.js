const gi = require('node-gtk');
const Gtk = gi.require('Gtk', '3.0');
const backend = require('./backend'); // Import backend

gi.startLoop();
Gtk.init();

// ------ NEW CHATGPT LOGIN STUFF -------

const loginButton = new Gtk.button({ label: "login"});
loginButton.on("clicked", () => {
    const loginWin = new Gtk.Window();
    loginWin.setTitle("Login prompt");
    loginWin.setDefaultSize(300, 200);
    const logintext = new Gtk.label({ label: "Welcome back! Enter you username and password"});
    const loginClicker = new Gtk.button({ label: "login"});
    loginWin.add(loginClicker);
    loginWin.add(logintext);
    loginWin.showAll();
})
win.add(loginButton);

// --------- NEW CHATGPT STUFF END ---------

// Create window
const win = new Gtk.Window();
win.setTitle('Messenger');
win.setDefaultSize(400, 300);
win.connect('destroy', () => {
    Gtk.mainQuit();
    process.exit(0);
});

// Layout
const vbox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10 });
win.add(vbox);

// Chat display
const chatDisplay = new Gtk.TextView();
chatDisplay.setEditable(false);
const chatBuffer = chatDisplay.getBuffer();
const scrolledWindow = new Gtk.ScrolledWindow();
scrolledWindow.add(chatDisplay);
vbox.packStart(scrolledWindow, true, true, 0);

// Input field
const entry = new Gtk.Entry();
vbox.packStart(entry, false, false, 0);

// Send button
const sendButton = new Gtk.Button({ label: 'Send' });
vbox.packStart(sendButton, false, false, 0);

// Function to send a message
function sendMessage() {
    const message = entry.getText();
    const username = "Fryer";
    if (message.trim() !== '') {
        backend.sendMessage(username, message); // Call backend function
        entry.setText('');
    }
}

// Function to update chat display
let cachedMessageCount = 0;

function updateChatDisplay() {
  const messages = backend.getMessages();
  const usernames = backend.getUsernames();

  if (messages.length === cachedMessageCount) {
    return;
  }

  console.log("New messages detected. Updating chat...");

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
