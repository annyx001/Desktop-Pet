const { login, register, setToken } = require('./api');

// Get elements on login page
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const errorMsg = document.getElementById('error-msg');
const successMsg = document.getElementById('success-msg');


// Event Listener for Tab Switching---------------------------
// When user click on login tab
loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    clearMessages();
});

// When user click on register tab
registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
    clearMessages();
});
//------------------------------------------------------------


// Helper Functions-------------------------------------------
function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    successMsg.style.display = 'none';
}

function showSuccess(message) {
    successMsg.textContent = message;
    successMsg.style.display = 'block';
    errorMsg.style.display = 'none';
}

function clearMessages() {
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
}

function setButtonLoading(btn, isLoading) {
    // Disable btn while waiting for server to response
    btn.disabled = isLoading;
    btn.textContent = isLoading ? 'Please wait...' : btn.dataset.label;
}


//-----Handle Logging In Event---------------
loginBtn.dataset.label = 'Login';
loginBtn.addEventListener('click', async () => {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    // Show error if neither username or password is not filled out
    if (!username || !password) {
        showError('Please enter username and password');
        return;
    }

    setButtonLoading(loginBtn, true);
    clearMessages();

    try {
        // Call login method from api
        const result = await login(username, password);

        // Call settoken method from api
        setToken(result.token);

        // Save token and user info locally
        window.electronAPI.saveUserData(result.token, result.user);

        showSuccess('Logged in!');

        setTimeout(() => {
            window.electronAPI.loginSuccess(result.user);
        }, 1000);
    }
    catch (error) {
        showError(error.message);
    }
    finally {
        setButtonLoading(loginBtn, false);
    }
});

//-----Handle Registering Event---------------
registerBtn.dataset.label = 'Create Account';
registerBtn.addEventListener('click', async () => {
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();

    // Check if all fields are filled in
    if (!username || !email || !password) {
        showError('Please fill in all the fields');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }

    setButtonLoading(registerBtn, true);
    clearMessages();

    try {
        // Call the register method from api
        const result = await register(username, email, password);

        setToken(result.token);

        // Save token and user info locally
        window.electronAPI.saveUserData(result.token, result.user);

        showSuccess('Account created!');

        setTimeout(() => {
            window.electronAPI.loginSuccess(result.user);
        }, 1000);
    }
    catch (error) {
        showError(error.message);
    }
    finally {
        setButtonLoading(registerBtn, false);
    }

});