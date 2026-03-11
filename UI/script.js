// House Price Prediction Website - JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initPredictionForm();
    initContactForm();
    initFeedback();
    initDemoMode();
    initScrollEffects();
});

// ==================== NAVIGATION ====================
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    // Scroll effect for navbar
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
}

// ==================== SCROLL EFFECTS ====================
function initScrollEffects() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ==================== PREDICTION FORM ====================
function initPredictionForm() {
    const form = document.getElementById('predictionForm');
    if (!form) return;

    const submitBtn = document.getElementById('submitBtn');
    const loadDemoBtn = document.getElementById('loadDemoBtn');
    const resetBtn = document.getElementById('resetBtn');
    const tryAnotherBtn = document.getElementById('tryAnotherBtn');
    const retryBtn = document.getElementById('retryBtn');
    const shareBtn = document.getElementById('shareBtn');

    // API endpoint
    const API_URL = 'http://127.0.0.1:5000/predict';

    // Location options for one-hot encoding
    const locations = [
        'Coimbatore', 'Erode', 'Madurai', 'Salem',
        'Thanjavur', 'Thoothukudi', 'Tirunelveli', 'Trichy', 'Vellore'
    ];

    // Area types for one-hot encoding
    const areaTypes = ['Plot area', 'Super built-up'];

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            showToast('Please fill in all required fields correctly', 'error');
            return;
        }

        // Hide previous results
        hideAllResults();
        showLoading();

        try {
            const formData = collectFormData();
            const payload = createPayload(formData);

            // Simulate progress
            simulateProgress();

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server error: ${response.status}`);
            }

            const data = await response.json();
            
            // Short delay to show completion
            setTimeout(() => {
                hideLoading();
                displayResult(data);
                showToast('✅ Success! Your predicted price is ready', 'success');
            }, 500);

        } catch (error) {
            hideLoading();
            displayError(error.message);
            showToast(getErrorMessage(error.message), 'error');
        }
    });

    // Load demo data
    if (loadDemoBtn) {
        loadDemoBtn.addEventListener('click', loadSampleData);
    }

    // Reset form
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            form.reset();
            hideAllResults();
            showInstructions();
            clearValidationErrors();
        });
    }

    // Try another prediction
    if (tryAnotherBtn) {
        tryAnotherBtn.addEventListener('click', function() {
            form.reset();
            hideAllResults();
            showInstructions();
            clearValidationErrors();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Retry on error
    if (retryBtn) {
        retryBtn.addEventListener('click', function() {
            hideAllResults();
            showInstructions();
        });
    }

    // Share result
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            const price = document.getElementById('predictedPrice').textContent;
            const text = `I just predicted a house price of ${price} using the House Price Predictor! Try it yourself.`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'House Price Prediction',
                    text: text,
                    url: window.location.href
                });
            } else {
                navigator.clipboard.writeText(text).then(() => {
                    showToast('Result copied to clipboard!', 'success');
                });
            }
        });
    }

    // Real-time validation
    form.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            this.classList.remove('error');
            const errorEl = document.getElementById(this.id + 'Error');
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.remove('show');
            }
        });
    });

    // Helper functions
    function collectFormData() {
        return {
            totalSqft: parseFloat(document.getElementById('totalSqft').value),
            bedrooms: parseInt(document.getElementById('bedrooms').value),
            bathrooms: parseInt(document.getElementById('bathrooms').value),
            balcony: parseInt(document.getElementById('balcony').value),
            ageOfProperty: parseInt(document.getElementById('ageOfProperty').value),
            distanceToLandmark: parseFloat(document.getElementById('distanceToLandmark').value),
            floors: parseInt(document.getElementById('floors').value),
            location: document.getElementById('location').value,
            areaType: document.getElementById('areaType').value,
            availability: document.getElementById('availability').value
        };
    }

    function createPayload(formData) {
        const payload = {
            Total_sqft: formData.totalSqft,
            Bedrooms: formData.bedrooms,
            Bathrooms: formData.bathrooms,
            Balcony: formData.balcony,
            Age_of_property: formData.ageOfProperty,
            Distance_to_landmark: formData.distanceToLandmark,
            Floors: formData.floors
        };

        // One-hot encode locations
        locations.forEach(location => {
            payload[`Location_${location}`] = formData.location === location ? 1 : 0;
        });

        // One-hot encode area types
        areaTypes.forEach(areaType => {
            payload[`Area_type_${areaType}`] = formData.areaType === areaType ? 1 : 0;
        });

        // One-hot encode availability
        payload['Availability_Under construction'] = formData.availability === 'Under Construction' ? 1 : 0;

        return payload;
    }

    function validateForm() {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    function validateField(field) {
        const value = field.value.trim();
        const errorEl = document.getElementById(field.id + 'Error');
        let errorMessage = '';

        if (!value) {
            errorMessage = 'This field is required';
        } else if (field.type === 'number') {
            const numValue = parseFloat(value);
            const min = parseFloat(field.min);
            const max = parseFloat(field.max);

            if (isNaN(numValue)) {
                errorMessage = 'Please enter a valid number';
            } else if (min !== undefined && numValue < min) {
                errorMessage = `Value must be at least ${min}`;
            } else if (max !== undefined && numValue > max) {
                errorMessage = `Value must not exceed ${max}`;
            }
        }

        if (errorMessage) {
            field.classList.add('error');
            if (errorEl) {
                errorEl.textContent = '⚠️ ' + errorMessage;
                errorEl.classList.add('show');
            }
            return false;
        } else {
            field.classList.remove('error');
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.remove('show');
            }
            return true;
        }
    }

    function clearValidationErrors() {
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        form.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.classList.remove('show');
        });
    }

    function loadSampleData() {
        document.getElementById('totalSqft').value = '1500';
        document.getElementById('bedrooms').value = '3';
        document.getElementById('bathrooms').value = '2';
        document.getElementById('balcony').value = '2';
        document.getElementById('floors').value = '2';
        document.getElementById('ageOfProperty').value = '5';
        document.getElementById('distanceToLandmark').value = '3';
        document.getElementById('location').value = 'Coimbatore';
        document.getElementById('areaType').value = 'Super built-up';
        document.getElementById('availability').value = 'Ready to Move';

        showToast('Sample data loaded! Click "Predict Price" to see results.', 'success');
    }

    function showLoading() {
        const loadingSection = document.getElementById('loadingSection');
        const instructionsSection = document.getElementById('instructionsSection');
        
        if (instructionsSection) instructionsSection.classList.add('hidden');
        if (loadingSection) loadingSection.classList.remove('hidden');

        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        }
    }

    function hideLoading() {
        const loadingSection = document.getElementById('loadingSection');
        if (loadingSection) loadingSection.classList.add('hidden');

        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    function simulateProgress() {
        const progressBar = document.getElementById('progressBar');
        const loadingText = document.getElementById('loadingText');
        
        if (!progressBar || !loadingText) return;

        const messages = [
            { progress: 0, text: 'Analyzing property features...' },
            { progress: 33, text: 'Calculating price...' },
            { progress: 66, text: 'Almost done...' },
            { progress: 100, text: 'Complete!' }
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index < messages.length) {
                progressBar.style.width = messages[index].progress + '%';
                loadingText.textContent = messages[index].text;
                index++;
            } else {
                clearInterval(interval);
            }
        }, 600);
    }

    function displayResult(data) {
        const resultSection = document.getElementById('resultSection');
        const predictedPrice = document.getElementById('predictedPrice');

        if (!resultSection || !predictedPrice) return;

        let price = data.predicted_price || data.prediction || data.price || data;
        if (Array.isArray(price)) price = price[0];

        predictedPrice.textContent = formatIndianRupees(price);
        resultSection.classList.remove('hidden');

        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function displayError(message) {
        const errorSection = document.getElementById('errorSection');
        const errorMessage = document.getElementById('errorMessage');

        if (!errorSection || !errorMessage) return;

        errorMessage.textContent = getErrorMessage(message);
        errorSection.classList.remove('hidden');
    }

    function hideAllResults() {
        const sections = ['loadingSection', 'resultSection', 'errorSection', 'instructionsSection'];
        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
    }

    function showInstructions() {
        const instructionsSection = document.getElementById('instructionsSection');
        if (instructionsSection) instructionsSection.classList.remove('hidden');
    }

    function getErrorMessage(message) {
        if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
            return '❌ Unable to connect to prediction service. Please check your connection.';
        } else if (message.includes('500')) {
            return '❌ Oops! Something went wrong. Please try again.';
        } else if (message.includes('404')) {
            return '❌ Prediction endpoint not found. Please verify the API configuration.';
        } else if (message.includes('timeout')) {
            return '⏱️ Request timed out. Please try again.';
        }
        return '❌ ' + message;
    }
}

// ==================== FORMAT CURRENCY ====================
function formatIndianRupees(amount) {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    const roundedAmount = Math.round(num);

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(roundedAmount);
}

// ==================== DEMO MODE ====================
function initDemoMode() {
    // Check if demo mode is requested via URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') {
        // Wait for form to load
        setTimeout(() => {
            const loadDemoBtn = document.getElementById('loadDemoBtn');
            if (loadDemoBtn) {
                loadDemoBtn.click();
            }
        }, 500);
    }
}

// ==================== CONTACT FORM ====================
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const successDiv = document.getElementById('contactSuccess');
    const sendAnotherBtn = document.getElementById('sendAnotherBtn');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Simulate form submission
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        setTimeout(() => {
            form.classList.add('hidden');
            if (successDiv) successDiv.classList.remove('hidden');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            showToast('✅ Thank you! Your message has been received.', 'success');
        }, 1500);
    });

    if (sendAnotherBtn) {
        sendAnotherBtn.addEventListener('click', function() {
            form.reset();
            form.classList.remove('hidden');
            if (successDiv) successDiv.classList.add('hidden');
        });
    }
}

// ==================== FEEDBACK ====================
function initFeedback() {
    const feedbackBtns = document.querySelectorAll('.feedback-btn');
    const feedbackComment = document.getElementById('feedbackComment');
    const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
    const feedbackThanks = document.getElementById('feedbackThanks');

    if (!feedbackBtns.length) return;

    feedbackBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove selected from all buttons
            feedbackBtns.forEach(b => b.classList.remove('selected'));
            // Add selected to clicked button
            this.classList.add('selected');
            // Show comment box
            if (feedbackComment) feedbackComment.classList.remove('hidden');
        });
    });

    if (submitFeedbackBtn) {
        submitFeedbackBtn.addEventListener('click', function() {
            if (feedbackComment) feedbackComment.classList.add('hidden');
            if (feedbackThanks) feedbackThanks.classList.remove('hidden');
            
            // Hide feedback buttons
            const feedbackButtons = document.querySelector('.feedback-buttons');
            if (feedbackButtons) feedbackButtons.classList.add('hidden');

            showToast('Thank you for your feedback! 🎉', 'success');
        });
    }
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.success}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// ==================== UTILITY FUNCTIONS ====================
// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Animate numbers on scroll
function animateNumbers() {
    const numbers = document.querySelectorAll('[data-count]');
    
    numbers.forEach(number => {
        if (isInViewport(number) && !number.classList.contains('animated')) {
            number.classList.add('animated');
            const target = parseInt(number.dataset.count);
            const duration = 2000;
            const start = 0;
            const startTime = performance.now();

            function updateNumber(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const current = Math.floor(progress * (target - start) + start);
                
                number.textContent = current.toLocaleString() + (target >= 1000 ? '+' : '');
                
                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                }
            }

            requestAnimationFrame(updateNumber);
        }
    });
}

// Initialize number animation on scroll
window.addEventListener('scroll', debounce(animateNumbers, 100));
window.addEventListener('load', animateNumbers);
// ── Contact Form ─────────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
const contactSuccess = document.getElementById('contactSuccess');
const sendAnotherBtn = document.getElementById('sendAnotherBtn');

if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const btnText   = submitBtn.querySelector('.btn-text');

        submitBtn.disabled = true;
        btnText.textContent = 'Sending...';

        const formData = {
            name   : document.getElementById('contactName').value.trim(),
            email  : document.getElementById('contactEmail').value.trim(),
            subject: document.getElementById('contactSubject').value,
            message: document.getElementById('contactMessage').value.trim()
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/contact', {
                method : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body   : JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                contactForm.classList.add('hidden');
                contactSuccess.classList.remove('hidden');
            } else {
                alert('Something went wrong: ' + result.error);
                submitBtn.disabled = false;
                btnText.textContent = 'Send Message';
            }
        } catch (error) {
            alert('Failed to send message. Please try again.');
            submitBtn.disabled = false;
            btnText.textContent = 'Send Message';
        }
    });
}

if (sendAnotherBtn) {
    sendAnotherBtn.addEventListener('click', function () {
        contactForm.reset();
        contactForm.classList.remove('hidden');
        contactSuccess.classList.add('hidden');
    });
}

// ── Quick Feedback Buttons ────────────────────────────────────
const feedbackBtns      = document.querySelectorAll('.feedback-btn');
const feedbackComment   = document.getElementById('feedbackComment');
const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
const feedbackThanks    = document.getElementById('feedbackThanks');

let selectedFeedback = null;

feedbackBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        feedbackBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedFeedback = this.dataset.feedback;
        feedbackComment.classList.remove('hidden');
    });
});

if (submitFeedbackBtn) {
    submitFeedbackBtn.addEventListener('click', async function () {
        const feedbackText = document.getElementById('feedbackText').value.trim();

        submitFeedbackBtn.disabled = true;
        submitFeedbackBtn.textContent = 'Submitting...';

        try {
            const response = await fetch('http://127.0.0.1:5000/feedback', {
                method : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body   : JSON.stringify({
                    feedback: selectedFeedback,
                    text    : feedbackText || 'No additional comment.'
                })
            });

            const result = await response.json();

            if (result.success) {
                feedbackComment.classList.add('hidden');
                feedbackThanks.classList.remove('hidden');
            } else {
                alert('Could not submit feedback: ' + result.error);
                submitFeedbackBtn.disabled = false;
                submitFeedbackBtn.textContent = 'Submit Feedback';
            }
        } catch (error) {
            alert('Failed to submit feedback. Please try again.');
            submitFeedbackBtn.disabled = false;
            submitFeedbackBtn.textContent = 'Submit Feedback';
        }
    });
}