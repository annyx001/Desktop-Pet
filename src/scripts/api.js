const SERVER_URL = 'http://localhost:8000';

let authToken = null;

// Called by login-renderer after login to set the token
function setToken(token) {
    authToken = token;
}

// Helper function to make authenticated requests
async function apiRequest(method, endpoint, body = null){

    // Build headers 
    const headers = {
        'Content-Type': 'application/json'
    };

    // Add Authorization header only if token exists
    if (authToken  !== null) {
        headers['Authorization'] = `Bearer ${authToken }`;
    }

    const options = {
        method,
        headers,
    };

    if (body !== null){
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${SERVER_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok){
        throw new Error(data.error || 'Server error');
    }

    return data;
}

// Auth
async function register(username, email, password) {
    return apiRequest('POST', '/auth/register', { username, email, password });
}

async function login(username, password) {
    return apiRequest('POST', '/auth/login', { username, password });
}

// Friends
async function getFriends() {
    return apiRequest('GET', '/friends');
}

async function addFriend(username) {
    return apiRequest('POST', '/friends/add', { username });
}

async function acceptFriend(requestId) {
    return apiRequest('PUT', '/friends/accept', { requestId });
}

async function removeFriend(friendId) {
    return apiRequest('DELETE', '/friends/remove', { friendId });
}

async function getPendingRequests() {
    return apiRequest('GET', '/friends/pending');
}

// Messages
async function sendMessage(receiverId, messageType, content = null) {
    return apiRequest('POST', '/messages/send', { receiverId, messageType, content });
}

async function getMessages(friendId) {
    return apiRequest('GET', `/messages/${friendId}`);
}

module.exports = {
    setToken,
    register,
    login,
    getFriends,
    addFriend,
    acceptFriend,
    removeFriend,
    getPendingRequests,
    sendMessage,
    getMessages,
};