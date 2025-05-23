// Create public/js/auth.common.js
const TOKEN_KEY = 'maintenanceTrackerToken';

function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

// Basic check if user is logged in (token exists)
function isLoggedIn() {
    return !!getToken();
}

// Redirect to login if not authenticated
function redirectToLoginIfNotAuthenticated() {
    if (!isLoggedIn() && !window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('register.html') && window.location.pathname !== '/') {
         // Allow access to index.html which might be the login page or redirect to login.html
        if (window.location.pathname === '/' && !document.getElementById('loginForm')) { // If index.html is not login page
             window.location.href = '/login.html';
        } else if (window.location.pathname !== '/') {
             window.location.href = '/login.html';
        }
    }
}
