// In public/js/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    redirectToLoginIfNotAuthenticated(); // Check auth status

    const logoutButton = document.getElementById('logoutButton');
    const addVehicleForm = document.getElementById('addVehicleForm');
    const vehiclesListDiv = document.getElementById('vehiclesList');
    const vehicleMessageElement = document.getElementById('vehicleMessage');

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            removeToken();
            window.location.href = '/index.html'; // Redirect to login
        });
    }

    // Function to fetch and display vehicles
    async function fetchAndDisplayVehicles() {
        if (!isLoggedIn()) return;
        vehicleMessageElement.textContent = '';
        try {
            const token = getToken();
            const response = await fetch('/api/vehicles', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 401 || response.status === 403) { // Unauthorized or Forbidden
                removeToken();
                window.location.href = '/index.html';
                return;
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch vehicles');
            }
            
            const vehicles = await response.json();
            vehiclesListDiv.innerHTML = ''; // Clear current list
            if (vehicles.length === 0) {
                vehiclesListDiv.innerHTML = '<p>No vehicles added yet.</p>';
            } else {
                vehicles.forEach(vehicle => {
                    const vehicleDiv = document.createElement('div');
                    vehicleDiv.innerHTML = `
                        <h3>${vehicle.make} ${vehicle.model} (${vehicle.year})</h3>
                        <p>Mileage: ${vehicle.current_mileage} km</p>
                        <p><small>ID: ${vehicle._id}</small></p>
                    `;
                    vehiclesListDiv.appendChild(vehicleDiv);
                });
            }
        } catch (error) {
            vehiclesListDiv.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
        }
    }

    // Handle Add Vehicle Form
    if (addVehicleForm) {
        addVehicleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            vehicleMessageElement.textContent = '';
            const make = e.target.make.value;
            const model = e.target.model.value;
            const year = e.target.year.value;
            const current_mileage = e.target.current_mileage.value;

            try {
                const token = getToken();
                const response = await fetch('/api/vehicles', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ make, model, year, current_mileage })
                });

                const data = await response.json();
                if (response.ok) {
                    vehicleMessageElement.textContent = 'Vehicle added successfully!';
                    vehicleMessageElement.style.color = 'green';
                    addVehicleForm.reset();
                    fetchAndDisplayVehicles(); // Refresh the list
                } else {
                    vehicleMessageElement.textContent = data.message || 'Failed to add vehicle.';
                    vehicleMessageElement.style.color = 'red';
                }
            } catch (error) {
                vehicleMessageElement.textContent = 'Error: ' + error.message;
                vehicleMessageElement.style.color = 'red';
            }
        });
    }

    // Initial fetch of vehicles
    fetchAndDisplayVehicles();
});
