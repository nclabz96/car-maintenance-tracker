// In public/js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageElement = document.getElementById('loginMessage');

    if (isLoggedIn()) {
        window.location.href = '/dashboard.html'; // Redirect if already logged in
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        messageElement.textContent = '';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
                saveToken(data.token);
                messageElement.textContent = 'Login successful! Redirecting...';
                messageElement.style.color = 'green';
                window.location.href = '/dashboard.html';
            } else {
                messageElement.textContent = data.message || 'Login failed.';
                messageElement.style.color = 'red';
            }
        } catch (error) {
            messageElement.textContent = 'Error: ' + error.message;
            messageElement.style.color = 'red';
        }
    });
});
