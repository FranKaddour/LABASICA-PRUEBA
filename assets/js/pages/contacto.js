/* ==================== CONTACTO PAGE JAVASCRIPT ==================== */

/**
 * Contact page functionality
 */
class ContactoPage {
    constructor() {
        this.form = null;
        this.isSubmitting = false;
        
        this.init();
    }

    init() {
        this.initForm();
        this.initValidation();
        this.initContactLinks();
        this.initMap();
        this.initHours();
    }

    /**
     * Initialize contact form
     */
    initForm() {
        this.form = document.getElementById('contactForm');
        
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });

            // Auto-resize textarea
            const messageField = this.form.querySelector('#message');
            if (messageField) {
                messageField.addEventListener('input', () => {
                    this.autoResize(messageField);
                });
            }
        }
    }

    /**
     * Initialize form validation
     */
    initValidation() {
        if (!this.form) return;

        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Real-time validation on blur
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            // Clear validation on focus
            input.addEventListener('focus', () => {
                this.clearFieldError(input);
            });

            // Special handling for email
            if (input.type === 'email') {
                input.addEventListener('input', Utils.debounce(() => {
                    if (input.value) {
                        this.validateField(input);
                    }
                }, 500));
            }
        });

        // Phone number formatting
        const phoneInput = this.form.querySelector('#phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        }
    }

    /**
     * Validate individual form field
     */
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required field check
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Este campo es requerido';
        }
        // Email validation
        else if (field.type === 'email' && value) {
            if (!Utils.isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Por favor ingresa un email válido';
            }
        }
        // Phone validation
        else if (field.type === 'tel' && value) {
            if (!/^[\+]?[\d\s\-\(\)]{10,}$/.test(value)) {
                isValid = false;
                errorMessage = 'Por favor ingresa un teléfono válido';
            }
        }
        // Select validation
        else if (field.tagName === 'SELECT' && field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Por favor selecciona una opción';
        }
        // Textarea minimum length
        else if (field.tagName === 'TEXTAREA' && field.hasAttribute('required')) {
            if (value.length < 10) {
                isValid = false;
                errorMessage = 'El mensaje debe tener al menos 10 caracteres';
            }
        }

        // Update field state
        field.classList.toggle('invalid', !isValid);
        field.classList.toggle('valid', isValid && value);

        // Show/hide error message
        this.showFieldError(field, isValid ? null : errorMessage);

        return isValid;
    }

    /**
     * Show field error message
     */
    showFieldError(field, message) {
        const errorElement = field.parentNode.querySelector('.form-error');
        
        if (message) {
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.add('show');
            }
        } else {
            if (errorElement) {
                errorElement.classList.remove('show');
            }
        }
    }

    /**
     * Clear field error
     */
    clearFieldError(field) {
        field.classList.remove('invalid');
        const errorElement = field.parentNode.querySelector('.form-error');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    /**
     * Format phone number input
     */
    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.startsWith('54')) {
            value = '+' + value;
        } else if (value.length === 10) {
            value = '+54 ' + value;
        }
        
        // Format as +54 11 1234-5678
        if (value.startsWith('+54')) {
            const digits = value.slice(3);
            if (digits.length >= 2) {
                value = '+54 ' + digits.slice(0, 2);
                if (digits.length > 2) {
                    value += ' ' + digits.slice(2, 6);
                    if (digits.length > 6) {
                        value += '-' + digits.slice(6, 10);
                    }
                }
            }
        }
        
        input.value = value;
    }

    /**
     * Auto-resize textarea
     */
    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    /**
     * Handle form submission
     */
    async handleFormSubmit() {
        if (this.isSubmitting) return;

        // Validate all fields
        const inputs = this.form.querySelectorAll('input, select, textarea');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showMessage('Por favor corrige los errores en el formulario', 'error');
            
            // Focus first invalid field
            const firstInvalid = this.form.querySelector('.invalid');
            if (firstInvalid) {
                firstInvalid.focus();
            }
            
            return;
        }

        // Prepare form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        try {
            this.isSubmitting = true;
            this.setFormLoading(true);

            // Simulate API call
            await this.submitForm(data);
            
            this.showMessage('¡Mensaje enviado correctamente! Te responderemos pronto.', 'success');
            this.form.reset();
            
            // Clear validation states
            inputs.forEach(input => {
                input.classList.remove('valid', 'invalid');
                this.clearFieldError(input);
            });

        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage('Hubo un error al enviar el mensaje. Intenta nuevamente.', 'error');
        } finally {
            this.isSubmitting = false;
            this.setFormLoading(false);
        }
    }

    /**
     * Submit form data (simulate API call)
     */
    async submitForm(data) {
        // TODO: Implementar envío real del formulario
        // Por ahora solo validamos y confirmamos recepción
        try {
            // Aquí iría la llamada real al API/email service
            // Contact data processed
            return { success: true };
        } catch (error) {
            throw new Error('Error al enviar el mensaje');
        }
    }

    /**
     * Set form loading state
     */
    setFormLoading(isLoading) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            Utils.setLoadingState(submitBtn, isLoading);
        }

        // Disable form inputs during submission
        const inputs = this.form.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => {
            input.disabled = isLoading;
        });
    }

    /**
     * Show form message
     */
    showMessage(message, type) {
        const successElement = document.getElementById('successMessage');
        const errorElement = document.getElementById('errorMessage');
        
        // Hide both messages first
        if (successElement) successElement.classList.add('d-none');
        if (errorElement) errorElement.classList.add('d-none');
        
        // Show appropriate message
        if (type === 'success' && successElement) {
            successElement.querySelector('span').textContent = message;
            successElement.classList.remove('d-none');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                successElement.classList.add('d-none');
            }, 5000);
        } else if (type === 'error' && errorElement) {
            errorElement.querySelector('span').textContent = message;
            errorElement.classList.remove('d-none');
            
            // Auto-hide after 7 seconds
            setTimeout(() => {
                errorElement.classList.add('d-none');
            }, 7000);
        }
        
        // Also show as notification
        Utils.showNotification(message, type);
    }

    /**
     * Initialize contact links
     */
    initContactLinks() {
        // Phone links
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        phoneLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Add click analytics or other tracking here
                // Phone link clicked
            });
        });

        // Email links
        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
        emailLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Add click analytics or other tracking here
                // Email link clicked
            });
        });

        // WhatsApp links
        const whatsappLinks = document.querySelectorAll('a[href^="https://wa.me/"]');
        whatsappLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Add click analytics or other tracking here
                // WhatsApp link clicked
            });
        });

        // Maps links
        const mapLinks = document.querySelectorAll('a[href*="maps"]');
        mapLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Add click analytics or other tracking here
                // Map link clicked
            });
        });
    }

    /**
     * Initialize map functionality
     */
    initMap() {
        const mapContainer = document.querySelector('.map-container');
        
        if (mapContainer) {
            // Add click handler for map placeholder
            mapContainer.addEventListener('click', () => {
                const mapUrl = 'https://www.google.com/maps/search/?api=1&query=Morón+Buenos+Aires+Argentina';
                window.open(mapUrl, '_blank', 'noopener');
            });

            // Add keyboard support
            mapContainer.setAttribute('tabindex', '0');
            mapContainer.setAttribute('role', 'button');
            mapContainer.setAttribute('aria-label', 'Ver ubicación en Google Maps');
            
            mapContainer.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    mapContainer.click();
                }
            });
        }
    }

    /**
     * Initialize hours section with current day highlight
     */
    initHours() {
        const currentDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysMapping = [6, 0, 1, 2, 3, 4, 5]; // Map JS day to our hours list
        const ourDayIndex = daysMapping[currentDay];
        
        const hoursItems = document.querySelectorAll('.hours-item');
        hoursItems.forEach((item, index) => {
            if (index === ourDayIndex) {
                item.classList.add('today');
            } else {
                item.classList.remove('today');
            }
        });

        // Add business hours status
        this.updateBusinessHoursStatus();
        
        // Update every minute
        setInterval(() => {
            this.updateBusinessHoursStatus();
        }, 60000);
    }

    /**
     * Update business hours status
     */
    updateBusinessHoursStatus() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay();
        
        // Business hours: Mon-Thu 7-20, Fri-Sat 7-21, Sun 8-20
        let isOpen = false;
        
        if (currentDay >= 1 && currentDay <= 4) { // Mon-Thu
            isOpen = currentHour >= 7 && currentHour < 20;
        } else if (currentDay >= 5 && currentDay <= 6) { // Fri-Sat
            isOpen = currentHour >= 7 && currentHour < 21;
        } else { // Sunday
            isOpen = currentHour >= 8 && currentHour < 20;
        }

        // Add status indicator
        let statusElement = document.querySelector('.business-status');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.className = 'business-status';
            
            const hoursHeader = document.querySelector('.hours-header');
            if (hoursHeader) {
                hoursHeader.appendChild(statusElement);
            }
        }

        statusElement.innerHTML = `
            <span class="status-indicator ${isOpen ? 'open' : 'closed'}">
                <i class="fas fa-circle"></i>
                ${isOpen ? 'Abierto ahora' : 'Cerrado ahora'}
            </span>
        `;
    }
}

/**
 * Initialize page when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    const contactoPage = new ContactoPage();

    // Make available globally for debugging
    if (AppConfig.debug) {
        window.ContactoPage = contactoPage;
    }
});

// Listen for component ready events
document.addEventListener('allComponentsReady', () => {
    Navigation.setActiveNav();
});