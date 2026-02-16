// Dashboard JavaScript
// Handles all admin panel operations

// Check if logged in
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
    loadEmployeeTable();
    setupSearchFilter();
    createModals();
});

// Load statistics
function loadStats() {
    const employees = getEmployees();
    const employeeCount = Object.keys(employees).length;
    
    document.getElementById('totalEmployees').textContent = employeeCount;
    
    // Count employees with catalogues
    const withCatalogues = Object.values(employees).filter(emp => emp.catalogue).length;
    document.getElementById('totalCatalogues').textContent = withCatalogues;
    
    // Simulated stats (you can track these in localStorage if needed)
    document.getElementById('totalViews').textContent = employeeCount * 15;
    document.getElementById('totalQRScans').textContent = employeeCount * 8;
}

// Get all employees
function getEmployees() {
    const stored = localStorage.getItem('digitalCardEmployees');
    return stored ? JSON.parse(stored) : {};
}

// Save employees
function saveEmployees(employees) {
    localStorage.setItem('digitalCardEmployees', JSON.stringify(employees));
}

// Load employee table
function loadEmployeeTable() {
    const employees = getEmployees();
    const container = document.getElementById('employeeTableContainer');
    
    if (Object.keys(employees).length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>No employees yet</h3>
                <p>Click "Create New Employee" to add your first employee card!</p>
            </div>
        `;
        return;
    }
    
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Employee</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    Object.values(employees).forEach(emp => {
        const createdDate = new Date(emp.createdAt).toLocaleDateString();
        tableHTML += `
            <tr data-id="${emp.id}">
                <td>
                    <div class="employee-name">${emp.name}</div>
                    <div class="employee-designation">${emp.designation}</div>
                </td>
                <td>${emp.phone}</td>
                <td>${emp.email}</td>
                <td>${createdDate}</td>
                <td>
                    <div class="action-buttons-table">
                        <button class="btn-small btn-view" onclick="viewCard('${emp.id}')">👁️ View</button>
                        <button class="btn-small btn-qr" onclick="showQRModal('${emp.id}')">📱 QR</button>
                        <button class="btn-small btn-edit" onclick="editEmployee('${emp.id}')">✏️ Edit</button>
                        <button class="btn-small btn-delete" onclick="deleteEmployee('${emp.id}')">🗑️ Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

// Search filter
function setupSearchFilter() {
    document.getElementById('searchBox').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Scroll to employees section
function scrollToEmployees() {
    document.getElementById('employeeSection').scrollIntoView({ behavior: 'smooth' });
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    }
}

// View card
function viewCard(id) {
    window.open(`card.html?id=${id}`, '_blank');
}

// Delete employee
function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee card?')) {
        const employees = getEmployees();
        delete employees[id];
        saveEmployees(employees);
        loadStats();
        loadEmployeeTable();
    }
}

// Export data
function exportData() {
    const employees = getEmployees();
    const companySettings = getCompanySettings();
    
    const data = {
        employees: employees,
        companySettings: companySettings,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digital-cards-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Data exported successfully! ✅');
}

// Get company settings
function getCompanySettings() {
    const stored = localStorage.getItem('companySettings');
    return stored ? JSON.parse(stored) : {
        companyName: 'MRK Foods Private Limited',
        companyLogo: null,
        companyWebsite: 'www.mrkfoods.com',
        companyAddress: '',
        companyEmail: 'info@mrkfoods.com',
        companyPhone: ''
    };
}

// Save company settings
function saveCompanySettings(settings) {
    localStorage.setItem('companySettings', JSON.stringify(settings));
}

// Create all modals
function createModals() {
    createEmployeeModal();
    createCompanySettingsModal();
    createQRModal();
}

// Create employee modal
function createEmployeeModal() {
    const modal = document.createElement('div');
    modal.id = 'employeeModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title" id="employeeModalTitle">Create New Employee</h2>
                <button class="modal-close" onclick="closeEmployeeModal()">✕</button>
            </div>
            <div class="modal-body">
                <form id="employeeForm">
                    <input type="hidden" id="employeeId">
                    
                    <div style="display: grid; gap: 20px;">
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">Full Name *</label>
                            <input type="text" id="empName" required style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Poppins', sans-serif;">
                        </div>
                        
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">Designation *</label>
                            <input type="text" id="empDesignation" required style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Poppins', sans-serif;">
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Phone *</label>
                                <input type="tel" id="empPhone" required style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Poppins', sans-serif;">
                            </div>
                            
                            <div>
                                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Email *</label>
                                <input type="email" id="empEmail" required style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Poppins', sans-serif;">
                            </div>
                        </div>
                        
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">Website</label>
                            <input type="url" id="empWebsite" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Poppins', sans-serif;">
                        </div>
                        
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">Address</label>
                            <textarea id="empAddress" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Poppins', sans-serif; resize: vertical;"></textarea>
                        </div>
                        
                        <h3 style="color: #667eea; font-size: 1.1rem; margin-top: 10px;">📱 Social Media</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; font-weight: 600; margin-bottom: 8px;">WhatsApp Number</label>
                                <input type="tel" id="empWhatsapp" placeholder="919876543210" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Poppins', sans-serif;">
                            </div>
                            
                            <div>
                                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Facebook Profile</label>
                                <input type="url" id="empFacebook" placeholder="facebook.com/username" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Poppins', sans-serif;">
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; font-weight: 600; margin-bottom: 8px;">LinkedIn Profile</label>
                                <input type="url" id="empLinkedin" placeholder="linkedin.com/in/username" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Poppins', sans-serif;">
                            </div>
                            
                            <div>
                                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Instagram Profile</label>
                                <input type="url" id="empInstagram" placeholder="instagram.com/username" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Poppins', sans-serif;">
                            </div>
                        </div>
                        
                        <h3 style="color: #667eea; font-size: 1.1rem; margin-top: 10px;">📸 Upload Files</h3>
                        
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">Employee Photo</label>
                            <input type="file" id="empPhoto" accept="image/*" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Poppins', sans-serif;">
                            <div id="photoPreview" style="margin-top: 10px;"></div>
                        </div>
                        
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">Catalogue (PDF or Image)</label>
                            <input type="file" id="empCatalogue" accept=".pdf,image/*" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Poppins', sans-serif;">
                            <div id="cataloguePreview" style="margin-top: 10px;"></div>
                        </div>
                        
                        <div style="display: flex; gap: 15px; margin-top: 20px;">
                            <button type="submit" style="flex: 1; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; font-weight: 600; font-size: 1.05rem; cursor: pointer; font-family: 'Poppins', sans-serif;">
                                💾 Save Employee
                            </button>
                            <button type="button" onclick="closeEmployeeModal()" style="padding: 15px 30px; background: #e2e8f0; color: #2d3748; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;">
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // File preview handlers
    document.getElementById('empPhoto').addEventListener('change', function(e) {
        previewFile(e.target.files[0], 'photoPreview');
    });
    
    document.getElementById('empCatalogue').addEventListener('change', function(e) {
        previewFile(e.target.files[0], 'cataloguePreview');
    });
    
    // Form submission
    document.getElementById('employeeForm').addEventListener('submit', handleEmployeeSubmit);
}

// Preview file
function previewFile(file, previewId) {
    if (!file) return;
    
    const previewDiv = document.getElementById(previewId);
    
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewDiv.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">`;
        };
        reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
        previewDiv.innerHTML = `<div style="padding: 15px; background: #f7fafc; border-radius: 10px; color: #667eea; font-weight: 600;">📄 ${file.name}</div>`;
    }
}

// Handle employee form submit
function handleEmployeeSubmit(e) {
    e.preventDefault();
    
    const employeeId = document.getElementById('employeeId').value || generateId();
    const photoFile = document.getElementById('empPhoto').files[0];
    const catalogueFile = document.getElementById('empCatalogue').files[0];
    
    const employeeData = {
        id: employeeId,
        name: document.getElementById('empName').value,
        designation: document.getElementById('empDesignation').value,
        phone: document.getElementById('empPhone').value,
        email: document.getElementById('empEmail').value,
        website: document.getElementById('empWebsite').value,
        address: document.getElementById('empAddress').value,
        whatsapp: document.getElementById('empWhatsapp').value,
        facebook: document.getElementById('empFacebook').value,
        linkedin: document.getElementById('empLinkedin').value,
        instagram: document.getElementById('empInstagram').value,
        createdAt: new Date().toISOString()
    };
    
    // Handle file uploads
    const promises = [];
    
    if (photoFile) {
        promises.push(
            new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    employeeData.photo = e.target.result;
                    resolve();
                };
                reader.readAsDataURL(photoFile);
            })
        );
    }
    
    if (catalogueFile) {
        promises.push(
            new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    employeeData.catalogue = e.target.result;
                    employeeData.catalogueName = catalogueFile.name;
                    employeeData.catalogueType = catalogueFile.type;
                    resolve();
                };
                reader.readAsDataURL(catalogueFile);
            })
        );
    }
    
    Promise.all(promises).then(() => {
        const employees = getEmployees();
        employees[employeeId] = employeeData;
        saveEmployees(employees);
        
        loadStats();
        loadEmployeeTable();
        closeEmployeeModal();
        
        alert('✅ Employee card created successfully!');
        
        // Show card link
        const cardURL = `${window.location.origin}/card.html?id=${employeeId}`;
        if (confirm(`Employee card created!\n\nCard URL: ${cardURL}\n\nWould you like to view the card now?`)) {
            window.open(cardURL, '_blank');
        }
    });
}

// Generate unique ID
function generateId() {
    return 'emp' + Date.now();
}

// Open create modal
function openCreateModal() {
    document.getElementById('employeeModalTitle').textContent = 'Create New Employee';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeId').value = '';
    document.getElementById('photoPreview').innerHTML = '';
    document.getElementById('cataloguePreview').innerHTML = '';
    document.getElementById('employeeModal').classList.add('active');
}

// Edit employee
function editEmployee(id) {
    const employees = getEmployees();
    const emp = employees[id];
    
    if (!emp) return;
    
    document.getElementById('employeeModalTitle').textContent = 'Edit Employee';
    document.getElementById('employeeId').value = emp.id;
    document.getElementById('empName').value = emp.name;
    document.getElementById('empDesignation').value = emp.designation;
    document.getElementById('empPhone').value = emp.phone;
    document.getElementById('empEmail').value = emp.email;
    document.getElementById('empWebsite').value = emp.website || '';
    document.getElementById('empAddress').value = emp.address || '';
    document.getElementById('empWhatsapp').value = emp.whatsapp || '';
    document.getElementById('empFacebook').value = emp.facebook || '';
    document.getElementById('empLinkedin').value = emp.linkedin || '';
    document.getElementById('empInstagram').value = emp.instagram || '';
    
    if (emp.photo) {
        document.getElementById('photoPreview').innerHTML = `<img src="${emp.photo}" style="max-width: 200px; max-height: 200px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">`;
    }
    
    if (emp.catalogue) {
        if (emp.catalogueType === 'application/pdf') {
            document.getElementById('cataloguePreview').innerHTML = `<div style="padding: 15px; background: #f7fafc; border-radius: 10px; color: #667eea; font-weight: 600;">📄 ${emp.catalogueName}</div>`;
        } else {
            document.getElementById('cataloguePreview').innerHTML = `<img src="${emp.catalogue}" style="max-width: 200px; max-height: 200px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">`;
        }
    }
    
    document.getElementById('employeeModal').classList.add('active');
}

// Close employee modal
function closeEmployeeModal() {
    document.getElementById('employeeModal').classList.remove('active');
}

// Create company settings modal
function createCompanySettingsModal() {
    const modal = document.createElement('div');
    modal.id = 'companyModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">⚙️ Company Settings</h2>
                <button class="modal-close" onclick="closeCompanyModal()">✕</button>
            </div>
            <div class="modal-body">
                <form id="companyForm" style="display: grid; gap: 20px;">
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px;">Company Name *</label>
                        <input type="text" id="companyName" required style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Poppins', sans-serif;">
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px;">Company Logo</label>
                        <input type="file" id="companyLogo" accept="image/*" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Poppins', sans-serif;">
                        <div id="companyLogoPreview" style="margin-top: 10px;"></div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">Website</label>
                            <input type="url" id="companyWebsite" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Poppins', sans-serif;">
                        </div>
                        
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">Email</label>
                            <input type="email" id="companyEmail" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Poppins', sans-serif;">
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px;">Phone</label>
                        <input type="tel" id="companyPhone" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Poppins', sans-serif;">
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px;">Address</label>
                        <textarea id="companyAddress" rows="3" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Poppins', sans-serif; resize: vertical;"></textarea>
                    </div>
                    
                    <div style="display: flex; gap: 15px; margin-top: 10px;">
                        <button type="submit" style="flex: 1; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; font-weight: 600; font-size: 1.05rem; cursor: pointer; font-family: 'Poppins', sans-serif;">
                            💾 Save Settings
                        </button>
                        <button type="button" onclick="closeCompanyModal()" style="padding: 15px 30px; background: #e2e8f0; color: #2d3748; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('companyLogo').addEventListener('change', function(e) {
        if (e.target.files[0]) {
            previewFile(e.target.files[0], 'companyLogoPreview');
        }
    });
    
    document.getElementById('companyForm').addEventListener('submit', handleCompanySubmit);
}

// Open company settings
function openCompanySettings() {
    const settings = getCompanySettings();
    
    document.getElementById('companyName').value = settings.companyName;
    document.getElementById('companyWebsite').value = settings.companyWebsite || '';
    document.getElementById('companyEmail').value = settings.companyEmail || '';
    document.getElementById('companyPhone').value = settings.companyPhone || '';
    document.getElementById('companyAddress').value = settings.companyAddress || '';
    
    if (settings.companyLogo) {
        document.getElementById('companyLogoPreview').innerHTML = `<img src="${settings.companyLogo}" style="max-width: 200px; max-height: 200px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">`;
    }
    
    document.getElementById('companyModal').classList.add('active');
}

// Handle company form submit
function handleCompanySubmit(e) {
    e.preventDefault();
    
    const logoFile = document.getElementById('companyLogo').files[0];
    const settings = getCompanySettings();
    
    settings.companyName = document.getElementById('companyName').value;
    settings.companyWebsite = document.getElementById('companyWebsite').value;
    settings.companyEmail = document.getElementById('companyEmail').value;
    settings.companyPhone = document.getElementById('companyPhone').value;
    settings.companyAddress = document.getElementById('companyAddress').value;
    
    if (logoFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            settings.companyLogo = e.target.result;
            saveCompanySettings(settings);
            closeCompanyModal();
            alert('✅ Company settings saved successfully!');
        };
        reader.readAsDataURL(logoFile);
    } else {
        saveCompanySettings(settings);
        closeCompanyModal();
        alert('✅ Company settings saved successfully!');
    }
}

// Close company modal
function closeCompanyModal() {
    document.getElementById('companyModal').classList.remove('active');
}

// Create QR modal
function createQRModal() {
    const modal = document.createElement('div');
    modal.id = 'qrModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2 class="modal-title">📱 QR Code</h2>
                <button class="modal-close" onclick="closeQRModal()">✕</button>
            </div>
            <div class="modal-body" style="text-align: center;">
                <div id="qrCodeContainer" style="display: inline-block; padding: 20px; background: white; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></div>
                <p id="qrEmployeeName" style="font-weight: 600; margin-top: 20px; color: #2d3748; font-size: 1.1rem;"></p>
                <p id="qrCardURL" style="color: #718096; margin-top: 5px; word-break: break-all; font-size: 0.9rem;"></p>
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button onclick="downloadQRCode()" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;">
                        💾 Download QR
                    </button>
                    <button onclick="copyCardURL()" style="flex: 1; padding: 12px; background: #48bb78; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;">
                        🔗 Copy Link
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Show QR modal
function showQRModal(id) {
    const employees = getEmployees();
    const emp = employees[id];
    
    if (!emp) return;
    
    const cardURL = `${window.location.origin}/card.html?id=${id}`;
    
    document.getElementById('qrEmployeeName').textContent = emp.name;
    document.getElementById('qrCardURL').textContent = cardURL;
    
    // Generate QR code
    const container = document.getElementById('qrCodeContainer');
    container.innerHTML = '';
    
    new QRCode(container, {
        text: cardURL,
        width: 256,
        height: 256,
        colorDark: "#667eea",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    document.getElementById('qrModal').classList.add('active');
}

// Download QR code
function downloadQRCode() {
    const canvas = document.querySelector('#qrCodeContainer canvas');
    if (canvas) {
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-code-${Date.now()}.png`;
        a.click();
        alert('✅ QR code downloaded!');
    }
}

// Copy card URL
function copyCardURL() {
    const url = document.getElementById('qrCardURL').textContent;
    navigator.clipboard.writeText(url).then(() => {
        alert('✅ Card URL copied to clipboard!');
    });
}

// Close QR modal
function closeQRModal() {
    document.getElementById('qrModal').classList.remove('active');
}

// Add QR Code library
const qrScript = document.createElement('script');
qrScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
document.head.appendChild(qrScript);
