const Notify = require("node-gtk").require("Notify");
const { exec } = require("child_process");

Notify.init("Messenger");

function SendNotification(title, message) {
    console.log("[Notify] Title:", title);
    console.log("[Notify] Message:", message);

    const notification = Notify.Notification.new(title, message, null);
    exec("paplay /usr/share/sounds/freedesktop/stereo/message.oga");
    notification.show();
}

module.exports = { SendNotification };