/* ==================== FOOTER COMPONENT JAVASCRIPT ==================== */

/**
 * Footer component functionality
 */
class FooterComponent {
    constructor() {
        this.footer = null;
        this.socialLinks = [];
        
        this.init();
    }

    /**
     * Initialize footer component
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
     * Setup footer functionality
     */
    setup() {
        this.footer = document.querySelector('.footer');
        
        if (!this.footer) {
            // Footer element not found
            return;
        }

        this.findElements();
        this.bindEvents();
        this.updateCopyright();
        this.initAnimations();
    }

    /**
     * Find footer elements
     */
    findElements() {
        this.socialLinks = this.footer.querySelectorAll('.footer-social a');
        this.footerLinks = this.footer.querySelectorAll('.footer-section a');
        this.copyrightYear = this.footer.querySelector('#currentYear');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Social links tracking
        this.socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleSocialClick(e, link);
            });
        });

        // Footer links
        this.footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleFooterLinkClick(e, link);
            });
        });


        // Back to top functionality (if exists)
        const backToTop = this.footer.querySelector('.back-to-top');
        if (backToTop) {
            backToTop.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToTop();
            });
        }
    }

    /**
     * Handle social link clicks
     */
    handleSocialClick(e, link) {
        const platform = this.getSocialPlatform(link);
        
        // Track social click
        this.trackEvent('social_click', {
            platform: platform,
            url: link.href
        });

        // Add click effect
        this.addClickEffect(link);
    }

    /**
     * Handle footer link clicks
     */
    handleFooterLinkClick(e, link) {
        const href = link.getAttribute('href');
        
        // Handle smooth scrolling for anchor links
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = document.querySelector('.mobile-header')?.offsetHeight || 80;
                Utils.scrollToElement(target, headerHeight);
            }
        }

        // Track footer link click
        this.trackEvent('footer_link_click', {
            text: link.textContent.trim(),
            url: href
        });
    }


    /**
     * Get social platform from link
     */
    getSocialPlatform(link) {
        const href = link.href.toLowerCase();
        const icon = link.querySelector('i');
        
        if (href.includes('instagram') || icon?.classList.contains('fa-instagram')) return 'instagram';
        if (href.includes('whatsapp') || icon?.classList.contains('fa-whatsapp')) return 'whatsapp';
        if (href.includes('facebook') || icon?.classList.contains('fa-facebook')) return 'facebook';
        if (href.includes('tiktok') || icon?.classList.contains('fa-tiktok')) return 'tiktok';
        if (href.includes('twitter') || icon?.classList.contains('fa-twitter')) return 'twitter';
        
        return 'unknown';
    }

    /**
     * Add click effect to element
     */
    addClickEffect(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
    }

    /**
     * Update copyright year
     */
    updateCopyright() {
        if (this.copyrightYear) {
            this.copyrightYear.textContent = new Date().getFullYear();
        }
    }

    /**
     * Initialize animations
     */
    initAnimations() {
        // Animate footer elements when they come into view
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });

            // Observe footer sections
            this.footer.querySelectorAll('.footer-section, .footer-social').forEach(section => {
                observer.observe(section);
            });
        }
    }

    /**
     * Scroll to top
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        this.trackEvent('scroll_to_top');
    }

    /**
     * Track events (placeholder for analytics)
     */
    trackEvent(eventName, data = {}) {
        if (AppConfig.debug) {
            // Footer event logged
        }
        
        // Here you would integrate with your analytics service
        // Examples: Google Analytics, Mixpanel, etc.
        
        // Custom event dispatch for other components to listen
        document.dispatchEvent(new CustomEvent('footerTrackEvent', {
            detail: { eventName, data }
        }));
    }

    /**
     * Update social links
     */
    updateSocialLinks(links) {
        this.socialLinks.forEach(link => {
            const platform = this.getSocialPlatform(link);
            if (links[platform]) {
                link.href = links[platform];
                link.style.display = 'flex';
            } else {
                link.style.display = 'none';
            }
        });
    }


    /**
     * Add back to top button
     */
    addBackToTopButton() {
        if (this.footer.querySelector('.back-to-top')) return; // Already exists
        
        const backToTop = document.createElement('button');
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '<i class="fas fa-chevron-up"></i>';
        backToTop.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: var(--accent-orange);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(210, 105, 30, 0.3);
            transition: all 0.3s ease;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px);
        `;

        document.body.appendChild(backToTop);

        // Show/hide based on scroll position
        window.addEventListener('scroll', Utils.throttle(() => {
            if (window.pageYOffset > 300) {
                backToTop.style.opacity = '1';
                backToTop.style.visibility = 'visible';
                backToTop.style.transform = 'translateY(0)';
            } else {
                backToTop.style.opacity = '0';
                backToTop.style.visibility = 'hidden';
                backToTop.style.transform = 'translateY(20px)';
            }
        }, 100));

        // Click handler
        backToTop.addEventListener('click', () => {
            this.scrollToTop();
        });

        // Hover effect
        backToTop.addEventListener('mouseenter', () => {
            backToTop.style.transform = 'translateY(-3px) scale(1.1)';
            backToTop.style.boxShadow = '0 6px 20px rgba(210, 105, 30, 0.4)';
        });

        backToTop.addEventListener('mouseleave', () => {
            backToTop.style.transform = 'translateY(0) scale(1)';
            backToTop.style.boxShadow = '0 4px 12px rgba(210, 105, 30, 0.3)';
        });
    }

    /**
     * Destroy footer component
     */
    destroy() {
        // Remove event listeners would go here if needed
        // For now, most event listeners are attached directly to elements
        // and will be cleaned up when elements are removed
    }
}

// Initialize footer component when DOM is ready
let footerComponent = null;

document.addEventListener('DOMContentLoaded', () => {
    footerComponent = new FooterComponent();
});

// Listen for component loaded event
document.addEventListener('componentLoaded', (e) => {
    if (e.detail.componentName === 'footer') {
        // Reinitialize if footer component is loaded dynamically
        if (footerComponent) {
            footerComponent.destroy();
        }
        footerComponent = new FooterComponent();
    }
});

// Add animation styles
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .footer-section,
        .footer-social {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .footer-section.animate-in,
        .footer-social.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
});

// Export for other scripts
window.FooterComponent = FooterComponent;