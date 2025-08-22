/* ==================== GLOBAL JAVASCRIPT ==================== */

/**
 * Global configuration and utilities
 */
const AppConfig = {
    // App settings
    name: 'LA BASICA',
    version: '1.0.0',
    debug: location.hostname === 'localhost' || location.hostname === '127.0.0.1',
    
    // API endpoints (if needed)
    api: {
        base: '',
        newsletter: '/api/newsletter',
        contact: '/api/contact'
    },
    
    // Animation settings
    animations: {
        duration: 300,
        easing: 'ease-in-out'
    },
    
    // Breakpoints (matches CSS)
    breakpoints: {
        mobile: 480,
        tablet: 768,
        desktop: 1024,
        desktopLg: 1440,
        desktopXl: 1920
    }
};

/**
 * Utility functions
 */
const Utils = {
    /**
     * Debounce function
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function(...args) {
            if (!lastRan) {
                func(...args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if ((Date.now() - lastRan) >= limit) {
                        func(...args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    },

    /**
     * Get current viewport width
     */
    getViewportWidth() {
        return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    },

    /**
     * Check if element is in viewport
     */
    isInViewport(element, threshold = 0) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        return (
            rect.top >= -threshold &&
            rect.left >= -threshold &&
            rect.bottom <= windowHeight + threshold &&
            rect.right <= windowWidth + threshold
        );
    },

    /**
     * Smooth scroll to element
     */
    scrollToElement(element, offset = 0) {
        if (!element) return;
        
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    },

    /**
     * Format price
     */
    formatPrice(price, currency = '$') {
        return `${currency}${price.toLocaleString()}`;
    },

    /**
     * Validate email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Show/hide loading state
     */
    setLoadingState(button, isLoading) {
        if (!button) return;
        
        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');
        
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
            if (btnText) btnText.style.opacity = '0';
            if (btnLoading) btnLoading.classList.remove('d-none');
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            if (btnText) btnText.style.opacity = '1';
            if (btnLoading) btnLoading.classList.add('d-none');
        }
    },

    /**
     * Show notification
     */
    showNotification(message, type = 'success', duration = 5000) {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: type === 'success' ? '#D4EDDA' : type === 'error' ? '#F8D7DA' : '#D1ECF1',
            color: type === 'success' ? '#155724' : type === 'error' ? '#721C24' : '#0C5460',
            padding: '15px 20px',
            borderRadius: '8px',
            border: `1px solid ${type === 'success' ? '#C3E6CB' : type === 'error' ? '#F5C6CB' : '#BEE5EB'}`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: '10000',
            maxWidth: '300px',
            fontSize: '14px',
            animation: 'slideInRight 0.3s ease-out'
        });

        // Add to document
        document.body.appendChild(notification);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        });

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideOutRight 0.3s ease-out';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }
    },

    /**
     * Local storage helpers
     */
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                // LocalStorage not available
                return false;
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                // Error reading localStorage
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                // Error removing from localStorage
                return false;
            }
        }
    }
};

/**
 * Component loader system
 */
const ComponentLoader = {
    loadedComponents: new Set(),

    /**
     * Load component HTML
     */
    async loadComponent(componentName, targetSelector) {
        if (this.loadedComponents.has(componentName)) {
            return true;
        }

        try {
            const response = await fetch(`/components/${componentName}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentName}`);
            }

            const html = await response.text();
            const targets = document.querySelectorAll(targetSelector);
            
            targets.forEach(target => {
                target.innerHTML = html;
            });

            this.loadedComponents.add(componentName);
            
            // Dispatch custom event
            document.dispatchEvent(new CustomEvent('componentLoaded', {
                detail: { componentName, targetSelector }
            }));

            return true;
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            return false;
        }
    },

    /**
     * Load multiple components
     */
    async loadComponents(components) {
        const promises = components.map(({ name, target }) => 
            this.loadComponent(name, target)
        );
        
        return await Promise.allSettled(promises);
    }
};

/**
 * Page navigation helpers
 */
const Navigation = {
    /**
     * Get current page name
     */
    getCurrentPage() {
        const path = window.location.pathname;
        if (path === '/' || path.endsWith('/index.html')) {
            return 'home';
        }
        
        const page = path.split('/').pop();
        return page.replace('.html', '') || 'home';
    },

    /**
     * Set active navigation items
     */
    setActiveNav() {
        const currentPage = this.getCurrentPage();
        
        // Remove all active classes
        document.querySelectorAll('.nav-item, .bottom-nav .nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to current page navigation items
        document.querySelectorAll(`[data-page="${currentPage}"]`).forEach(item => {
            item.classList.add('active');
        });
    },

    /**
     * Handle navigation clicks
     */
    initNavigation() {
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item[data-page]');
            if (navItem) {
                // Remove active from all nav items
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Add active to clicked item and corresponding items
                const page = navItem.dataset.page;
                document.querySelectorAll(`[data-page="${page}"]`).forEach(item => {
                    item.classList.add('active');
                });
            }
        });
    }
};

/**
 * Performance optimizations
 */
const Performance = {
    /**
     * Lazy load images
     */
    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            observer.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    },

    /**
     * Optimize scroll events
     */
    optimizedScroll: Utils.throttle(() => {
        const scrollTop = window.pageYOffset;
        
        // Update header scroll class
        const header = document.querySelector('.mobile-header');
        if (header) {
            header.classList.toggle('scrolled', scrollTop > 50);
        }
        
        // Emit scroll event for other components
        document.dispatchEvent(new CustomEvent('optimizedScroll', {
            detail: { scrollTop }
        }));
    }, 16),

    /**
     * Initialize performance optimizations
     */
    init() {
        this.initLazyLoading();
        window.addEventListener('scroll', this.optimizedScroll);
    }
};

/**
 * Accessibility helpers
 */
const A11y = {
    /**
     * Trap focus within element
     */
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });

        // Focus first element
        firstFocusable?.focus();
    },

    /**
     * Handle escape key
     */
    onEscape(callback) {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                callback(e);
            }
        });
    }
};

/**
 * Global initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize core functionality
    Navigation.setActiveNav();
    Navigation.initNavigation();
    Performance.init();

    // Add loading class to body when page loads
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });

    // Add touch device class
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }

    // Handle resize events
    const handleResize = Utils.debounce(() => {
        // Close mobile menu on desktop
        if (Utils.getViewportWidth() >= AppConfig.breakpoints.desktop) {
            const menuToggle = document.getElementById('menuToggle');
            const mobileNav = document.getElementById('mobileNav');
            
            if (menuToggle) menuToggle.classList.remove('active');
            if (mobileNav) mobileNav.classList.remove('active');
        }
    }, 250);

    window.addEventListener('resize', handleResize);

    // Update copyright year
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Global error handling
    window.addEventListener('error', (e) => {
        if (AppConfig.debug) {
            console.error('Global error:', e.error);
        }
    });

    // App loaded silently
});

// Add notification styles to document head
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .notification-close {
            background: none;
            border: none;
            font-size: 16px;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
            opacity: 0.7;
        }
        .notification-close:hover {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
});

// Export globals for other scripts
window.AppConfig = AppConfig;
window.Utils = Utils;
window.ComponentLoader = ComponentLoader;
window.Navigation = Navigation;
window.Performance = Performance;
window.A11y = A11y;