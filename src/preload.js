// This is like a security gatekeeper between main.js and the renderer

const { contextBridge, ipcRenderer} = require('electron');

//Expose a safe, limited API to the renderer procoess
contextBridge.exposeInMainWorld('electronAPI', {
    //Listen for metting reminders from main.js
    onShowReminder: (callback) => {
        ipcRenderer.on('show-reminder', (event, meeting) => {
            callback(meeting);
        });
    },

    //Move the window (for dragging)
    moveWindow: (x,y) => {
        ipcRenderer.send('move-window', {x,y});
    }, 
});
