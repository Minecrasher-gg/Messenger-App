const gi = require('node-gtk');
const GdkPixbuf = require("node-gtk").require("GdkPixbuf");
const Gtk = gi.require('Gtk', '3.0');
const { PythonShell } = require('python-shell');
const path = require('path');
const backend = require('./backend');
const Notify = require('./notifier');

let loggedIn = false;

gi.startLoop();
Gtk.init();

// Create window
const win = new Gtk.Window();
win.setTitle('Messenger');
win.setDefaultSize(1000, 600);
win.connect('destroy', () => {
    Gtk.mainQuit();
    process.exit(0);
});

// Dark mode for the homies
const settings = Gtk.Settings.getDefault();
settings.gtkApplicationPreferDarkTheme = true;

// Function to start the tray and listen for messages
function startTray() {
  trayProcess = new PythonShell('./icons/tray-icon.py', {
    mode: 'text',
    pythonPath: 'python3', // Or just 'python' depending on your system
  });

  // Listen for messages from the tray
  trayProcess.on('message', (message) => {

    // If message is SHOW_APP, focus the app window
    if (message === 'SHOW_APP') {
      if (win) {
        win.present();
      };
    };

    // If message is QUIT_APP, quit the app
    if (message === 'QUIT_APP') {
      // Kill the Python process and exit the Node.js process
      trayProcess.kill();
      Gtk.mainQuit();  // Quit the Gtk event loop
      process.exit(0); // Exit the Node.js process
    };
  });

  // Handle clean exit (kill the Python process when the app exits)
  process.on('exit', () => trayProcess.kill());
  process.on('SIGINT', () => {
    trayProcess.kill();
    Gtk.mainQuit();  // Ensure the Gtk app quits properly
    process.exit();
  });
  process.on('SIGTERM', () => {
    trayProcess.kill();
    Gtk.mainQuit();  // Ensure the Gtk app quits properly
    process.exit();
  });
};

startTray();

// Box for horizontal layout for the server list
const MAINBox = new Gtk.Box({
  orientation: Gtk.Orientation.HORIZONTAL,
  spacing: 10,
});

// Box for the servers
const sidebar = new Gtk.Box({
  orientation: Gtk.Orientation.VERTICAL,
  spacing: 5,
});

// Box for the send button and stuff
const SendBox = new Gtk.Box({
  orientation: Gtk.Orientation.HORIZONTAL,
  spacing: 10,
})

// Box for putting all the Buttons n shit into
const vbox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10 });

// All windows getting put into one
MAINBox.packStart(sidebar, false, false, 0);
MAINBox.packStart(vbox, false, false, 0);
win.add(MAINBox);

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
    passwordEntry.connect('activate', () => {
      PutInUsername = usernameEntry.getText(); 
      PutInKeyphr = passwordEntry.getText(); 
      TryLogin();
    });
    lbox.packStart(logintext, false, false, 10);
    lbox.packStart(usernametext, false, false, 10);
    lbox.packStart(usernameEntry, false, false, 10);
    lbox.packStart(passwordtext, false, false, 0);
    lbox.packStart(passwordEntry, false, false, 10);
    lbox.packStart(loginClicker, false, false, 10);
    loginWin.add(lbox);
    loginWin.showAll();
});
vbox.packStart(loginButton, false, false, 0);


// Everything for the register screen needed outside itself
const RegisterWin = new Gtk.Window();
const rBox = new Gtk.Box({
  orientation: Gtk.Orientation.VERTICAL,
  spacing: 10,
});
const RegisterButton = new Gtk.Button({label: "Register"});
const RegisterResult = new Gtk.Label();

RegisterButton.on("clicked", () => {
  RegisterWin.setTitle("Register prompt");
    RegisterWin.setDefaultSize(550, 200);
    const registertext = new Gtk.Label({ label: "Welcome to messenger! Enter your username and a password to get started"});
    const usernametext = new Gtk.Label({ label: "Username:"});
    const passwordtext = new Gtk.Label({ label: "Password:"});
    const registerClicker = new Gtk.Button({ label: "Register"});
    registerClicker.on("clicked", () => {
      PutInUsername = usernameEntry.getText();
      PutInKeyphr = passwordEntry.getText();
      const userAccs = backend.getUserAccs();
      RegisterWin.showAll();
      if (userAccs.indexOf(PutInUsername) === -1) {
        if (PutInKeyphr === "") {
          rBox.remove(RegisterResult);
          const message = "You gotta give your account a password, y'know....";
          RegisterResult.setMarkup(`<span foreground="lightblue">${message}</span>`);
          rBox.packStart(RegisterResult, false, false, 10);
          RegisterWin.showAll();
        }else {
          rBox.remove(RegisterResult);
          backend.addUser(PutInUsername, PutInKeyphr);
          TryLogin();
        }
      }else {
        rBox.remove(RegisterResult);
        const message = "Whoops! That username is already in use. Try a different one!";
        RegisterResult.setMarkup(`<span foreground="lightblue">${message}</span>`);
       rBox.packStart(RegisterResult, false, false, 10);
       RegisterWin.showAll();
        
      }
    });
    const usernameEntry = new Gtk.Entry();
    const passwordEntry = new Gtk.Entry();
    passwordEntry.connect('activate', () => {
      PutInUsername = usernameEntry.getText();
      PutInKeyphr = passwordEntry.getText();
      const userAccs = backend.getUserAccs();
      RegisterWin.showAll();
      if (userAccs.indexOf(PutInUsername) === -1) {
        if (PutInKeyphr === "") {
          rBox.remove(RegisterResult);
          const message = "You gotta give your account a password, y'know....";
          RegisterResult.setMarkup(`<span foreground="lightblue">${message}</span>`);
          rBox.packStart(RegisterResult, false, false, 10);
          RegisterWin.showAll();
        }else {
          rBox.remove(RegisterResult);
          backend.addUser(PutInUsername, PutInKeyphr);
          TryLogin();
        }
      }else {
        rBox.remove(RegisterResult);
        const message = "Whoops! That username is already in use. Try a different one!";
        RegisterResult.setMarkup(`<span foreground="lightblue">${message}</span>`);
        rBox.packStart(RegisterResult, false, false, 10);
        RegisterWin.showAll();
      }
    });
    rBox.packStart(registertext, false, false, 10);
    rBox.packStart(usernametext, false, false, 10);
    rBox.packStart(usernameEntry, false, false, 10);
    rBox.packStart(passwordtext, false, false, 0);
    rBox.packStart(passwordEntry, false, false, 10);
    rBox.packStart(registerClicker, false, false, 10);
    RegisterWin.add(rBox);
    RegisterWin.showAll();
});
vbox.packStart(RegisterButton, false, false, 0);

// Login beggar
const LoginPlease = new Gtk.Button();
const pixbufLogin = GdkPixbuf.Pixbuf.newFromFileAtScale(
  "./icons/icons/locked icon.svg",
  800,
  800,
  true
);
const LoginImage = Gtk.Image.newFromPixbuf(pixbufLogin);
LoginPlease.setImage(LoginImage);
LoginPlease.setAlwaysShowImage(true);

// Input field
const entry = new Gtk.Entry();
entry.setSizeRequest(400, 50);
ChatToolsShouldShow();

// Send button
const sendButton = new Gtk.Button();
const pixbufSend = GdkPixbuf.Pixbuf.newFromFileAtScale(
  "./icons/icons/send icon.svg",
  40,  // width
  40,  // height
  true // preserve aspect ratio
);
const SendImage = Gtk.Image.newFromPixbuf(pixbufSend);
sendButton.setImage(SendImage);
sendButton.setAlwaysShowImage(true);

// Example server button
const Server1Button = new Gtk.Button({ label: "S1"});
sidebar.packStart(Server1Button, false, false, 0);

// Add server button
const AddServerButton = new Gtk.Button();
const pixbufAddServer = GdkPixbuf.Pixbuf.newFromFileAtScale(
  "./icons/icons/plus icon.svg",
  30,
  30,
  true
);
const AddServerImage = Gtk.Image.newFromPixbuf(pixbufAddServer);
AddServerButton.setImage(AddServerImage);
AddServerButton.setAlwaysShowImage(true);

// Function to send a message
function sendMessage() {
    const message = entry.getText();
    const username = PutInUsername;
    if (message.trim() !== '') {
        backend.sendMessage(username, message); // Call backend function
        entry.setText('');
    }
}

// function to hide and show chat stuff
function ChatToolsShouldShow() {
  if (loggedIn == true) {
    SendBox.packStart(entry, false, false, 0);
    SendBox.packStart(sendButton, false, false, 0);
    //vbox.packStart(scrolledWindow, true, true, 0);
    sidebar.packStart(AddServerButton, false, false, 0);
    vbox.packStart(scrolledBWindow, false, false, 0);
    vbox.packStart(SendBox, false, false, 0);
    vbox.remove(loginButton);
    vbox.remove(RegisterButton);
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
    loginWin.destroy();
    RegisterWin.destroy();
  }else {
    lbox.remove(WrongPw);
    lbox.remove(NoUser);
    WrongPw.setMarkup('<span foreground="red">Wrong password</span>');
    lbox.packStart(WrongPw, false, false, 10);
    loginWin.showAll();
  }
}

// Create a ScrolledWindow (the scrollable area)
const scrolledBWindow = new Gtk.ScrolledWindow();
scrolledBWindow.setPolicy(Gtk.PolicyType.ALWAYS, Gtk.PolicyType.ALWAYS);
scrolledBWindow.setSizeRequest(800, 500);

// Create a Box to hold the message buttons
const Messagebox = new Gtk.Box({
  orientation: Gtk.Orientation.VERTICAL,
  spacing: 0,
});

scrolledBWindow.add(Messagebox);

// Function to update chat display
let cachedMessageCount = 0;
let FirstUse = true;

function clearBox(box) {
  const children = box.getChildren(); // Get all child widgets
  children.forEach(child => {
    box.remove(child); // Remove each widget from the box
  });
}

// Function to create a button with colored text
function createStyledButton(label, color) {
  const button = new Gtk.Button();
  
  // Create a Gtk.Label with markup inside the button
  const labelWidget = new Gtk.Label();
  const markup = `<span foreground="${color}" size="14000">${label}</span>`;
  labelWidget.setMarkup(markup);
  labelWidget.setLineWrap(true);
  labelWidget.setLineWrapMode(0);
  labelWidget.setSizeRequest(400, -1);
  
  // Add the label inside the button
  button.add(labelWidget);
  
  Messagebox.add(button);
}

function updateChatDisplay() {
  const messages = backend.getMessages();
  const usernames = backend.getUsernames();

  if (loggedIn == false) {
    return;
  }

  if (messages.length === cachedMessageCount) {
    return;
  }

  // Update cached message count
  cachedMessageCount = messages.length;

  clearBox(Messagebox);
  for (let i = 0; i < usernames.length; i++) {
    const StringUsername = String(usernames[i]);
    const StringMessage = String(messages[i]);
    const UsernameButton = createStyledButton( StringUsername, "red");
    const MessageButton = createStyledButton( StringMessage, "grey");
    win.showAll();
  }

  // Notify about new message message
  if (FirstUse == true) {
    FirstUse = false;
  }else if (PutInUsername != usernames[usernames.length-1]) {
    Notify.SendNotification("New message", messages[messages.length-1]);
  };
};

// Real-time message updates
setInterval(updateChatDisplay, 1000); // Refresh every second

// Event listeners
sendButton.connect('clicked', sendMessage);
entry.connect('activate', sendMessage);

// Prevent closing (instead hiding)
win.on("delete-event", (ev) => {
  win.hide();
  return true; // prevents default behavior (destroy)
});

// Show window
win.showAll();
Gtk.main();