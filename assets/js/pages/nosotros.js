/* ==================== NOSOTROS PAGE JAVASCRIPT ==================== */

/**
 * About page functionality
 */
class NosotrosPage {
    constructor() {
        this.init();
    }

    init() {
        this.initAnimations();
        this.initTeamInteractions();
        this.initFAQ();
    }

    /**
     * Initialize animations for sections
     */
    initAnimations() {
        // Animate value cards on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe value cards
        document.querySelectorAll('.value-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            observer.observe(card);
        });

        // Observe team members
        document.querySelectorAll('.team-member').forEach((member, index) => {
            member.style.animationDelay = `${index * 0.1}s`;
            observer.observe(member);
        });
    }

    /**
     * Initialize team member interactions
     */
    initTeamInteractions() {
        const teamMembers = document.querySelectorAll('.team-member');
        
        teamMembers.forEach(member => {
            const photo = member.querySelector('.member-photo');
            const info = member.querySelector('.member-info');
            
            if (photo && info) {
                // Add hover effects
                member.addEventListener('mouseenter', () => {
                    photo.classList.add('hover');
                    info.classList.add('hover');
                });

                member.addEventListener('mouseleave', () => {
                    photo.classList.remove('hover');
                    info.classList.remove('hover');
                });

                // Add focus handling for accessibility
                member.addEventListener('focus', () => {
                    photo.classList.add('focus');
                });

                member.addEventListener('blur', () => {
                    photo.classList.remove('focus');
                });
            }
        });

        // Handle social media links
        const socialLinks = document.querySelectorAll('.member-social a');
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Add click animation
                link.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    link.style.transform = '';
                }, 150);
            });
        });
    }

    /**
     * Initialize FAQ accordion functionality
     */
    initFAQ() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        if (!faqQuestions.length) return;
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', (e) => {
                this.toggleFAQ(e.target.closest('.faq-question'));
            });
            
            // Handle keyboard navigation
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleFAQ(question);
                }
            });
        });
        
        // Add scroll animation for FAQ categories
        this.initFAQAnimations();
    }
    
    /**
     * Toggle FAQ item open/closed
     * @param {Element} question - The question button element
     */
    toggleFAQ(question) {
        const faqItem = question.closest('.faq-item');
        const answer = faqItem.querySelector('.faq-answer');
        const icon = question.querySelector('.faq-icon');
        const isExpanded = question.getAttribute('aria-expanded') === 'true';
        
        // Close all other FAQ items in the same category (accordion behavior)
        const category = question.closest('.faq-category');
        const otherQuestions = category.querySelectorAll('.faq-question');
        
        otherQuestions.forEach(otherQuestion => {
            if (otherQuestion !== question) {
                this.closeFAQ(otherQuestion);
            }
        });
        
        // Toggle current FAQ item
        if (isExpanded) {
            this.closeFAQ(question);
        } else {
            this.openFAQ(question);
        }
        
        // Add click effect
        question.style.transform = 'scale(0.98)';
        setTimeout(() => {
            question.style.transform = '';
        }, 150);
    }
    
    /**
     * Open FAQ item
     * @param {Element} question - The question button element
     */
    openFAQ(question) {
        const faqItem = question.closest('.faq-item');
        const answer = faqItem.querySelector('.faq-answer');
        const answerContent = answer.querySelector('.faq-answer-content');
        
        // Set ARIA attributes
        question.setAttribute('aria-expanded', 'true');
        answer.setAttribute('aria-hidden', 'false');
        
        // Calculate the height needed
        const contentHeight = answerContent.scrollHeight;
        answer.style.maxHeight = contentHeight + 'px';
        
        // Add open class for additional styling
        faqItem.classList.add('faq-open');
        
        // Smooth scroll to question if needed
        setTimeout(() => {
            const rect = question.getBoundingClientRect();
            if (rect.top < 100) {
                question.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
            }
        }, 300);
    }
    
    /**
     * Close FAQ item
     * @param {Element} question - The question button element
     */
    closeFAQ(question) {
        const faqItem = question.closest('.faq-item');
        const answer = faqItem.querySelector('.faq-answer');
        
        // Set ARIA attributes
        question.setAttribute('aria-expanded', 'false');
        answer.setAttribute('aria-hidden', 'true');
        
        // Reset height
        answer.style.maxHeight = '0';
        
        // Remove open class
        faqItem.classList.remove('faq-open');
    }
    
    /**
     * Initialize FAQ animations
     */
    initFAQAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const faqObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    faqObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe FAQ categories
        document.querySelectorAll('.faq-category').forEach((category, index) => {
            // Set initial state
            category.style.opacity = '0';
            category.style.transform = 'translateY(30px)';
            category.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            category.style.transitionDelay = `${index * 0.1}s`;
            
            faqObserver.observe(category);
        });
        
        // Observe CTA section
        const ctaSection = document.querySelector('.faq-contact-cta');
        if (ctaSection) {
            ctaSection.style.opacity = '0';
            ctaSection.style.transform = 'translateY(30px)';
            ctaSection.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            ctaSection.style.transitionDelay = '0.3s';
            
            faqObserver.observe(ctaSection);
        }
    }

}

/**
 * Initialize page when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    const nosotrosPage = new NosotrosPage();

    // Make available globally for debugging
    if (AppConfig.debug) {
        window.NosotrosPage = nosotrosPage;
    }
});

// Listen for component ready events
document.addEventListener('allComponentsReady', () => {
    // Re-initialize any component-dependent functionality
    Navigation.setActiveNav();
});