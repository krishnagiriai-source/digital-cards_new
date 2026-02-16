// Dynamic Card JavaScript
// Loads employee data based on URL parameter

// Get employee ID from URL
function getEmployeeIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Get employee data
function getEmployeeData(id) {
    const stored = localStorage.getItem('digitalCardEmployees');
    const employees = stored ? JSON.parse(stored) : {};
    return employees[id];
}

// Get company settings
function getCompanySettings() {
    const stored = localStorage.getItem('companySettings');
    return stored ? JSON.parse(stored) : {
        companyName: 'MRK Foods Private Limited',
        companyLogo: null
    };
}

// Initialize card
document.addEventListener('DOMContentLoaded', function() {
    const employeeId = getEmployeeIdFromURL();
    
    if (!employeeId) {
        showError('No employee ID provided in URL');
        return;
    }
    
    const employee = getEmployeeData(employeeId);
    
    if (!employee) {
        showError('Employee not found');
        return;
    }
    
    renderCard(employee);
});

// Render the card
function renderCard(employee) {
    const company = getCompanySettings();
    const container = document.getElementById('cardContainer');
    
    // Update page title
    document.title = `${employee.name} - Digital Card`;
    
    // Logo section
    let logoHTML = '';
    if (company.companyLogo) {
        logoHTML = `<img src="${company.companyLogo}" alt="${company.companyName}" class="company-logo">`;
    } else {
        logoHTML = `<div class="company-name">${company.companyName}</div>`;
    }
    
    // Photo section
    let photoHTML = '';
    if (employee.photo) {
        photoHTML = `<img src="${employee.photo}" alt="${employee.name}" class="employee-photo">`;
    } else {
        photoHTML = `<div class="employee-photo-placeholder">👤</div>`;
    }
    
    // Build card HTML
    container.innerHTML = `
        <!-- Logo Section -->
        <div class="logo-section">
            ${logoHTML}
        </div>

        <!-- Photo Section -->
        <div class="photo-section">
            ${photoHTML}
        </div>

        <!-- Info Section -->
        <div class="info-section">
            <h1 class="employee-name">${employee.name}</h1>
            <p class="employee-designation">${employee.designation}</p>

            <!-- Contact Info -->
            <div class="contact-info">
                ${employee.phone ? `
                <div class="contact-item">
                    <span class="contact-icon">📞</span>
                    <span class="contact-text">${employee.phone}</span>
                </div>` : ''}
                
                ${employee.email ? `
                <div class="contact-item">
                    <span class="contact-icon">📧</span>
                    <span class="contact-text">${employee.email}</span>
                </div>` : ''}
                
                ${employee.website ? `
                <div class="contact-item">
                    <span class="contact-icon">🌐</span>
                    <span class="contact-text">${employee.website}</span>
                </div>` : ''}
                
                ${employee.address ? `
                <div class="contact-item">
                    <span class="contact-icon">📍</span>
                    <span class="contact-text">${employee.address}</span>
                </div>` : ''}
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
                ${employee.whatsapp ? `
                <a href="https://wa.me/${employee.whatsapp}" class="btn btn-whatsapp" target="_blank">
                    📱 WhatsApp
                </a>` : ''}
                
                ${employee.phone ? `
                <a href="tel:${employee.phone}" class="btn btn-call">
                    📞 Call
                </a>` : ''}
                
                ${employee.email ? `
                <a href="mailto:${employee.email}" class="btn btn-email">
                    📧 Email
                </a>` : ''}
                
                <button class="btn btn-save" onclick="downloadVCard()">
                    💾 Save Contact
                </button>
                
                <button class="btn btn-share" onclick="openShareModal()">
                    📤 Share
                </button>
                
                ${employee.catalogue ? `
                <button class="btn btn-catalogue" onclick="viewCatalogue()">
                    📄 View Catalogue
                </button>` : ''}
            </div>

            <!-- QR Code Section -->
            <div class="qr-section">
                <h3 class="qr-title">📱 Scan to Save Contact</h3>
                <div id="qrcode"></div>
            </div>

            <!-- Social Media -->
            ${(employee.facebook || employee.linkedin || employee.instagram) ? `
            <div class="social-section">
                ${employee.facebook ? `
                <a href="${employee.facebook}" target="_blank" class="social-icon social-facebook">
                    f
                </a>` : ''}
                
                ${employee.linkedin ? `
                <a href="${employee.linkedin}" target="_blank" class="social-icon social-linkedin">
                    in
                </a>` : ''}
                
                ${employee.instagram ? `
                <a href="${employee.instagram}" target="_blank" class="social-icon social-instagram">
                    📷
                </a>` : ''}
            </div>` : ''}
        </div>

        <!-- Footer -->
        <div class="card-footer">
            <p><strong>${company.companyName}</strong></p>
            <p style="margin-top: 5px; opacity: 0.7;">Digital Visiting Card</p>
        </div>
    `;

    // Generate QR Code
    generateQRCode();
    
    // Store employee data globally for functions
    window.currentEmployee = employee;
    window.currentCompany = company;
    
    // Track view (optional analytics)
    trackCardView(employee.id);
}

// Generate QR Code
function generateQRCode() {
    const qrContainer = document.getElementById('qrcode');
    if (qrContainer) {
        const currentURL = window.location.href;
        new QRCode(qrContainer, {
            text: currentURL,
            width: 200,
            height: 200,
            colorDark: "#667eea",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// Download VCard
function downloadVCard() {
    const emp = window.currentEmployee;
    if (!emp) return;
    
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${emp.name}
N:${emp.name.split(' ').reverse().join(';')};;;
TITLE:${emp.designation}
TEL;TYPE=CELL:${emp.phone}
EMAIL:${emp.email}
URL:${emp.website || ''}
ADR:;;${emp.address || ''};;;;
ORG:${window.currentCompany.companyName}
NOTE:Digital Visiting Card
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${emp.name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// View Catalogue
function viewCatalogue() {
    const emp = window.currentEmployee;
    if (!emp || !emp.catalogue) return;
    
    const newWindow = window.open();
    
    if (emp.catalogueType === 'application/pdf') {
        newWindow.document.write(`
            <html>
            <head>
                <title>Catalogue - ${emp.name}</title>
                <style>
                    body { margin: 0; padding: 0; }
                    iframe { width: 100vw; height: 100vh; border: none; }
                </style>
            </head>
            <body>
                <iframe src="${emp.catalogue}"></iframe>
            </body>
            </html>
        `);
    } else {
        newWindow.document.write(`
            <html>
            <head>
                <title>Catalogue - ${emp.name}</title>
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        background: #f7fafc;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                    }
                    img {
                        max-width: 100%;
                        height: auto;
                        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
                        border-radius: 15px;
                    }
                </style>
            </head>
            <body>
                <img src="${emp.catalogue}" alt="Catalogue">
            </body>
            </html>
        `);
    }
}

// Share Modal Functions
function openShareModal() {
    document.getElementById('shareModal').classList.add('active');
}

function closeShareModal() {
    document.getElementById('shareModal').classList.remove('active');
}

function shareWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out ${window.currentEmployee.name}'s digital card!`);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    closeShareModal();
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('✅ Card link copied to clipboard!');
        closeShareModal();
    }).catch(() => {
        // Fallback
        const input = document.createElement('input');
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('✅ Card link copied to clipboard!');
        closeShareModal();
    });
}

function shareNative() {
    if (navigator.share) {
        navigator.share({
            title: `${window.currentEmployee.name} - Digital Card`,
            text: `Check out my digital visiting card!`,
            url: window.location.href
        }).then(() => {
            closeShareModal();
        }).catch((error) => {
            console.log('Error sharing:', error);
        });
    } else {
        alert('Native sharing not supported. Please use WhatsApp or Copy Link.');
    }
}

// Close modal on outside click
document.getElementById('shareModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeShareModal();
    }
});

// Show error state
function showError(message) {
    const container = document.getElementById('cardContainer');
    container.innerHTML = `
        <div class="error-state">
            <div class="error-icon">❌</div>
            <h2 style="color: #2d3748; margin-bottom: 10px;">Error</h2>
            <p style="color: #718096;">${message}</p>
            <button onclick="window.location.href='/dashboard.html'" style="margin-top: 25px; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;">
                🏠 Go to Dashboard
            </button>
        </div>
    `;
}

// Track card view (optional analytics)
function trackCardView(employeeId) {
    const viewsKey = 'cardViews_' + employeeId;
    const currentViews = parseInt(localStorage.getItem(viewsKey) || '0');
    localStorage.setItem(viewsKey, (currentViews + 1).toString());
}
