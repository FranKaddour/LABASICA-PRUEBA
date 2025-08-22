/* ==================== PRODUCTOS PAGE JAVASCRIPT ==================== */

/**
 * Products page functionality
 */
class ProductosPage {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.isLoading = false;
        this.modal = null;
        
        this.init();
    }

    init() {
        this.initProducts();
        this.initFilters();
        this.initSearch();
        this.initModal();
        this.initCategoryCards();
        this.loadProducts();
    }

    /**
     * Initialize products data
     */
    initProducts() {
        // Sample products data - in real app this would come from API
        this.products = [
            {
                id: 1,
                name: 'Pan Artesanal',
                category: 'pan',
                price: 600,
                image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                description: 'Pan horneado diariamente con masa madre natural y ingredientes orgánicos seleccionados',
                ingredients: ['Harina integral', 'Masa madre', 'Agua', 'Sal marina'],
                available: true,
                featured: true
            },
            {
                id: 2,
                name: 'Croissant Francés',
                category: 'pan',
                price: 450,
                image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                description: 'Croissant hojaldrado con mantequilla francesa, crujiente por fuera y suave por dentro',
                ingredients: ['Harina', 'Mantequilla francesa', 'Levadura', 'Huevos'],
                available: true,
                featured: true
            },
            {
                id: 3,
                name: 'Tarta de Frutas',
                category: 'pasteles',
                price: 2500,
                image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                description: 'Deliciosa tarta con crema pastelera y frutas frescas de temporada',
                ingredients: ['Masa quebrada', 'Crema pastelera', 'Frutas frescas', 'Gelatina'],
                available: true,
                featured: true
            },
            {
                id: 4,
                name: 'Pan Dulce',
                category: 'especiales',
                price: 800,
                image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                description: 'Pan dulce tradicional con frutas abrillantadas y nueces, perfecto para el desayuno',
                ingredients: ['Harina', 'Frutas abrillantadas', 'Nueces', 'Levadura'],
                available: true,
                featured: true
            },
            {
                id: 5,
                name: 'Galletas de Chocolate',
                category: 'galletas',
                price: 350,
                image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                description: 'Galletas caseras con chips de chocolate belga, horneadas hasta la perfección',
                ingredients: ['Harina', 'Chocolate belga', 'Mantequilla', 'Azúcar'],
                available: true,
                featured: true
            },
            {
                id: 6,
                name: 'Donas Glaseadas',
                category: 'especiales',
                price: 280,
                image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                description: 'Donas esponjosas con glaseado de azúcar y variedad de sabores únicos',
                ingredients: ['Harina', 'Azúcar glass', 'Levadura', 'Aceite vegetal'],
                available: true,
                featured: false
            }
        ];
    }

    /**
     * Initialize filter functionality
     */
    initFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update active filter button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update current filter
                this.currentFilter = btn.dataset.category;
                
                // Apply filters
                this.applyFilters();
            });
        });
    }

    /**
     * Initialize search functionality
     */
    initSearch() {
        const searchInput = document.getElementById('searchInput');
        
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.currentSearch = e.target.value.toLowerCase();
                this.applyFilters();
            }, 300));

            // Clear search on escape
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    searchInput.value = '';
                    this.currentSearch = '';
                    this.applyFilters();
                }
            });
        }
    }

    /**
     * Apply current filters and search
     */
    applyFilters() {
        this.filteredProducts = this.products.filter(product => {
            // Category filter
            if (this.currentFilter !== 'all' && product.category !== this.currentFilter) {
                return false;
            }
            
            // Search filter
            if (this.currentSearch && !product.name.toLowerCase().includes(this.currentSearch) &&
                !product.description.toLowerCase().includes(this.currentSearch)) {
                return false;
            }
            
            return true;
        });
        
        this.renderProducts();
    }

    /**
     * Load and render products
     */
    loadProducts() {
        this.showLoading(true);
        
        // Cargar productos inmediatamente (sin simulación)
        this.filteredProducts = [...this.products];
        this.renderProducts();
        this.showLoading(false);
    }

    /**
     * Render products to the grid
     */
    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!productsGrid) return;

        if (this.filteredProducts.length === 0) {
            productsGrid.innerHTML = '';
            if (emptyState) emptyState.classList.remove('d-none');
            return;
        }

        if (emptyState) emptyState.classList.add('d-none');

        const productsHTML = this.filteredProducts.map(product => this.createProductCard(product)).join('');
        productsGrid.innerHTML = productsHTML;

        // Add click handlers to product cards
        this.initProductCards();
    }

    /**
     * Create product card HTML
     */
    createProductCard(product) {
        return `
            <div class="product-card" data-product-id="${product.id}" role="button" tabindex="0">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                    ${!product.available ? '<span class="product-badge unavailable">Agotado</span>' : ''}
                </div>
                <div class="product-info">
                    <div class="product-category">${this.getCategoryName(product.category)}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-description">${product.description}</div>
                </div>
            </div>
        `;
    }

    /**
     * Initialize product card interactions
     */
    initProductCards() {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            // Click to view details
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.add-to-cart-btn')) {
                    const productId = parseInt(card.dataset.productId);
                    this.showProductModal(productId);
                }
            });

            // Keyboard support
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const productId = parseInt(card.dataset.productId);
                    this.showProductModal(productId);
                }
            });

            // Add to cart button
            const addBtn = card.querySelector('.add-to-cart-btn');
            if (addBtn && !addBtn.disabled) {
                addBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const productId = parseInt(card.dataset.productId);
                    this.addToCart(productId);
                });
            }
        });
    }

    /**
     * Initialize modal functionality
     */
    initModal() {
        this.modal = document.getElementById('productModal');
        const modalClose = document.getElementById('modalClose');
        
        if (!this.modal) return;

        // Close modal handlers
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Escape key to close
        A11y.onEscape(() => {
            if (this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    /**
     * Show product modal
     */
    showProductModal(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || !this.modal) return;

        const modalBody = document.getElementById('modalBody');
        if (!modalBody) return;

        modalBody.innerHTML = this.createModalContent(product);
        
        // Show modal
        this.modal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Trap focus
        A11y.trapFocus(this.modal);

        // Initialize modal interactions
        this.initModalInteractions(product);
    }

    /**
     * Create modal content
     */
    createModalContent(product) {
        return `
            <div class="modal-product">
                <div class="modal-product-image">
                    <img src="${product.image}" alt="${product.name}" class="modal-image">
                </div>
                <div class="modal-product-content">
                    <div class="modal-header">
                        <div class="product-category-badge">${this.getCategoryName(product.category)}</div>
                        <h2 class="modal-product-title">${product.name}</h2>
                        <div class="modal-product-price">${Utils.formatPrice(product.price)}</div>
                    </div>
                    
                    <div class="modal-body">
                        <div class="product-description-section">
                            <h3>Descripción</h3>
                            <p class="product-description-text">${product.description}</p>
                        </div>
                        
                        <div class="product-ingredients-section">
                            <h3>Ingredientes</h3>
                            <div class="ingredients-list">
                                ${product.ingredients.map(ingredient => `<span class="ingredient-tag">${ingredient}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div class="product-details">
                            <div class="detail-item">
                                <span class="detail-label">Disponibilidad:</span>
                                <span class="detail-value ${product.available ? 'available' : 'unavailable'}">
                                    ${product.available ? 'En Stock' : 'Agotado'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Initialize modal interactions
     */
    initModalInteractions(product) {
        const qtyMinus = document.getElementById('qtyMinus');
        const qtyPlus = document.getElementById('qtyPlus');
        const qtyValue = document.getElementById('qtyValue');
        const modalAddCart = document.getElementById('modalAddCart');
        
        let quantity = 1;

        // Quantity controls
        if (qtyMinus) {
            qtyMinus.addEventListener('click', () => {
                if (quantity > 1) {
                    quantity--;
                    qtyValue.textContent = quantity;
                }
            });
        }

        if (qtyPlus) {
            qtyPlus.addEventListener('click', () => {
                if (quantity < 10) {
                    quantity++;
                    qtyValue.textContent = quantity;
                }
            });
        }

        // Add to cart
        if (modalAddCart && product.available) {
            modalAddCart.addEventListener('click', () => {
                this.addToCart(product.id, quantity);
                this.closeModal();
            });
        }
    }

    /**
     * Close modal
     */
    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }

    /**
     * Add product to cart
     */
    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product || !product.available) return;

        // Here you would normally add to cart logic
        Utils.showNotification(`${product.name} agregado al carrito`, 'success');
        
        // Animate add to cart button
        const cardBtn = document.querySelector(`[data-product-id="${productId}"] .add-to-cart-btn`);
        if (cardBtn) {
            cardBtn.innerHTML = '<i class="fas fa-check"></i> Agregado';
            cardBtn.classList.add('added');
            
            setTimeout(() => {
                cardBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Agregar';
                cardBtn.classList.remove('added');
            }, 2000);
        }
    }

    /**
     * Initialize category cards
     */
    initCategoryCards() {
        const categoryCards = document.querySelectorAll('.category-card');
        
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                if (category) {
                    // Update filter
                    this.currentFilter = category;
                    
                    // Update filter buttons
                    document.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.toggle('active', btn.dataset.category === category);
                    });
                    
                    // Apply filter
                    this.applyFilters();
                    
                    // Scroll to products
                    const productsSection = document.querySelector('.products-section');
                    if (productsSection) {
                        Utils.scrollToElement(productsSection, 20);
                    }
                }
            });
        });
    }

    /**
     * Show/hide loading state
     */
    showLoading(show) {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.display = show ? 'flex' : 'none';
        }
        this.isLoading = show;
    }

    /**
     * Get category display name
     */
    getCategoryName(category) {
        const categories = {
            'pan': 'Panes',
            'pasteles': 'Pasteles',
            'galletas': 'Galletas',
            'especiales': 'Especiales'
        };
        return categories[category] || category;
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