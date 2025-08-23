/* ==================== NOSOTROS PAGE JAVASCRIPT ==================== */

/**
 * About page functionality
 */
class NosotrosPage {
    constructor() {
        this.galleryParallax = null;
        this.init();
    }

    init() {
        this.initAnimations();
        this.initTeamInteractions();
        this.initFAQ();
        this.initInnovativeGallery();
    }

    /**
     * Initialize animations for sections
     */
    initAnimations() {
        // Animate team members on scroll
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

    /**
     * Initialize Innovative Gallery
     */
    initInnovativeGallery() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalClose = document.querySelector('.modal-close');
        const modalBackdrop = document.querySelector('.modal-backdrop');
        
        if (!galleryItems.length || !modal) return;
        
        // Initialize carousel functionality
        this.initInfiniteCarousel();
        
        // Add click event to each gallery item
        galleryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Gallery item clicked!', item.dataset.title);
                this.openImageModal(item, modal, modalImage);
            });
            
            // Add keyboard support
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openImageModal(item, modal, modalImage);
                }
            });
            
            // Make items focusable for accessibility
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label', `Ver imagen: ${item.dataset.title}`);
        });
        
        // Close modal events
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeImageModal(modal);
            });
        }
        
        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', () => {
                this.closeImageModal(modal);
            });
        }
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeImageModal(modal);
            }
        });
        
        // Prevent modal content clicks from closing modal
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
    }
    
    /**
     * Open image modal with data from clicked item
     */
    openImageModal(item, modal, modalImage) {
        const imageSrc = item.dataset.image;
        const title = item.dataset.title;
        
        // Set modal content - only image
        if (modalImage) {
            modalImage.src = imageSrc;
            modalImage.alt = title;
        }
        
        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus on close button for accessibility
        setTimeout(() => {
            const closeButton = modal.querySelector('.modal-close');
            if (closeButton) {
                closeButton.focus();
            }
        }, 100);
    }
    
    /**
     * Close image modal
     */
    closeImageModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Return focus to the gallery item that opened the modal
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains('modal-close')) {
            // Find the first gallery item and focus on it
            const firstGalleryItem = document.querySelector('.gallery-item');
            if (firstGalleryItem) {
                firstGalleryItem.focus();
            }
        }
    }
    

    /**
     * Initialize Infinite Carousel
     */
    initInfiniteCarousel() {
        const gallery = document.querySelector('.innovative-gallery');
        const track = document.querySelector('.gallery-track');
        
        if (!gallery || !track) return;
        
        // Add touch support for mobile
        if (window.innerWidth <= 768) {
            this.addTouchSupport(gallery, track);
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                this.addTouchSupport(gallery, track);
            }
        });
    }
    
    /**
     * Add touch/swipe support for mobile
     */
    addTouchSupport(gallery, track) {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        gallery.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            track.style.animationPlayState = 'paused';
        }, { passive: true });
        
        gallery.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diffX = startX - currentX;
            
            // Allow natural scrolling
            gallery.scrollLeft += diffX * 0.5;
            startX = currentX;
        }, { passive: true });
        
        gallery.addEventListener('touchend', () => {
            isDragging = false;
            setTimeout(() => {
                track.style.animationPlayState = 'running';
            }, 2000); // Resume animation after 2 seconds
        });
    }

    /**
     * Initialize Diagonal Parallax Effect
     */
    initDiagonalParallax(galleryItems) {
        // Only apply parallax on desktop (screens wider than 768px)
        if (window.innerWidth <= 768) return;
        
        let isScrolling = false;
        
        const handleScroll = () => {
            if (!isScrolling) {
                requestAnimationFrame(() => {
                    const scrollY = window.pageYOffset;
                    const windowHeight = window.innerHeight;
                    
                    galleryItems.forEach((item, index) => {
                        const rect = item.getBoundingClientRect();
                        const itemTop = rect.top + scrollY;
                        const itemCenter = itemTop + rect.height / 2;
                        
                        // Calculate parallax offset based on scroll position
                        const parallaxSpeed = 0.3 + (index * 0.1); // Different speeds for each item
                        const yOffset = (scrollY - itemCenter + windowHeight) * parallaxSpeed;
                        
                        // Apply diagonal movement based on item position
                        let xOffset = 0;
                        if (item.classList.contains('floating-1') || item.classList.contains('floating-3')) {
                            xOffset = yOffset * 0.2; // Move right for left items
                        } else {
                            xOffset = yOffset * -0.2; // Move left for right items
                        }
                        
                        // Get the original rotation from CSS
                        let rotation = 0;
                        if (item.classList.contains('floating-1')) rotation = -12;
                        if (item.classList.contains('floating-2')) rotation = 15;
                        if (item.classList.contains('floating-3')) rotation = -8;
                        if (item.classList.contains('floating-4')) rotation = 10;
                        
                        // Apply subtle rotation changes based on scroll
                        const rotationOffset = (scrollY * 0.01) % 360;
                        const finalRotation = rotation + rotationOffset;
                        
                        // Apply the transforms
                        const translateZ = item.style.transform.includes('translateZ') ? 
                            item.style.transform.match(/translateZ\(([^)]+)\)/)?.[1] || '0px' : '0px';
                        
                        item.style.transform = `
                            rotate(${finalRotation}deg) 
                            translateZ(${translateZ}) 
                            translateY(${yOffset * 0.5}px) 
                            translateX(${xOffset}px)
                        `;
                    });
                    
                    isScrolling = false;
                });
                
                isScrolling = true;
            }
        };
        
        // Add scroll listener with throttling
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Clean up on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                window.removeEventListener('scroll', handleScroll);
            }
        });
        
        // Initial call to set positions
        handleScroll();
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