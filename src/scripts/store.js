const Store = require('electron-store');

// Creates a local json file to store user data
const store = new Store({
    name: 'desktop-friend-data',  // filename: desktop-friend-data.json
    encryptionKey: 'desktop-friend-secret-key',  // encrypts the file
});

// Save user data after login
function saveUserData(token, user) {
    store.set('token', token);
    store.set('user', user);
}

// Get saved token
function getToken() {
    return store.get('token');
}

// Get saved user info
function getUser() {
    return store.get('user');
}

// Check if user is logged in
function isLoggedIn() {
    return !!store.get('token');
}

// Clear data on logout
function clearUserData() {
    store.delete('token');
    store.delete('user');
}

module.exports = { saveUserData, getToken, getUser, isLoggedIn, clearUserData };