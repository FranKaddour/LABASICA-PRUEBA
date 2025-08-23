/* ==================== PRODUCTOS PAGE JAVASCRIPT ==================== */

/**
 * Products page functionality
 */
class ProductosPage {
    constructor() {
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.initFilters();
        this.initShowMoreButton();
        this.handleResponsiveLayout();
        
        // Listen for window resize to handle responsive behavior
        window.addEventListener('resize', () => this.handleResponsiveLayout());
    }

    /**
     * Initialize filter functionality
     */
    initFilters() {
        // Usar delegación de eventos para evitar duplicar listeners
        const categoryFilters = document.querySelector('.category-filters');
        
        if (categoryFilters) {
            categoryFilters.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn') && !e.target.classList.contains('show-more-btn')) {
                    e.preventDefault();
                    
                    const selectedFilter = e.target.dataset.filter;
                    
                    // Update active filter button - tanto primary como secondary
                    const allFilterBtns = document.querySelectorAll('.filter-btn');
                    allFilterBtns.forEach(btn => {
                        if (btn.dataset.filter === selectedFilter) {
                            btn.classList.add('active');
                        } else {
                            btn.classList.remove('active');
                        }
                    });
                    
                    // Update current filter
                    this.currentFilter = selectedFilter;
                    
                    // Here you can add logic for filtering products when they are implemented
                    console.log('Filter selected:', this.currentFilter);
                }
            });
        }
    }

    /**
     * Initialize show more button functionality
     */
    initShowMoreButton() {
        const showMoreBtn = document.getElementById('showMoreBtn');
        const hiddenFilters = document.getElementById('hiddenFilters');
        const showMoreText = showMoreBtn?.querySelector('.show-more-text');
        const showMoreIcon = showMoreBtn?.querySelector('.show-more-icon');
        
        if (showMoreBtn && hiddenFilters) {
            showMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const isExpanded = hiddenFilters.classList.contains('expanded');
                
                if (!isExpanded) {
                    // Mostrar categorías ocultas desplegando hacia abajo
                    hiddenFilters.style.display = 'flex';
                    hiddenFilters.classList.add('expanded');
                    showMoreIcon.classList.remove('fa-chevron-down');
                    showMoreIcon.classList.add('fa-chevron-up');
                } else {
                    // Ocultar categorías colapsando hacia arriba
                    hiddenFilters.classList.remove('expanded');
                    showMoreIcon.classList.remove('fa-chevron-up');
                    showMoreIcon.classList.add('fa-chevron-down');
                    
                    // Esperar a que termine la animación antes de ocultar
                    setTimeout(() => {
                        if (!hiddenFilters.classList.contains('expanded')) {
                            hiddenFilters.style.display = 'none';
                        }
                    }, 400);
                }
            });
        }
    }

    /**
     * Handle responsive layout for button positioning
     */
    handleResponsiveLayout() {
        const showMoreBtn = document.getElementById('showMoreBtn');
        const mainRow = document.querySelector('.main-row');
        const expandButtonRow = document.querySelector('.expand-button-row');
        
        if (!showMoreBtn || !mainRow || !expandButtonRow) return;
        
        const isDesktop = window.innerWidth >= 768;
        
        if (isDesktop) {
            // En desktop: mover botón a la primera fila
            if (expandButtonRow.contains(showMoreBtn)) {
                mainRow.appendChild(showMoreBtn);
            }
        } else {
            // En mobile: mover botón a su propia fila
            if (mainRow.contains(showMoreBtn)) {
                expandButtonRow.appendChild(showMoreBtn);
            }
        }
    }
}

/**
 * Initialize page when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    const productosPage = new ProductosPage();

    // Make available globally for debugging
    if (AppConfig.debug) {
        window.ProductosPage = productosPage;
    }
});

// Listen for component ready events
document.addEventListener('allComponentsReady', () => {
    Navigation.setActiveNav();
});