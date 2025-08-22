/* ==================== NEWSLETTER COMPONENT JAVASCRIPT ==================== */

/**
 * Newsletter component functionality
 */
class NewsletterComponent {
    constructor() {
        this.form = null;
        this.emailInput = null;
        this.submitButton = null;
        this.errorMessage = null;
        this.successMessage = null;
        
        this.init();
    }

    /**
     * Initialize newsletter component
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Setup newsletter functionality
     */
    setup() {
        this.form = document.getElementById('newsletterForm');
        
        if (!this.form) {
            // Newsletter might not exist on all pages
            return;
        }

        this.findElements();
        this.bindEvents();
        this.initValidation();
    }

    /**
     * Find newsletter elements
     */
    findElements() {
        this.emailInput = this.form.querySelector('#newsletterEmail');
        this.submitButton = this.form.querySelector('.newsletter-btn');
        this.errorMessage = this.form.querySelector('#emailError');
        this.successMessage = this.form.querySelector('#successMessage');
        
        if (!this.emailInput || !this.submitButton) {
            // Newsletter elements not found
            return false;
        }
        
        return true;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time email validation
        this.emailInput.addEventListener('input', () => {
            this.validateEmail(false);
        });

        this.emailInput.addEventListener('blur', () => {
            this.validateEmail(true);
        });

        // Enter key handling
        this.emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSubmit();
            }
        });
    }

    /**
     * Initialize form validation
     */
    initValidation() {
        // Set up HTML5 validation attributes
        this.emailInput.setAttribute('required', '');
        this.emailInput.setAttribute('type', 'email');
        this.emailInput.setAttribute('pattern', '[^@\\s]+@[^@\\s]+\\.[^@\\s]+');
        
        // Custom validation messages
        this.emailInput.addEventListener('invalid', (e) => {
            e.preventDefault();
            this.showValidationError('Por favor ingresa un email válido');
        });
    }

    /**
     * Validate email input
     */
    validateEmail(showErrors = true) {
        const email = this.emailInput.value.trim();
        const isValid = Utils.isValidEmail(email);
        
        // Clear previous states
        this.clearMessages();
        this.emailInput.classList.remove('invalid', 'valid');
        
        if (!email) {
            return true; // Empty is okay when not showing errors
        }
        
        if (isValid) {
            this.emailInput.classList.add('valid');
            return true;
        } else if (showErrors) {
            this.emailInput.classList.add('invalid');
            this.showValidationError('Por favor ingresa un email válido');
            return false;
        }
        
        return false;
    }

    /**
     * Handle form submission
     */
    async handleSubmit() {
        // Validate email
        if (!this.validateEmail(true)) {
            this.emailInput.focus();
            return;
        }

        const email = this.emailInput.value.trim();
        
        // Check if already subscribed (local storage)
        if (this.isAlreadySubscribed(email)) {
            this.showError('Este email ya está suscrito a nuestro newsletter');
            return;
        }

        // Start loading state
        Utils.setLoadingState(this.submitButton, true);
        this.clearMessages();

        try {
            // Simulate API call (replace with actual endpoint)
            const success = await this.subscribeToNewsletter(email);
            
            if (success) {
                this.handleSubscriptionSuccess(email);
            } else {
                this.handleSubscriptionError('Error al procesar la suscripción. Intenta nuevamente.');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            this.handleSubscriptionError('Error de conexión. Verifica tu conexión a internet.');
        } finally {
            Utils.setLoadingState(this.submitButton, false);
        }
    }

    /**
     * Subscribe to newsletter (API call simulation)
     */
    async subscribeToNewsletter(email) {
        // TODO: Implementar llamada real a API
        // Por ahora almacenamos localmente hasta tener endpoint
        try {
            this.storeSubscription(email);
            return true;
        } catch (error) {
            throw new Error('Error al procesar suscripción');
        }
        
        /* 
        Real implementation would be something like:
        
        const response = await fetch(AppConfig.api.newsletter, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });
        
        return response.ok;
        */
    }

    /**
     * Handle successful subscription
     */
    handleSubscriptionSuccess(email) {
        this.showSuccess('¡Gracias por suscribirte! Recibirás noticias increíbles.');
        this.form.reset();
        this.emailInput.classList.remove('valid');
        
        // Track subscription
        this.trackSubscription(email, 'success');
        
        // Show celebration effect
        this.showCelebrationEffect();
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
            this.clearMessages();
        }, 5000);
    }

    /**
     * Handle subscription error
     */
    handleSubscriptionError(message) {
        this.showError(message);
        this.trackSubscription(this.emailInput.value.trim(), 'error');
    }

    /**
     * Show validation error
     */
    showValidationError(message) {
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorMessage.classList.remove('d-none');
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        if (this.successMessage) {
            this.successMessage.textContent = message;
            this.successMessage.classList.remove('d-none');
            this.successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorMessage.classList.remove('d-none');
            this.errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Clear all messages
     */
    clearMessages() {
        if (this.errorMessage) {
            this.errorMessage.classList.add('d-none');
        }
        if (this.successMessage) {
            this.successMessage.classList.add('d-none');
        }
    }

    /**
     * Check if email is already subscribed
     */
    isAlreadySubscribed(email) {
        const subscribers = Utils.storage.get('newsletter_subscribers', []);
        return subscribers.includes(email.toLowerCase());
    }

    /**
     * Store subscription locally
     */
    storeSubscription(email) {
        const subscribers = Utils.storage.get('newsletter_subscribers', []);
        const emailLower = email.toLowerCase();
        
        if (!subscribers.includes(emailLower)) {
            subscribers.push(emailLower);
            Utils.storage.set('newsletter_subscribers', subscribers);
            Utils.storage.set('newsletter_subscription_date', Date.now());
        }
    }

    /**
     * Track subscription event
     */
    trackSubscription(email, status) {
        if (AppConfig.debug) {
            // Newsletter subscription logged
        }

        // Dispatch event for analytics
        document.dispatchEvent(new CustomEvent('newsletterSubscription', {
            detail: {
                email: email,
                status: status,
                timestamp: Date.now(),
                page: Navigation.getCurrentPage()
            }
        }));
    }

    /**
     * Show celebration effect
     */
    showCelebrationEffect() {
        // Create confetti effect
        const newsletter = this.form.closest('.newsletter-section');
        if (!newsletter) return;

        const confetti = document.createElement('div');
        confetti.className = 'newsletter-confetti';
        confetti.innerHTML = '🎉✨🎊';
        
        confetti.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2rem;
            pointer-events: none;
            animation: confetti 2s ease-out forwards;
            z-index: 10;
        `;

        newsletter.style.position = 'relative';
        newsletter.appendChild(confetti);

        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 2000);
    }

    /**
     * Get subscription statistics
     */
    getSubscriptionStats() {
        const subscribers = Utils.storage.get('newsletter_subscribers', []);
        const subscriptionDate = Utils.storage.get('newsletter_subscription_date');
        
        return {
            totalSubscribers: subscribers.length,
            subscriptionDate: subscriptionDate,
            isSubscribed: subscribers.length > 0
        };
    }

    /**
     * Unsubscribe email (for testing purposes)
     */
    unsubscribeEmail(email) {
        const subscribers = Utils.storage.get('newsletter_subscribers', []);
        const emailLower = email.toLowerCase();
        const filteredSubscribers = subscribers.filter(sub => sub !== emailLower);
        
        Utils.storage.set('newsletter_subscribers', filteredSubscribers);
        
        if (AppConfig.debug) {
            // Unsubscribed logged
        }
    }

    /**
     * Clear all subscriptions (for testing)
     */
    clearAllSubscriptions() {
        Utils.storage.remove('newsletter_subscribers');
        Utils.storage.remove('newsletter_subscription_date');
        
        if (AppConfig.debug) {
            // All subscriptions cleared
        }
    }

    /**
     * Destroy newsletter component
     */
    destroy() {
        // Remove event listeners would go here if needed
        // For now, most event listeners are attached directly to elements
    }
}

// Initialize newsletter component when DOM is ready
let newsletterComponent = null;

document.addEventListener('DOMContentLoaded', () => {
    newsletterComponent = new NewsletterComponent();
});

// Listen for component loaded event
document.addEventListener('componentLoaded', (e) => {
    if (e.detail.componentName === 'newsletter') {
        // Reinitialize if newsletter component is loaded dynamically
        if (newsletterComponent) {
            newsletterComponent.destroy();
        }
        newsletterComponent = new NewsletterComponent();
    }
});

// Add animation styles
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confetti {
            0% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(0) rotate(0deg);
            }
            50% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.2) rotate(180deg);
            }
            100% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8) rotate(360deg);
            }
        }
        
        .newsletter-input.valid {
            border-color: #4CAF50;
            box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }
        
        .newsletter-input.invalid {
            border-color: #FF4444;
            box-shadow: 0 0 0 3px rgba(255, 68, 68, 0.1);
        }
    `;
    document.head.appendChild(style);
});

// Export for other scripts
window.NewsletterComponent = NewsletterComponent;