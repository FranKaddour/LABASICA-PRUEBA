/* ==================== HOME PAGE JAVASCRIPT ==================== */

/**
 * Home page specific functionality
 */
class HomePage {
    constructor() {
        this.currentPage = 'home';
        this.sections = [];
        this.cards = [];
        this.initialized = false;
        
        this.init();
    }

    /**
     * Initialize home page
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Setup home page functionality
     */
    setup() {
        this.findElements();
        this.bindEvents();
        this.initAnimations();
        this.initIntersectionObserver();
        this.initializeCards();
        
        this.initialized = true;
        
        if (AppConfig.debug) {
            // Home page initialized
        }
    }

    /**
     * Find page elements
     */
    findElements() {
        this.sections = document.querySelectorAll('.content-section');
        this.cards = document.querySelectorAll('.card');
        this.heroImage = document.querySelector('.hero-image');
        this.categoryItems = document.querySelectorAll('.category-item');
        this.cookieCards = document.querySelectorAll('.cookie-card');
        this.viewAllLinks = document.querySelectorAll('.view-all');
        this.bannerBtn = document.querySelector('.shop-product-btn');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Product cards interaction
        this.cards.forEach(card => {
            this.setupCardInteraction(card);
        });

        // Category items
        this.categoryItems.forEach(item => {
            this.setupCategoryInteraction(item);
        });

        // Cookie cards
        this.cookieCards.forEach(card => {
            this.setupCookieCardInteraction(card);
        });

        // View all links
        this.viewAllLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleViewAllClick(e, link);
            });
        });

        // Banner button
        if (this.bannerBtn) {
            this.bannerBtn.addEventListener('click', () => {
                this.handleBannerButtonClick();
            });
        }

        // Hero image interaction
        if (this.heroImage) {
            this.setupHeroImageInteraction();
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
    }

    /**
     * Setup card interaction
     */
    setupCardInteraction(card) {
        const image = card.querySelector('.card-image');
        const title = card.querySelector('.card-title');
        const description = card.querySelector('.card-description');

        // Click handler
        card.addEventListener('click', () => {
            this.handleCardClick(card);
        });

        // Hover effects
        card.addEventListener('mouseenter', () => {
            this.handleCardHover(card, true);
        });

        card.addEventListener('mouseleave', () => {
            this.handleCardHover(card, false);
        });

        // Touch events for mobile
        card.addEventListener('touchstart', (e) => {
            this.handleCardTouch(card, e);
        });
    }

    /**
     * Setup category interaction
     */
    setupCategoryInteraction(item) {
        item.addEventListener('click', () => {
            this.handleCategoryClick(item);
        });

        // Add hover effect
        item.addEventListener('mouseenter', () => {
            const image = item.querySelector('.category-image');
            if (image) {
                image.style.transform = 'scale(1.05)';
            }
        });

        item.addEventListener('mouseleave', () => {
            const image = item.querySelector('.category-image');
            if (image) {
                image.style.transform = 'scale(1)';
            }
        });
    }

    /**
     * Setup cookie card interaction
     */
    setupCookieCardInteraction(card) {
        card.addEventListener('click', () => {
            this.handleCookieCardClick(card);
        });
    }

    /**
     * Setup hero image interaction
     */
    setupHeroImageInteraction() {
        // Only parallax scroll effect, no click modal
        window.addEventListener('scroll', Utils.throttle(() => {
            this.updateHeroParallax();
        }, 16));
    }

    /**
     * Handle card click
     */
    handleCardClick(card) {
        const title = card.querySelector('.card-title')?.textContent;

        // Track click
        this.trackEvent('product_card_click', {
            title: title
        });

        // Navigate to products page instead of showing modal
        window.location.href = 'pages/productos.html';
    }

    /**
     * Handle card hover
     */
    handleCardHover(card, isHovering) {
        const image = card.querySelector('.card-image');
        const title = card.querySelector('.card-title');
        const description = card.querySelector('.card-description');

        // Limpiar timeout previo si existe
        if (card._hoverTimeout) {
            clearTimeout(card._hoverTimeout);
            card._hoverTimeout = null;
        }

        if (isHovering) {
            // Add stagger delay to hover effect
            card._hoverTimeout = setTimeout(() => {
                if (image) image.style.opacity = '0';
                if (title) title.style.opacity = '0';
                if (description) {
                    description.style.opacity = '1';
                    description.style.visibility = 'visible';
                }
                card._hoverTimeout = null;
            }, 50);
        } else {
            if (image) image.style.opacity = '1';
            if (title) title.style.opacity = '1';
            if (description) {
                description.style.opacity = '0';
                description.style.visibility = 'hidden';
            }
        }
    }

    /**
     * Handle card touch
     */
    handleCardTouch(card, event) {
        // Add touch feedback
        card.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
    }

    /**
     * Handle category click
     */
    handleCategoryClick(item) {
        const image = item.querySelector('.category-image');
        const alt = image?.alt || 'Categoría';

        this.trackEvent('category_click', { category: alt });

        // Navigate to products page with filter
        window.location.href = `pages/productos.html?category=${encodeURIComponent(alt)}`;
    }

    /**
     * Handle cookie card click
     */
    handleCookieCardClick(card) {
        const title = card.querySelector('.cookie-info h3')?.textContent;
        
        this.trackEvent('cookie_card_click', { title: title });
        
        // Add click animation
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 200);
    }


    /**
     * Handle view all click
     */
    handleViewAllClick(event, link) {
        event.preventDefault();
        
        const section = link.closest('.content-section');
        const sectionTitle = section?.querySelector('h2')?.textContent;
        
        this.trackEvent('view_all_click', { section: sectionTitle });
        
        // Navigate to products page
        window.location.href = 'pages/productos.html';
    }

    /**
     * Handle banner button click
     */
    handleBannerButtonClick() {
        this.trackEvent('banner_button_click', { button: 'QUIERO' });
        
        // Add click animation
        this.bannerBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.bannerBtn.style.transform = '';
        }, 150);

        // Show coming soon modal
        Utils.showNotification('¡Próximamente! Los BOX especiales estarán disponibles pronto.', 'info', 3000);
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            const focused = document.activeElement;
            
            if (focused && focused.classList.contains('card')) {
                event.preventDefault();
                this.handleCardClick(focused);
            }
        }
    }

    /**
     * Update hero parallax effect
     */
    updateHeroParallax() {
        if (!this.heroImage) return;
        
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        
        this.heroImage.style.transform = `translateY(${rate}px)`;
    }

    /**
     * Initialize animations
     */
    initAnimations() {
        // Add entrance animations to cards with stagger
        this.cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });

        // Animate category items
        this.categoryItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }, 200 + (index * 150));
        });
    }

    /**
     * Initialize intersection observer for lazy animations
     */
    initIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateSection(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        // Observe sections
        this.sections.forEach(section => {
            observer.observe(section);
        });
    }

    /**
     * Animate section when it comes into view
     */
    animateSection(section) {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
        
        // Add stagger animation to child elements
        const children = section.querySelectorAll('.card, .category-item, .cookie-card');
        children.forEach((child, index) => {
            setTimeout(() => {
                child.classList.add('animate-in');
            }, index * 100);
        });
    }


    /**
     * Initialize cards with enhanced functionality
     */
    initializeCards() {
        this.cards.forEach(card => {
            // Add keyboard support
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            
            // Add ARIA labels
            const title = card.querySelector('.card-title')?.textContent;
            if (title) {
                card.setAttribute('aria-label', `Ver detalles de ${title}`);
            }
        });
    }

    /**
     * Track events
     */
    trackEvent(eventName, data = {}) {
        if (AppConfig.debug) {
            // Home page event logged
        }

        document.dispatchEvent(new CustomEvent('homePageEvent', {
            detail: { eventName, data, timestamp: Date.now() }
        }));
    }

    /**
     * Refresh page content
     */
    refresh() {
        // Reload dynamic content if needed
        this.setup();
    }

    /**
     * Destroy home page
     */
    destroy() {
        // Clean up event listeners
        window.removeEventListener('scroll', this.updateHeroParallax);
        
        // Remove any modals
        document.querySelectorAll('.product-modal').forEach(modal => {
            modal.remove();
        });
    }
}

// Initialize home page if we're on the home page
let homePage = null;

document.addEventListener('DOMContentLoaded', () => {
    if (Navigation.getCurrentPage() === 'home') {
        homePage = new HomePage();
    }
});

// Export for other scripts
window.HomePage = HomePage;