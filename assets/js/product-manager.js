/* ==================== PRODUCT MANAGEMENT SYSTEM ==================== */

/**
 * Product Management System for LA BASICA
 * Handles product catalog, pricing, and cart integration
 */
class ProductManager {
    constructor() {
        this.products = new Map();
        this.categories = new Map();
        this.featured = [];
        this.storageKey = 'labasica_products_cache';
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        
        this.init();
    }

    /**
     * Initialize the product management system
     */
    init() {
        this.loadDefaultProducts();
        this.bindEvents();
        
        if (AppConfig.debug) {
            // Product manager initialized
        }
    }

    /**
     * Load default product catalog
     */
    loadDefaultProducts() {
        const defaultProducts = [
            // Panes
            {
                id: 'pan-artesanal-001',
                name: 'Pan Artesanal Tradicional',
                price: 450,
                category: 'panes',
                image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                description: 'Pan artesanal elaborado con masa madre y horneado en horno de leña',
                ingredients: ['Harina integral', 'Masa madre', 'Sal marina', 'Agua'],
                weight: '500g',
                featured: true,
                inStock: true,
                discount: 0
            },
            {
                id: 'pan-centeno-002',
                name: 'Pan de Centeno Integral',
                price: 520,
                category: 'panes',
                image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                description: 'Pan integral de centeno con semillas de girasol y sésamo',
                ingredients: ['Harina de centeno', 'Semillas', 'Masa madre', 'Sal'],
                weight: '600g',
                featured: false,
                inStock: true,
                discount: 0
            },
            {
                id: 'baguette-003',
                name: 'Baguette Francesa',
                price: 380,
                category: 'panes',
                image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                description: 'Baguette tradicional francesa con corteza crujiente',
                ingredients: ['Harina 000', 'Agua', 'Levadura', 'Sal'],
                weight: '250g',
                featured: true,
                inStock: true,
                discount: 0
            },

            // Facturas
            {
                id: 'croissant-004',
                name: 'Croissants (6 unidades)',
                price: 890,
                category: 'facturas',
                image: 'https://images.unsplash.com/photo-1555507036-ab794f4d8732?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                description: 'Croissants de manteca recién horneados',
                ingredients: ['Harina', 'Manteca', 'Huevos', 'Azúcar'],
                weight: '300g',
                featured: true,
                inStock: true,
                discount: 10
            },
            {
                id: 'medialunas-005',
                name: 'Medialunas Dulces (12 unidades)',
                price: 1200,
                category: 'facturas',
                image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                description: 'Medialunas dulces tradicionales argentinas',
                ingredients: ['Harina', 'Manteca', 'Azúcar', 'Huevos'],
                weight: '480g',
                featured: false,
                inStock: true,
                discount: 0
            },

            // Tortas y Tartas
            {
                id: 'tarta-frutas-006',
                name: 'Tarta de Frutas de Estación',
                price: 2500,
                category: 'tortas-tartas',
                image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                description: 'Tarta con frutas frescas de estación y crema pastelera',
                ingredients: ['Masa quebrada', 'Crema pastelera', 'Frutas frescas'],
                weight: '1kg',
                featured: true,
                inStock: true,
                discount: 0
            },
            {
                id: 'cheesecake-007',
                name: 'Cheesecake de Frutos Rojos',
                price: 2800,
                category: 'tortas-tartas',
                image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                description: 'Cheesecake cremoso con salsa de frutos rojos',
                ingredients: ['Queso crema', 'Galletas', 'Frutos rojos', 'Azúcar'],
                weight: '1.2kg',
                featured: true,
                inStock: true,
                discount: 0
            },

            // Galletas
            {
                id: 'galletas-mix-008',
                name: 'Mix de Galletas Artesanales (12 unidades)',
                price: 1800,
                category: 'galletas',
                image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                description: 'Variedad de galletas artesanales con chips de chocolate y avena',
                ingredients: ['Harina', 'Manteca', 'Chocolate', 'Avena'],
                weight: '600g',
                featured: false,
                inStock: true,
                discount: 15
            },
            {
                id: 'alfajores-009',
                name: 'Alfajores de Dulce de Leche (6 unidades)',
                price: 1500,
                category: 'galletas',
                image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                description: 'Alfajores tradicionales rellenos con dulce de leche casero',
                ingredients: ['Harina', 'Dulce de leche', 'Coco rallado', 'Manteca'],
                weight: '420g',
                featured: true,
                inStock: true,
                discount: 0
            },

            // Especialidades
            {
                id: 'empanadas-010',
                name: 'Empanadas Salteñas (12 unidades)',
                price: 3200,
                category: 'especialidades',
                image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                description: 'Empanadas salteñas tradicionales horneadas',
                ingredients: ['Masa casera', 'Carne', 'Cebolla', 'Especias'],
                weight: '1.2kg',
                featured: true,
                inStock: true,
                discount: 0
            }
        ];

        // Add products to the system
        defaultProducts.forEach(product => {
            this.addProduct(product);
        });

        // Setup categories
        this.setupCategories();
        
        // Setup featured products
        this.setupFeaturedProducts();
    }

    /**
     * Setup product categories
     */
    setupCategories() {
        const categoryData = [
            {
                id: 'panes',
                name: 'Panes Artesanales',
                description: 'Panes elaborados con masa madre y ingredientes naturales',
                icon: 'fas fa-bread-slice',
                color: '#8B4513'
            },
            {
                id: 'facturas',
                name: 'Facturas y Bollería',
                description: 'Croissants, medialunas y bollería fresca',
                icon: 'fas fa-cookie-bite',
                color: '#D2691E'
            },
            {
                id: 'tortas-tartas',
                name: 'Tortas y Tartas',
                description: 'Tortas caseras y tartas con frutas frescas',
                icon: 'fas fa-birthday-cake',
                color: '#CD853F'
            },
            {
                id: 'galletas',
                name: 'Galletas y Dulces',
                description: 'Galletas artesanales y alfajores caseros',
                icon: 'fas fa-cookie',
                color: '#DEB887'
            },
            {
                id: 'especialidades',
                name: 'Especialidades',
                description: 'Empanadas y productos especiales',
                icon: 'fas fa-star',
                color: '#F4A460'
            }
        ];

        categoryData.forEach(category => {
            this.categories.set(category.id, category);
        });
    }

    /**
     * Setup featured products
     */
    setupFeaturedProducts() {
        this.featured = Array.from(this.products.values())
            .filter(product => product.featured)
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Add a product to the catalog
     */
    addProduct(productData) {
        if (!productData.id || !productData.name || !productData.price) {
            console.error('Invalid product data:', productData);
            return false;
        }

        const product = {
            ...productData,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.products.set(product.id, product);
        return true;
    }

    /**
     * Get product by ID
     */
    getProduct(productId) {
        return this.products.get(productId) || null;
    }

    /**
     * Get products by category
     */
    getProductsByCategory(categoryId) {
        return Array.from(this.products.values())
            .filter(product => product.category === categoryId)
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Get featured products
     */
    getFeaturedProducts() {
        return [...this.featured];
    }

    /**
     * Get all products
     */
    getAllProducts() {
        return Array.from(this.products.values())
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Get all categories
     */
    getAllCategories() {
        return Array.from(this.categories.values())
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Search products
     */
    searchProducts(query) {
        if (!query || query.length < 2) {
            return [];
        }

        const searchTerm = query.toLowerCase();
        return Array.from(this.products.values())
            .filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.ingredients.some(ingredient => 
                    ingredient.toLowerCase().includes(searchTerm)
                )
            )
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Get product price with discount
     */
    getProductPrice(productId) {
        const product = this.getProduct(productId);
        if (!product) return null;

        const originalPrice = product.price;
        const discount = product.discount || 0;
        const finalPrice = originalPrice * (1 - discount / 100);

        return {
            original: originalPrice,
            final: finalPrice,
            discount: discount,
            savings: originalPrice - finalPrice
        };
    }

    /**
     * Create product card HTML
     */
    createProductCardHTML(product, options = {}) {
        const pricing = this.getProductPrice(product.id);
        const hasDiscount = pricing.discount > 0;
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                ${hasDiscount ? `<div class="product-badge">-${pricing.discount}%</div>` : ''}
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-details">
                        <span class="product-weight">${product.weight}</span>
                        ${!product.inStock ? '<span class="out-of-stock">Sin stock</span>' : ''}
                    </div>
                    <div class="product-pricing">
                        ${hasDiscount ? `<span class="original-price">$${pricing.original.toLocaleString()}</span>` : ''}
                        <span class="final-price">$${pricing.final.toLocaleString()}</span>
                    </div>
                    <button class="add-to-cart-btn" 
                            data-product-id="${product.id}" 
                            ${!product.inStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-bag"></i>
                        ${product.inStock ? 'Agregar al carrito' : 'Sin stock'}
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Bind events for product interactions
     */
    bindEvents() {
        // Listen for add to cart button clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
                e.preventDefault();
                
                const button = e.target.closest('.add-to-cart-btn');
                const productId = button.dataset.productId;
                
                if (productId && !button.disabled) {
                    this.addToCart(productId);
                }
            }
        });

        // Listen for product card clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.product-card') || e.target.closest('.product-card')) {
                const card = e.target.closest('.product-card');
                const productId = card.dataset.productId;
                
                if (productId && !e.target.closest('.add-to-cart-btn')) {
                    this.showProductDetails(productId);
                }
            }
        });
    }

    /**
     * Add product to cart
     */
    addToCart(productId, quantity = 1) {
        const product = this.getProduct(productId);
        if (!product) {
            console.error('Product not found:', productId);
            return false;
        }

        if (!product.inStock) {
            this.showToast('Producto sin stock', 'error');
            return false;
        }

        const pricing = this.getProductPrice(productId);
        const cartItem = {
            id: product.id,
            name: product.name,
            price: pricing.final,
            image: product.image,
            quantity: quantity
        };

        // Dispatch add to cart event
        try {
            document.dispatchEvent(new CustomEvent('addToCart', {
                detail: cartItem
            }));
        } catch (error) {
            // Failed to dispatch addToCart event
        }

        return true;
    }

    /**
     * Show product details modal
     */
    showProductDetails(productId) {
        const product = this.getProduct(productId);
        if (!product) return;

        // Create and show product detail modal
        const modal = this.createProductDetailModal(product);
        document.body.appendChild(modal);
        
        // Show modal
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    }

    /**
     * Create product detail modal
     */
    createProductDetailModal(product) {
        const pricing = this.getProductPrice(product.id);
        const hasDiscount = pricing.discount > 0;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay product-detail-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${product.name}</h3>
                    <button class="modal-close" aria-label="Cerrar modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="product-detail-content">
                        <div class="product-detail-image">
                            <img src="${product.image}" alt="${product.name}">
                            ${hasDiscount ? `<div class="product-badge">-${pricing.discount}%</div>` : ''}
                        </div>
                        <div class="product-detail-info">
                            <p class="product-description">${product.description}</p>
                            <div class="product-specifications">
                                <h4>Especificaciones</h4>
                                <ul>
                                    <li><strong>Peso:</strong> ${product.weight}</li>
                                    <li><strong>Categoría:</strong> ${this.categories.get(product.category)?.name || product.category}</li>
                                    <li><strong>Estado:</strong> ${product.inStock ? 'Disponible' : 'Sin stock'}</li>
                                </ul>
                            </div>
                            <div class="product-ingredients">
                                <h4>Ingredientes</h4>
                                <p>${product.ingredients.join(', ')}</p>
                            </div>
                            <div class="product-pricing">
                                ${hasDiscount ? `<span class="original-price">$${pricing.original.toLocaleString()}</span>` : ''}
                                <span class="final-price">$${pricing.final.toLocaleString()}</span>
                                ${hasDiscount ? `<span class="savings">Ahorrás $${pricing.savings.toLocaleString()}</span>` : ''}
                            </div>
                            <div class="product-actions">
                                <div class="quantity-selector">
                                    <button class="qty-btn qty-decrease">-</button>
                                    <input type="number" class="qty-input" value="1" min="1" max="10">
                                    <button class="qty-btn qty-increase">+</button>
                                </div>
                                <button class="add-to-cart-btn primary" data-product-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
                                    <i class="fas fa-shopping-bag"></i>
                                    ${product.inStock ? 'Agregar al carrito' : 'Sin stock'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Bind close events
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeProductModal(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeProductModal(modal);
            }
        });

        // Bind quantity controls
        const qtyInput = modal.querySelector('.qty-input');
        const decreaseBtn = modal.querySelector('.qty-decrease');
        const increaseBtn = modal.querySelector('.qty-increase');
        
        decreaseBtn.addEventListener('click', () => {
            const value = Math.max(1, parseInt(qtyInput.value) - 1);
            qtyInput.value = value;
        });
        
        increaseBtn.addEventListener('click', () => {
            const value = Math.min(10, parseInt(qtyInput.value) + 1);
            qtyInput.value = value;
        });

        // Bind add to cart
        modal.querySelector('.add-to-cart-btn').addEventListener('click', () => {
            const quantity = parseInt(qtyInput.value);
            if (this.addToCart(product.id, quantity)) {
                this.closeProductModal(modal);
            }
        });

        return modal;
    }

    /**
     * Close product detail modal
     */
    closeProductModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Delegate to cart system if available
        if (window.shoppingCart && typeof window.shoppingCart.showToast === 'function') {
            window.shoppingCart.showToast(message, type);
        } else {
            // Toast message displayed
        }
    }

    /**
     * Get product statistics
     */
    getStatistics() {
        const products = this.getAllProducts();
        const categories = this.getAllCategories();
        
        return {
            totalProducts: products.length,
            totalCategories: categories.length,
            featuredProducts: this.featured.length,
            inStockProducts: products.filter(p => p.inStock).length,
            productsWithDiscount: products.filter(p => p.discount > 0).length,
            averagePrice: products.reduce((sum, p) => sum + p.price, 0) / products.length,
            categoryBreakdown: categories.map(cat => ({
                category: cat.name,
                count: this.getProductsByCategory(cat.id).length
            }))
        };
    }
}

// Initialize product manager
let productManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProductManager);
} else {
    initializeProductManager();
}

function initializeProductManager() {
    productManager = new ProductManager();
    
    // Make available globally
    window.productManager = productManager;
    
    // Utility functions
    window.getProduct = (id) => productManager.getProduct(id);
    window.getProductsByCategory = (category) => productManager.getProductsByCategory(category);
    window.searchProducts = (query) => productManager.searchProducts(query);
    window.getFeaturedProducts = () => productManager.getFeaturedProducts();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductManager;
}