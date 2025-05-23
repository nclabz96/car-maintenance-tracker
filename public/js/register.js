// In public/js/register.js
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const messageElement = document.getElementById('registerMessage');

    if (isLoggedIn()) {
        window.location.href = '/dashboard.html'; // Redirect if already logged in
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        messageElement.textContent = '';

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role: 'user' }) // Default role, or add role input
            });
            const data = await response.json();
            if (response.ok) {
                messageElement.textContent = 'Registration successful! Please login.';
                messageElement.style.color = 'green';
                setTimeout(() => {
                    window.location.href = '/index.html'; // Redirect to login page
                }, 2000);
            } else {
                messageElement.textContent = data.message || 'Registration failed.';
                messageElement.style.color = 'red';
            }
        } catch (error) {
            messageElement.textContent = 'Error: ' + error.message;
            messageElement.style.color = 'red';
        }
    });
});
