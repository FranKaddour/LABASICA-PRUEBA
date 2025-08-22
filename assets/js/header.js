/* ==================== MODERN HEADER COMPONENT JAVASCRIPT ==================== */

/**
 * Modern Header Component with Professional Interactions
 * Handles navigation, mobile menu, cart functionality, and accessibility
 */
class ModernHeaderComponent {
    constructor() {
        this.header = null;
        this.menuToggle = null;
        this.mobileNav = null;
        this.mobileNavOverlay = null;
        this.mobileNavClose = null;
        this.cartToggle = null;
        this.cartBadge = null;
        this.isMenuOpen = false;
        this.scrollThreshold = 60;
        this.lastScrollY = 0;
        this.ticking = false;
        
        this.init();
    }

    /**
     * Initialize header component
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Setup header functionality
     */
    setup() {
        this.findElements();
        
        if (!this.header) {
            // Header elements not found
            return;
        }

        this.bindEvents();
        this.initNavigationStates();
        this.initCartBadge();
        this.initScrollEffects();
        this.initAccessibilityFeatures();
        
        if (AppConfig.debug) {
            // Header component initialized
        }
    }

    /**
     * Find header elements
     */
    findElements() {
        this.header = document.querySelector('.modern-header');
        this.menuToggle = document.getElementById('menuToggle');
        this.mobileNav = document.getElementById('mobileNav');
        this.mobileNavOverlay = document.getElementById('mobileNavOverlay');
        this.mobileNavClose = document.getElementById('mobileNavClose');
        this.cartToggle = document.getElementById('cartToggle');
        this.cartBadge = document.getElementById('cartBadge');
        this.navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        this.actionBtns = document.querySelectorAll('.action-btn');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Mobile menu toggle
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }

        // Mobile menu close
        if (this.mobileNavClose) {
            this.mobileNavClose.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Overlay click to close
        if (this.mobileNavOverlay) {
            this.mobileNavOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavLinkClick(e, link);
            });
        });

        // Cart toggle
        if (this.cartToggle) {
            this.cartToggle.addEventListener('click', () => {
                this.handleCartToggle();
            });
        }

        // Mobile cart button
        const mobileCartBtn = document.querySelector('.cart-mobile-btn');
        if (mobileCartBtn) {
            mobileCartBtn.addEventListener('click', () => {
                this.handleCartToggle();
                // Also close mobile menu
                if (this.isMenuOpen) {
                    this.closeMobileMenu();
                }
            });
        }

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardEvents(e);
        });

        // Window events
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', Utils.debounce(() => this.handleResize(), 250));

        // Logo error handling
        const logoImages = document.querySelectorAll('.logo-image, .mobile-logo-image');
        logoImages.forEach(img => {
            img.addEventListener('error', (e) => {
                this.handleLogoError(e.target);
            });
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Open mobile menu
     */
    openMobileMenu() {
        this.isMenuOpen = true;
        
        // Update toggle button
        this.menuToggle.classList.add('active');
        this.menuToggle.setAttribute('aria-expanded', 'true');
        
        // Show overlay and menu
        this.mobileNavOverlay.classList.add('active');
        this.mobileNav.classList.add('active');
        this.mobileNav.setAttribute('aria-hidden', 'false');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus management
        requestAnimationFrame(() => {
            const firstLink = this.mobileNav.querySelector('.mobile-nav-link');
            if (firstLink) {
                firstLink.focus();
            }
        });

        // Trap focus in mobile menu
        this.trapFocus(this.mobileNav);
        
        // Emit event
        this.dispatchEvent('mobileMenuOpened');
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        if (!this.isMenuOpen) return;
        
        this.isMenuOpen = false;
        
        // Update toggle button
        this.menuToggle.classList.remove('active');
        this.menuToggle.setAttribute('aria-expanded', 'false');
        
        // Hide overlay and menu
        this.mobileNavOverlay.classList.remove('active');
        this.mobileNav.classList.remove('active');
        this.mobileNav.setAttribute('aria-hidden', 'true');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Return focus to menu toggle
        this.menuToggle.focus();
        
        // Emit event
        this.dispatchEvent('mobileMenuClosed');
    }

    /**
     * Handle navigation link clicks
     */
    handleNavLinkClick(event, link) {
        const href = link.getAttribute('href');
        const page = link.dataset.page;
        
        // Close mobile menu if open
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Update active states
        this.updateActiveNavigation(page);
        
        // Handle smooth scrolling for anchor links
        if (href && href.startsWith('#')) {
            event.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = this.header.offsetHeight;
                Utils.scrollToElement(target, headerHeight + 20);
            }
        }
        
        // Track navigation
        this.trackEvent('navigation_click', {
            page: page,
            href: href,
            fromMobile: link.classList.contains('mobile-nav-link')
        });
    }

    /**
     * Update active navigation states
     */
    updateActiveNavigation(activePage) {
        // Remove all active classes
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to corresponding links
        if (activePage) {
            document.querySelectorAll(`[data-page="${activePage}"]`).forEach(link => {
                link.classList.add('active');
            });
        }
    }

    /**
     * Initialize navigation states based on current page
     */
    initNavigationStates() {
        const currentPage = Navigation.getCurrentPage();
        this.updateActiveNavigation(currentPage);
    }

    /**
     * Handle cart toggle
     */
    handleCartToggle() {
        // Add click animation
        this.cartToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.cartToggle.style.transform = '';
        }, 150);
        
        // Open shopping cart if available
        if (window.shoppingCart && typeof window.shoppingCart.openCart === 'function') {
            window.shoppingCart.openCart();
        } else {
            Utils.showNotification('Carrito de compras cargando...', 'info', 2000);
        }
        
        // Track cart interaction
        this.trackEvent('cart_toggle_click');
    }

    /**
     * Initialize cart badge
     */
    initCartBadge() {
        // Listen for cart updates
        document.addEventListener('itemAddedToCart', () => this.updateCartBadgeFromCart());
        document.addEventListener('itemRemovedFromCart', () => this.updateCartBadgeFromCart());
        document.addEventListener('cartQuantityUpdated', () => this.updateCartBadgeFromCart());
        document.addEventListener('cartCleared', () => this.updateCartBadgeFromCart());
        
        // Initial badge update
        setTimeout(() => this.updateCartBadgeFromCart(), 100);
    }

    /**
     * Update cart badge from shopping cart system
     */
    updateCartBadgeFromCart() {
        if (window.shoppingCart) {
            const cartData = window.shoppingCart.getCart();
            const itemCount = cartData.totals.itemCount;
            this.updateCartBadge(itemCount);
        } else {
            // Fallback to storage
            const cartCount = Utils.storage.get('cart_count', 0);
            this.updateCartBadge(cartCount);
        }
    }

    /**
     * Update cart badge
     */
    updateCartBadge(count) {
        const badges = document.querySelectorAll('.cart-badge, .mobile-cart-badge');
        
        badges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.classList.add('visible');
                // Add bounce animation
                badge.classList.add('updated');
                setTimeout(() => badge.classList.remove('updated'), 300);
            } else {
                badge.classList.remove('visible');
            }
        });
        
        // Store count for fallback
        if (Utils && Utils.storage) {
            Utils.storage.set('cart_count', count);
        }
    }

    /**
     * Initialize scroll effects
     */
    initScrollEffects() {
        this.lastScrollY = 0;
        this.ticking = false;
        this.scrollThreshold = this.scrollThreshold || 60;
    }

    /**
     * Handle scroll effects
     */
    handleScroll() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.updateScrollEffects();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    /**
     * Update scroll effects
     */
    updateScrollEffects() {
        const scrollY = window.pageYOffset;
        const scrollDirection = scrollY > this.lastScrollY ? 'down' : 'up';
        
        // Add/remove scrolled class
        if (scrollY > this.scrollThreshold) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }
        
        // Hide/show header on scroll (optional - currently disabled)
        if (this.shouldHideOnScroll && !this.isMenuOpen) {
            if (scrollDirection === 'down' && scrollY > 200) {
                this.header.style.transform = 'translateY(-100%)';
            } else if (scrollDirection === 'up' || scrollY <= 200) {
                this.header.style.transform = 'translateY(0)';
            }
        }
        
        this.lastScrollY = scrollY;
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Close mobile menu on desktop
        if (window.innerWidth >= 1024 && this.isMenuOpen) {
            this.closeMobileMenu();
        }
    }

    /**
     * Handle keyboard events
     */
    handleKeyboardEvents(event) {
        // Close mobile menu on Escape
        if (event.key === 'Escape' && this.isMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Handle mobile menu navigation with arrow keys
        if (this.isMenuOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            this.handleMobileMenuNavigation(event);
        }
    }

    /**
     * Handle mobile menu keyboard navigation
     */
    handleMobileMenuNavigation(event) {
        const focusableElements = this.mobileNav.querySelectorAll(
            'a, button, [tabindex]:not([tabindex="-1"])'
        );
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
        
        let newIndex;
        if (event.key === 'ArrowDown') {
            newIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        } else {
            newIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        }
        
        event.preventDefault();
        focusableElements[newIndex].focus();
    }

    /**
     * Initialize accessibility features
     */
    initAccessibilityFeatures() {
        // Set initial ARIA states
        this.menuToggle.setAttribute('aria-expanded', 'false');
        this.mobileNav.setAttribute('aria-hidden', 'true');
        
        // Add skip link if it doesn't exist
        this.addSkipLink();
        
        // Improve logo accessibility
        const logoLink = document.querySelector('.logo-link');
        if (logoLink && !logoLink.getAttribute('aria-label')) {
            logoLink.setAttribute('aria-label', 'LA BASICA - Ir al inicio');
        }
    }

    /**
     * Add skip link for accessibility
     */
    addSkipLink() {
        if (document.querySelector('.skip-link')) return;
        
        const skipLink = document.createElement('a');
        skipLink.className = 'skip-link sr-only';
        skipLink.href = '#main-content';
        skipLink.textContent = 'Saltar al contenido principal';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--accent-orange);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 10000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
            skipLink.classList.remove('sr-only');
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
            skipLink.classList.add('sr-only');
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    /**
     * Trap focus within element
     */
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };
        
        element.addEventListener('keydown', handleTabKey);
        
        // Store handler for cleanup
        element._trapFocusHandler = handleTabKey;
    }

    /**
     * Handle logo loading errors
     */
    handleLogoError(img) {
        // Logo image failed to load
        
        // Hide image and show fallback text
        img.style.display = 'none';
        const fallback = img.nextElementSibling;
        if (fallback && fallback.classList.contains('logo-fallback')) {
            fallback.style.display = 'inline-block';
        }
    }

    /**
     * Dispatch custom events
     */
    dispatchEvent(eventName, detail = {}) {
        document.dispatchEvent(new CustomEvent(eventName, {
            detail: {
                ...detail,
                timestamp: Date.now(),
                component: 'ModernHeader'
            }
        }));
    }

    /**
     * Track events for analytics
     */
    trackEvent(eventName, data = {}) {
        if (AppConfig.debug) {
            // Header event logged
        }
        
        this.dispatchEvent('headerTrackEvent', {
            eventName,
            data
        });
    }

    /**
     * Public methods for external control
     */
    
    /**
     * Show/hide header
     */
    setVisibility(visible) {
        this.header.style.transform = visible ? 'translateY(0)' : 'translateY(-100%)';
    }

    /**
     * Update cart count
     */
    setCartCount(count) {
        this.updateCartBadge(count);
    }

    /**
     * Set active page
     */
    setActivePage(page) {
        this.updateActiveNavigation(page);
    }

    /**
     * Enable/disable scroll hiding
     */
    enableScrollHiding(enable = true) {
        this.shouldHideOnScroll = enable;
    }

    /**
     * Get current state
     */
    getState() {
        return {
            isMenuOpen: this.isMenuOpen,
            isScrolled: this.header.classList.contains('scrolled'),
            cartCount: parseInt(this.cartBadge?.textContent || '0'),
            activePage: Navigation.getCurrentPage()
        };
    }

    /**
     * Destroy header component
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeyboardEvents);
        
        // Clean up focus trap
        if (this.mobileNav && this.mobileNav._trapFocusHandler) {
            this.mobileNav.removeEventListener('keydown', this.mobileNav._trapFocusHandler);
        }
        
        // Restore body styles
        document.body.style.overflow = '';
        
        // Close menu if open
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        }
        
        if (AppConfig.debug) {
            // Header component destroyed
        }
    }
}

// Initialize header component when DOM is ready
let modernHeaderComponent = null;

document.addEventListener('DOMContentLoaded', () => {
    modernHeaderComponent = new ModernHeaderComponent();
});

// Listen for component loaded event
document.addEventListener('componentLoaded', (e) => {
    if (e.detail.componentName === 'header') {
        // Reinitialize if header component is loaded dynamically
        if (modernHeaderComponent) {
            modernHeaderComponent.destroy();
        }
        modernHeaderComponent = new ModernHeaderComponent();
    }
});

// Listen for component ready event
document.addEventListener('allComponentsReady', () => {
    if (modernHeaderComponent) {
        modernHeaderComponent.initNavigationStates();
    }
});

// Export for other scripts
window.ModernHeaderComponent = ModernHeaderComponent;
window.modernHeaderComponent = modernHeaderComponent;

// Add CSS for skip link and other dynamic styles
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .skip-link:focus {
            clip: auto !important;
            height: auto !important;
            width: auto !important;
            position: absolute !important;
            margin: 0 !important;
        }
        
        /* Logo loading states */
        .logo-image {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .logo-image.loaded {
            opacity: 1;
        }
        
        /* Cart badge animations */
        @keyframes cartBadgeBounce {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        
        .cart-badge.updated,
        .mobile-cart-badge.updated {
            animation: cartBadgeBounce 0.3s ease;
        }
    `;
    document.head.appendChild(style);
});