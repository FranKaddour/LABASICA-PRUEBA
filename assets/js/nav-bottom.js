/* ==================== BOTTOM NAVIGATION COMPONENT JAVASCRIPT ==================== */

/**
 * Bottom Navigation component functionality
 */
class BottomNavComponent {
    constructor() {
        this.bottomNav = null;
        this.navItems = [];
        this.currentPage = '';
        
        this.init();
    }

    /**
     * Initialize bottom navigation component
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
     * Setup bottom navigation functionality
     */
    setup() {
        this.bottomNav = document.querySelector('.bottom-nav');
        
        if (!this.bottomNav) {
            // Bottom nav might not exist on all pages (like perfil)
            return;
        }

        this.findElements();
        this.bindEvents();
        this.setActivePage();
        this.handleSafeArea();
    }

    /**
     * Find navigation elements
     */
    findElements() {
        this.navItems = Array.from(this.bottomNav.querySelectorAll('.nav-item'));
        this.currentPage = Navigation.getCurrentPage();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation item clicks
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleNavClick(e, item);
            });

            // Touch feedback
            item.addEventListener('touchstart', () => {
                this.addTouchFeedback(item);
            });

            item.addEventListener('touchend', () => {
                this.removeTouchFeedback(item);
            });
        });

        // Keyboard navigation
        this.bottomNav.addEventListener('keydown', (e) => {
            this.handleKeyNavigation(e);
        });

        // Handle page changes
        window.addEventListener('popstate', () => {
            this.setActivePage();
        });
    }

    /**
     * Handle navigation item click
     */
    handleNavClick(e, item) {
        const href = item.getAttribute('href');
        const page = item.dataset.page;
        
        // Prevent default if it's just a page indicator
        if (!href || href === '#') {
            e.preventDefault();
        }

        // Update active state
        this.setActiveItem(item);
        
        // Track navigation
        this.trackNavigation(page, href);

        // Add visual feedback
        this.addClickFeedback(item);

        // Handle smooth scrolling for anchor links
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = document.querySelector('.mobile-header')?.offsetHeight || 80;
                Utils.scrollToElement(target, headerHeight);
            }
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyNavigation(e) {
        const activeItem = this.bottomNav.querySelector('.nav-item:focus');
        if (!activeItem) return;

        const currentIndex = this.navItems.indexOf(activeItem);
        let newIndex = currentIndex;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                newIndex = currentIndex > 0 ? currentIndex - 1 : this.navItems.length - 1;
                break;
            case 'ArrowRight':
                e.preventDefault();
                newIndex = currentIndex < this.navItems.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                activeItem.click();
                break;
        }

        if (newIndex !== currentIndex) {
            this.navItems[newIndex].focus();
        }
    }

    /**
     * Set active navigation item
     */
    setActiveItem(activeItem) {
        // Remove active class from all items
        this.navItems.forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to clicked item
        activeItem.classList.add('active');

        // Update corresponding header navigation if exists
        const page = activeItem.dataset.page;
        if (page) {
            document.querySelectorAll(`[data-page="${page}"]`).forEach(item => {
                item.classList.add('active');
            });
        }
    }

    /**
     * Set active page based on current URL
     */
    setActivePage() {
        const currentPage = Navigation.getCurrentPage();
        
        // Find and activate corresponding nav item
        const activeItem = this.navItems.find(item => 
            item.dataset.page === currentPage
        );

        if (activeItem) {
            this.setActiveItem(activeItem);
        }
    }

    /**
     * Add touch feedback
     */
    addTouchFeedback(item) {
        if (!item.classList.contains('active')) {
            item.style.transform = 'scale(0.95)';
            item.style.backgroundColor = 'rgba(210, 105, 30, 0.1)';
        }
    }

    /**
     * Remove touch feedback
     */
    removeTouchFeedback(item) {
        setTimeout(() => {
            item.style.transform = '';
            if (!item.classList.contains('active')) {
                item.style.backgroundColor = '';
            }
        }, 150);
    }

    /**
     * Add click feedback
     */
    addClickFeedback(item) {
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'nav-ripple';
        
        const rect = item.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(210, 105, 30, 0.3);
            pointer-events: none;
            width: ${size}px;
            height: ${size}px;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(0);
            animation: ripple 0.6s linear;
        `;

        item.style.position = 'relative';
        item.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    /**
     * Handle safe area for devices with notches
     */
    handleSafeArea() {
        // Add extra padding for devices with home indicator
        if (CSS.supports('padding-bottom', 'env(safe-area-inset-bottom)')) {
            this.bottomNav.style.paddingBottom = 
                `calc(10px + env(safe-area-inset-bottom))`;
        }
    }

    /**
     * Track navigation usage
     */
    trackNavigation(page, href) {
        if (AppConfig.debug) {
            // Bottom nav click logged
        }

        // Dispatch event for analytics
        document.dispatchEvent(new CustomEvent('bottomNavClick', {
            detail: { page, href, timestamp: Date.now() }
        }));
    }

    /**
     * Add notification badge to nav item
     */
    addNotificationBadge(page, count = 1) {
        const navItem = this.navItems.find(item => item.dataset.page === page);
        if (!navItem) return;

        // Remove existing badge
        this.removeNotificationBadge(page);

        const badge = document.createElement('span');
        badge.className = 'nav-notification-badge';
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.cssText = `
            position: absolute;
            top: 5px;
            right: 15px;
            background: #FF4444;
            color: white;
            border-radius: 10px;
            min-width: 18px;
            height: 18px;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            padding: 0 4px;
            animation: bounceIn 0.3s ease-out;
        `;

        navItem.style.position = 'relative';
        navItem.appendChild(badge);
    }

    /**
     * Remove notification badge from nav item
     */
    removeNotificationBadge(page) {
        const navItem = this.navItems.find(item => item.dataset.page === page);
        if (!navItem) return;

        const badge = navItem.querySelector('.nav-notification-badge');
        if (badge) {
            badge.style.animation = 'bounceOut 0.3s ease-out';
            setTimeout(() => {
                if (badge.parentNode) {
                    badge.parentNode.removeChild(badge);
                }
            }, 300);
        }
    }

    /**
     * Update nav item badge count
     */
    updateNotificationBadge(page, count) {
        if (count > 0) {
            this.addNotificationBadge(page, count);
        } else {
            this.removeNotificationBadge(page);
        }
    }

    /**
     * Temporarily highlight a nav item
     */
    highlightNavItem(page, duration = 2000) {
        const navItem = this.navItems.find(item => item.dataset.page === page);
        if (!navItem || navItem.classList.contains('active')) return;

        const originalBackground = navItem.style.backgroundColor;
        navItem.style.backgroundColor = 'rgba(210, 105, 30, 0.2)';
        navItem.style.transform = 'translateY(-3px)';

        setTimeout(() => {
            navItem.style.backgroundColor = originalBackground;
            navItem.style.transform = '';
        }, duration);
    }

    /**
     * Show/hide bottom navigation
     */
    setVisibility(visible) {
        if (!this.bottomNav) return;

        if (visible) {
            this.bottomNav.style.transform = 'translateY(0)';
            this.bottomNav.style.opacity = '1';
        } else {
            this.bottomNav.style.transform = 'translateY(100%)';
            this.bottomNav.style.opacity = '0';
        }
    }

    /**
     * Destroy bottom navigation component
     */
    destroy() {
        // Remove event listeners would go here if needed
        // For now, most event listeners are attached directly to elements
    }
}

// Initialize bottom navigation component when DOM is ready
let bottomNavComponent = null;

document.addEventListener('DOMContentLoaded', () => {
    bottomNavComponent = new BottomNavComponent();
});

// Listen for component loaded event
document.addEventListener('componentLoaded', (e) => {
    if (e.detail.componentName === 'nav-bottom') {
        // Reinitialize if bottom nav component is loaded dynamically
        if (bottomNavComponent) {
            bottomNavComponent.destroy();
        }
        bottomNavComponent = new BottomNavComponent();
    }
});

// Add animation styles
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0;
            }
        }
        
        @keyframes bounceIn {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        
        @keyframes bounceOut {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(0); }
        }
        
        .bottom-nav .nav-item {
            transition: all 0.2s ease;
        }
        
        .bottom-nav .nav-item:focus {
            outline: 2px solid var(--accent-orange);
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(style);
});

// Export for other scripts
window.BottomNavComponent = BottomNavComponent;