const { app, BrowserWindow, screen, Menu, ipcMain } = require('electron'); //this imports four tools from Electron
const path = require('node:path');
const { checkUpcomingMeetings } = require('./calendar');
const { isLoggedIn, getUser, saveUserData } = require('./store');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let petWindow = null;
let loginWindow = null;

//Specifying the size of the window that will appear
const WINDOW_WIDTH = 200;
const WINDOW_HEIGHT = 200;
const WINDOW_MARGIN = 20;

//----Create Login window----------------------------------------------------------
function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 380,
    height: 520,
    resizable: false,
    webPreferences: {
      preload: LOGIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

    // Override CSP headers
  loginWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data:; connect-src 'self' http://localhost:8000 ws://localhost:* ws://0.0.0.0:*"
        ]
      }
    });
  });

  loginWindow.loadURL(LOGIN_WINDOW_WEBPACK_ENTRY);

  loginWindow.on('closed', () => {
    loginWindow = null;
  });
}

//----Create Pet Window------------------------------------------------------------
function createPetWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  const x = screenWidth - WINDOW_WIDTH - WINDOW_MARGIN;
  const y = screenHeight - WINDOW_HEIGHT - WINDOW_MARGIN;

  // create the window
  petWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    x,
    y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  petWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Right-click context menu with the Quit option
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);

  petWindow.webContents.on('context-menu', () => {
    contextMenu.popup({ window: petWindow });
  });

  petWindow.on('closed', () => {
    petWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  // Check if user is already logged in
  if (isLoggedIn()) {

    // If user is logged in already then load the pet window
    createPetWindow();

    // Start checking for upcoming meetings every 5 minutes
    startMeetingChecker();
  }
  else {

    // If user is not already logged in then load the login window
    createLoginWindow();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (isLoggedIn()) {
        createPetWindow();
      } else {
        createLoginWindow();
      }
    }
  });
});

ipcMain.on('login-success', (event, user) => {
  console.log('User logged in:', user.username);

  // Close login window
  if (loginWindow !== null) {
    loginWindow.close();
  }

  // Load pet window
  createPetWindow();

  // Start meeting checker
  startMeetingChecker();
});

ipcMain.on('save-user-data', (event, { token, user }) => {
    saveUserData(token, user);
});

ipcMain.on('move-window', (event, { x, y }) => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.setPosition(Math.round(x), Math.round(y));
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


//-----Meeting Checker Methods--------------------------------------------
function startMeetingChecker() {
  // Check for meetings immediately when app starts
  checkForMeeting();

  // Then check every 1 mins 
  setInterval(checkForMeeting, 1 * 60 * 1000)
}

function checkForMeeting() {
  const allWindows = BrowserWindow.getAllWindows();

  // Only check if window exists
  if (allWindows.length == 0) return;

  const mainWindow = allWindows[0];

  checkUpcomingMeetings((meeting) => {
    console.log('Meeting reminder:', meeting.title);

    //Send IPC message to renderer to show the reminder
    mainWindow.webContents.send('show-reminder', {
      title: meeting.title,
      minutesUntil: meeting.minutesUntil,
    });

    console.log('IPC message sent!');

  });
}


