from PyQt5.QtWidgets import QApplication, QSystemTrayIcon, QMenu, QAction
from PyQt5.QtGui import QIcon
import sys

def main():
    app = QApplication(sys.argv)

    tray = QSystemTrayIcon()
    tray.setIcon(QIcon("./icons/icons/tray icon.png"))
    tray.setToolTip("Da Chatting Bois")

    menu = QMenu()

    # Show App
    show_action = QAction("Show App", menu)
    show_action.triggered.connect(lambda: print("SHOW_APP", flush=True))
    menu.addAction(show_action)

    # Quit App
    quit_action = QAction("Quit", menu)
    quit_action.triggered.connect(lambda: print("QUIT_APP", flush=True))
    quit_action.triggered.connect(app.quit)
    menu.addAction(quit_action)

    def on_tray_activated(reason):
        if reason == QSystemTrayIcon.Trigger:  # Left click
            print("SHOW_APP", flush=True)

    tray.activated.connect(on_tray_activated)

    tray.setContextMenu(menu)
    tray.show()

    # Make sure to properly exit the application if "QUIT_APP" is triggered
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()
