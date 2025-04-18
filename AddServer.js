const gi = require('node-gtk');
const Gtk = gi.require('Gtk', '3.0');
const Servers = require('./backend');
const App = require('./gui');



function AddServer(Current) {

    gi.startLoop();
    Gtk.init();
    
    // Create window
    const Awin = new Gtk.Window();
    Awin.setTitle('Add server');
    Awin.setDefaultSize(500, 200);
    
    const MAINBox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 10,
      });
    
    const Info = new Gtk.Label({ label: "If you received an invite"});
    const Info2 = new Gtk.Label({ label: "Enter the valid code here:"});
    const Input = new Gtk.Entry();
    const Error = new Gtk.Label({ label: "Server not found"});

    MAINBox.packStart(Info, false, false, 0);
    MAINBox.packStart(Info2, false, false, 0);
    MAINBox.packStart(Input,false, false, 0);
    Awin.add(MAINBox);
    return new Promise((resolve, reject) => {
      Input.connect("activate", () => {
        const ServerID = Input.getText();
        const [ServerName, ServerKey] = ServerID.split(":");
        const ServerPasswordRequired = Servers.ServerHasKey(ServerName);
        Servers.CheckServerExists(ServerName).then(ServerExists => {
          if (ServerExists) {
            MAINBox.remove(Error);
            if (ServerPasswordRequired == true) {
                if (ServerKey == Servers.GetServerKey(ServerName)) {
                    console.log("Server", ServerName, "added");
                    resolve(ServerName);
                    Awin.destroy();
                }else {
                    console.log("Error: Wrong password motherf");
                }
            }else {
                console.log("Server", ServerName, "added");
                resolve(ServerName);
                Awin.destroy();
            }
          } else {
            MAINBox.remove(Error);
            MAINBox.packStart(Error, false, false, 10);
            Awin.showAll();
          }
        });
      });
  
      Awin.connect('destroy', () => {
        reject("User closed the window");
      });
  
      Awin.showAll();
    });
  }

module.exports = { AddServer };