// This is like a security gatekeeper between main.js and the renderer.js

const { contextBridge, ipcRenderer} = require('electron');

//Expose a safe, limited API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    //Listen for meeting reminders from main.js
    onShowReminder: (callback) => {
        ipcRenderer.on('show-reminder', (event, meeting) => {
            callback(meeting);
        });
    },

    //Move the window (for dragging)
    moveWindow: (x,y) => {
        ipcRenderer.send('move-window', {x,y});
    }, 

    loginSuccess: (user) => {
        ipcRenderer.send('login-success', user);
    },

    saveUserData: (token, user) => {
        ipcRenderer.send('save-user-data', { token, user });
   },
});
