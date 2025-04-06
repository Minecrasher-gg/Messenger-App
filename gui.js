const gi = require('node-gtk');
const Gtk = gi.require('Gtk', '3.0');
const backend = require('./backend'); // Import backend

gi.startLoop();
Gtk.init();

// ------ NEW CHATGPT LOGIN STUFF -------

// function showLoginDialog(parent) {
  // Create a new dialog window
//  const dialog = new Gtk.Dialog();
//  dialog.setTitle("Login");
//  dialog.setTransientFor(parent);
//  dialog.setModal(true);

  // Create username & password fields
//  const contentArea = dialog.getContentArea();
//  const usernameEntry = new Gtk.Entry();
//  usernameEntry.setPlaceholderText("Username");

//  const passwordEntry = new Gtk.Entry();
//  passwordEntry.setPlaceholderText("Password");
//  passwordEntry.setVisibility(false); // Hide password characters

  // Add fields to the dialog
//  contentArea.packStart(usernameEntry, false, false, 5);
//  contentArea.packStart(passwordEntry, false, false, 5);

  // Add "Login" and "Cancel" buttons
//  dialog.addButton("Cancel", Gtk.ResponseType.CANCEL);
//  dialog.addButton("Login", Gtk.ResponseType.OK);

  // Show all elements
//  dialog.showAll();

  // Wait for user response
//  dialog.connect("response", (widget, response) => {
//    if (response === Gtk.ResponseType.OK) {
//      console.log("Logging in with:", usernameEntry.getText(), passwordEntry.getText());
//    }
//    dialog.destroy(); // Close the dialog
//  });
//}

// Create a login button
//const loginButton = new Gtk.Button({ label: "Log In" });
//loginButton.connect("clicked", () => showLoginDialog(win));

//const box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10 });
//box.packStart(loginButton, false, false, 10);
//win.add(box);

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
