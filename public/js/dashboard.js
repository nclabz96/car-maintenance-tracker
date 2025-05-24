// In public/js/dashboard.js (significant additions)
document.addEventListener('DOMContentLoaded', () => {
    redirectToLoginIfNotAuthenticated();

    const logoutButton = document.getElementById('logoutButton');
    const addVehicleForm = document.getElementById('addVehicleForm');
    const vehiclesListDiv = document.getElementById('vehiclesList');
    const vehicleMessageElement = document.getElementById('vehicleMessage');

    // Delete Modal Elements
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    const cancelDeleteButton = document.getElementById('cancelDeleteButton');
    let vehicleIdToDelete = null;

    // Edit Modal Elements
    const editVehicleModal = document.getElementById('editVehicleModal');
    const closeEditModalButton = document.getElementById('closeEditModal');
    const editVehicleForm = document.getElementById('editVehicleForm');
    
    // Maintenance Modal Elements
    const maintenanceModal = document.getElementById('maintenanceModal');
    const closeMaintenanceModalButton = document.getElementById('closeMaintenanceModal');
    const maintenanceForm = document.getElementById('maintenanceForm');
    const maintenanceModalTitle = document.getElementById('maintenanceModalTitle');
    const maintenanceFormMessage = document.getElementById('maintenanceFormMessage');
    // let currentEditingMaintenanceRecordId = null; // For edit functionality later - (Not explicitly used in provided code for this var)
    // let currentVehicleIdForMaintenance = null; // To know which vehicle we're adding/viewing maint for - (Not explicitly used in provided code for this var, passed as param)


    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            removeToken();
            window.location.href = '/index.html';
        });
    }
    
    // Handle Delete Confirmation for Vehicle
    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', async () => {
            if (vehicleIdToDelete) {
                try {
                    const token = getToken();
                    const response = await fetch(`/api/vehicles/${vehicleIdToDelete}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        vehicleMessageElement.textContent = 'Vehicle deleted successfully.';
                        vehicleMessageElement.style.color = 'green';
                        fetchAndDisplayVehicles(); 
                    } else {
                        const data = await response.json();
                        vehicleMessageElement.textContent = `Error: ${data.message || 'Failed to delete vehicle.'}`;
                        vehicleMessageElement.style.color = 'red';
                    }
                } catch (error) {
                    vehicleMessageElement.textContent = `Error: ${error.message}`;
                    vehicleMessageElement.style.color = 'red';
                }
                deleteConfirmModal.style.display = 'none';
                vehicleIdToDelete = null;
            }
        });
    }

    if (cancelDeleteButton) {
        cancelDeleteButton.addEventListener('click', () => {
            deleteConfirmModal.style.display = 'none';
            vehicleIdToDelete = null;
        });
    }

    async function fetchAndDisplayVehicles() {
        if (!isLoggedIn()) return;
        vehicleMessageElement.textContent = '';
        try {
            const token = getToken();
            const response = await fetch('/api/vehicles', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401 || response.status === 403) {
                removeToken(); window.location.href = '/index.html'; return;
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch vehicles');
            }
            const vehicles = await response.json();
            vehiclesListDiv.innerHTML = '';
            if (vehicles.length === 0) {
                vehiclesListDiv.innerHTML = '<p>No vehicles added yet.</p>';
            } else {
                vehicles.forEach(vehicle => {
                    const vehicleDiv = document.createElement('div');
                    vehicleDiv.classList.add('vehicle-item');
                    vehicleDiv.setAttribute('id', `vehicle-${vehicle._id}`);
                    vehicleDiv.innerHTML = `
                        <h3>${vehicle.make} ${vehicle.model} (${vehicle.year})</h3>
                        <p>Mileage: ${vehicle.current_mileage} km</p>
                        <p><small>ID: ${vehicle._id}</small></p>
                        <button class="edit-vehicle-btn" data-id="${vehicle._id}">Edit Vehicle</button>
                        <button class="delete-vehicle-btn" data-id="${vehicle._id}">Delete Vehicle</button>
                        <button class="view-maint-btn" data-id="${vehicle._id}">View/Add Maintenance</button>
                        <div class="maintenance-section" id="maint-${vehicle._id}" style="display:none;">
                            <h4>Maintenance Records</h4>
                            <div class="maintenance-records-list" id="maint-list-${vehicle._id}"></div>
                            <button class="open-add-maint-modal-btn" data-vehicle-id="${vehicle._id}">Add New Record</button>
                        </div>
                    `;
                    vehiclesListDiv.appendChild(vehicleDiv);
                });
            }
            addEventListenersForVehicleActions();
        } catch (error) {
            vehiclesListDiv.innerHTML = `<p style="color:red;">Error fetching vehicles: ${error.message}</p>`;
        }
    }

    function addEventListenersForVehicleActions() {
        document.querySelectorAll('.delete-vehicle-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                vehicleIdToDelete = e.target.dataset.id;
                deleteConfirmModal.style.display = 'flex';
            });
        });

        document.querySelectorAll('.edit-vehicle-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const vehicleId = e.target.dataset.id;
                if (!isLoggedIn()) return;
                const token = getToken();
                try {
                    const vehiclesResponse = await fetch('/api/vehicles', { headers: { 'Authorization': `Bearer ${token}` }});
                    const vehicles = await vehiclesResponse.json();
                    const vehicleToEdit = vehicles.find(v => v._id === vehicleId);

                    if (vehicleToEdit) {
                        document.getElementById('editVehicleId').value = vehicleToEdit._id;
                        document.getElementById('editMake').value = vehicleToEdit.make;
                        document.getElementById('editModel').value = vehicleToEdit.model;
                        document.getElementById('editYear').value = vehicleToEdit.year;
                        document.getElementById('editCurrentMileage').value = vehicleToEdit.current_mileage;
                        editVehicleModal.style.display = 'flex';
                    } else {
                        vehicleMessageElement.textContent = 'Could not find vehicle details to edit.';
                        vehicleMessageElement.style.color = 'red';
                    }
                } catch(err) {
                     vehicleMessageElement.textContent = 'Error fetching vehicle details for edit: ' + err.message;
                     vehicleMessageElement.style.color = 'red';
                }
            });
        });

        document.querySelectorAll('.view-maint-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const vehicleId = e.target.dataset.id;
                // currentVehicleIdForMaintenance = vehicleId; // Not used by provided code
                const maintSection = document.getElementById(`maint-${vehicleId}`);
                if (maintSection.style.display === 'none') {
                    await fetchAndDisplayMaintenanceRecords(vehicleId);
                    maintSection.style.display = 'block';
                    e.target.textContent = 'Hide Maintenance';
                } else {
                    maintSection.style.display = 'none';
                    e.target.textContent = 'View/Add Maintenance';
                }
            });
        });

        document.querySelectorAll('.open-add-maint-modal-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const vehicleId = e.target.dataset.vehicleId;
                openMaintenanceModalForAdd(vehicleId);
            });
        });
    }
    
    async function fetchAndDisplayMaintenanceRecords(vehicleId) {
        const listDiv = document.getElementById(`maint-list-${vehicleId}`);
        listDiv.innerHTML = 'Loading...';
        try {
            const token = getToken();
            const response = await fetch(`/api/vehicles/${vehicleId}/maintenance`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch maintenance records');
            }
            const records = await response.json();
            listDiv.innerHTML = ''; 
            if (records.length === 0) {
                listDiv.innerHTML = '<p>No maintenance records yet.</p>';
            } else {
                records.forEach(record => {
                    const recordDiv = document.createElement('div');
                    recordDiv.classList.add('maintenance-record-item');
                    recordDiv.innerHTML = `
                        <strong>${new Date(record.date).toLocaleDateString()}: ${record.repair_type}</strong> (${record.mileage} km) - $${record.cost}
                        ${record.location ? `<br><small>Location: ${record.location}</small>` : ''}
                        ${record.notes ? `<br><small>Notes: ${record.notes}</small>` : ''}
                        <br>
                        <button class="edit-maint-btn" data-record-id="${record._id}" data-vehicle-id="${vehicleId}">Edit</button>
                        <button class="delete-maint-btn" data-record-id="${record._id}" data-vehicle-id="${vehicleId}">Delete</button>
                    `;
                    listDiv.appendChild(recordDiv);
                });
                addEventListenersForMaintenanceRecordActions(vehicleId);
            }
        } catch (error) {
            listDiv.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
        }
    }
    
    function openMaintenanceModalForAdd(vehicleId) {
        // currentEditingMaintenanceRecordId = null; // Not used by provided code
        maintenanceModalTitle.textContent = 'Add Maintenance Record';
        maintenanceForm.reset();
        document.getElementById('maintenanceVehicleId').value = vehicleId; 
        maintenanceFormMessage.textContent = '';
        maintenanceModal.style.display = 'flex';
    }

    if (closeEditModalButton) {
        closeEditModalButton.addEventListener('click', () => {
            editVehicleModal.style.display = 'none';
        });
    }
    
    if (closeMaintenanceModalButton) {
        closeMaintenanceModalButton.addEventListener('click', () => {
            maintenanceModal.style.display = 'none';
        });
    }

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
                    fetchAndDisplayVehicles(); 
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
    
    if (editVehicleForm) {
        editVehicleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('editVehicleId').value;
            const make = document.getElementById('editMake').value;
            const model = document.getElementById('editModel').value;
            const year = document.getElementById('editYear').value;
            const current_mileage = document.getElementById('editCurrentMileage').value;
            const editVehicleMessage = document.getElementById('editVehicleMessage');
            editVehicleMessage.textContent = '';

            try {
                const token = getToken();
                const response = await fetch(`/api/vehicles/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ make, model, year, current_mileage })
                });
                const data = await response.json();
                if (response.ok) {
                    editVehicleMessage.textContent = 'Vehicle updated successfully!';
                    editVehicleMessage.style.color = 'green';
                    fetchAndDisplayVehicles(); 
                    setTimeout(() => { 
                       editVehicleModal.style.display = 'none';
                       editVehicleMessage.textContent = ''; 
                    }, 1500);
                } else {
                    editVehicleMessage.textContent = data.message || 'Failed to update vehicle.';
                    editVehicleMessage.style.color = 'red';
                }
            } catch (error) {
                editVehicleMessage.textContent = 'Error: ' + error.message;
                editVehicleMessage.style.color = 'red';
            }
        });
    }

    if (maintenanceForm) {
        maintenanceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const vehicleId = document.getElementById('maintenanceVehicleId').value;
            const recordId = document.getElementById('maintenanceRecordId').value;

            const formData = {
                date: document.getElementById('maintDate').value,
                mileage: parseFloat(document.getElementById('maintMileage').value),
                repair_type: document.getElementById('maintRepairType').value,
                cost: parseFloat(document.getElementById('maintCost').value),
                location: document.getElementById('maintLocation').value,
                notes: document.getElementById('maintNotes').value,
            };

            const token = getToken();
            const url = recordId ? `/api/vehicles/${vehicleId}/maintenance/${recordId}` : `/api/vehicles/${vehicleId}/maintenance`;
            const method = recordId ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });
                const data = await response.json();
                if (response.ok) {
                    maintenanceFormMessage.textContent = `Record ${recordId ? 'updated' : 'added'} successfully!`;
                    maintenanceFormMessage.style.color = 'green';
                    fetchAndDisplayMaintenanceRecords(vehicleId); 
                    setTimeout(() => {
                        maintenanceModal.style.display = 'none';
                        maintenanceFormMessage.textContent = '';
                    }, 1500);
                } else {
                    maintenanceFormMessage.textContent = `Error: ${data.message || 'Operation failed.'}`;
                    maintenanceFormMessage.style.color = 'red';
                }
            } catch (error) {
                maintenanceFormMessage.textContent = `Error: ${error.message}`;
                maintenanceFormMessage.style.color = 'red';
            }
        });
    }
    
    function addEventListenersForMaintenanceRecordActions(vehicleId) {
        document.querySelectorAll(`#maint-list-${vehicleId} .edit-maint-btn`).forEach(button => {
            button.addEventListener('click', async (e) => {
                const recordId = e.target.dataset.recordId;
                const vehId = e.target.dataset.vehicleId;
                const token = getToken();
                const response = await fetch(`/api/vehicles/${vehId}/maintenance`, { headers: { 'Authorization': `Bearer ${token}` }});
                const records = await response.json();
                const recordToEdit = records.find(r => r._id === recordId);

                if (recordToEdit) {
                    maintenanceModalTitle.textContent = 'Edit Maintenance Record';
                    document.getElementById('maintenanceRecordId').value = recordToEdit._id;
                    document.getElementById('maintenanceVehicleId').value = vehId; 
                    document.getElementById('maintDate').value = new Date(recordToEdit.date).toISOString().split('T')[0];
                    document.getElementById('maintMileage').value = recordToEdit.mileage;
                    document.getElementById('maintRepairType').value = recordToEdit.repair_type;
                    document.getElementById('maintCost').value = recordToEdit.cost;
                    document.getElementById('maintLocation').value = recordToEdit.location || '';
                    document.getElementById('maintNotes').value = recordToEdit.notes || '';
                    maintenanceFormMessage.textContent = '';
                    maintenanceModal.style.display = 'flex';
                } else {
                    alert('Could not load record for editing.');
                }
            });
        });

        document.querySelectorAll(`#maint-list-${vehicleId} .delete-maint-btn`).forEach(button => {
            button.addEventListener('click', async (e) => {
                const recordId = e.target.dataset.recordId;
                const vehId = e.target.dataset.vehicleId;
                if (confirm('Are you sure you want to delete this maintenance record?')) {
                    const token = getToken();
                    try {
                        const response = await fetch(`/api/vehicles/${vehId}/maintenance/${recordId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (response.ok) {
                            alert('Maintenance record deleted successfully.');
                            fetchAndDisplayMaintenanceRecords(vehId); 
                        } else {
                            const data = await response.json();
                            alert(`Error: ${data.message || 'Failed to delete record.'}`);
                        }
                    } catch (error) {
                        alert(`Error: ${error.message}`);
                    }
                }
            });
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target == deleteConfirmModal) deleteConfirmModal.style.display = 'none';
        if (event.target == editVehicleModal) editVehicleModal.style.display = 'none';
        if (event.target == maintenanceModal) maintenanceModal.style.display = 'none';
    });

    fetchAndDisplayVehicles(); 
});
