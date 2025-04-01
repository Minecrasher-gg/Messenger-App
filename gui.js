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
    if (message.trim() !== '') {
        backend.sendMessage(message); // Call backend function
        entry.setText('');
    }
}

// Function to update chat display
function updateChatDisplay() {
    const messages = backend.getMessages(); // Get messages from backend
    chatBuffer.setText(messages.join("\n"));
}

// Real-time message updates
setInterval(updateChatDisplay, 1000); // Refresh every second

// Event listeners
sendButton.connect('clicked', sendMessage);
entry.connect('activate', sendMessage);

// Show window
win.showAll();
Gtk.main();
