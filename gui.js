const gi = require('node-gtk');
const Gtk = gi.require('Gtk', '3.0');
const backend = require('./backend'); // Import backend

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
function updateChatDisplay() {
    chatBuffer.setText('', 0); // Clear the buffer
    const messages = backend.getMessages(); // Get messages from backend
    const usernames = backend.getUsernames();
    const iter = chatBuffer.getEndIter();
    let count = 0;
    for (let i = 0; i < usernames.length; i++) {
        const markupUsername = `<span foreground="red">${usernames[count]}</span>\n`;
        const markupMessage = `<span foreground="white">${messages[count]}</span>\n`;
        chatBuffer.insertMarkup(iter, markupUsername, -1);
        chatBuffer.insertMarkup(iter, markupMessage, -1);
        count++;
      } 
    //chatBuffer.setText(messages.join("\n"), messages.join("\n").length);
    //chatBuffer.insertMarkup(iter, markupMessage, -1); // Insert markup text
}

// Real-time message updates
setInterval(updateChatDisplay, 1000); // Refresh every second

// Event listeners
sendButton.connect('clicked', sendMessage);
entry.connect('activate', sendMessage);

// Show window
win.showAll();
Gtk.main();
