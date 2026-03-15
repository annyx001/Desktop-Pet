const { app, BrowserWindow, screen, Menu, ipcMain } = require('electron'); //this imports four tools from Electron
const path = require('node:path');
const { checkUpcomingMeetings } = require('./calendar');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) 
{
  app.quit();
}

//Specifying the size of the window that will appear
const WINDOW_WIDTH = 200;
const WINDOW_HEIGHT = 200;
const WINDOW_MARGIN = 20;

const createWindow = () => {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  const x = screenWidth - WINDOW_WIDTH - WINDOW_MARGIN;
  const y = screenHeight - WINDOW_HEIGHT - WINDOW_MARGIN;

  // create the window
  const mainWindow = new BrowserWindow({
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
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Right-click context menu with the Quit option
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);

  mainWindow.webContents.on('context-menu', () => {
    contextMenu.popup({ window: mainWindow });
  });

  ipcMain.on('move-window', (event, { x, y }) => 
{
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.setPosition(Math.round(x), Math.round(y));
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => 
{
  createWindow();

  // Start checking for upcoming meetings every 5 minutes
  // Also check immediately when app starts
  startMeetingChecker();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => 
{
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function startMeetingChecker()
{
  // Check for meetings immediately when app starts
  checkForMeeting();

  // Then check every 3 mins 
  setInterval(checkForMeeting, 3*60*1000)
}

function checkForMeeting()
{
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
  });
}


