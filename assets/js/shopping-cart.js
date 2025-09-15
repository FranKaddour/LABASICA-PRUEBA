/* ==================== SHOPPING CART SYSTEM ==================== */

/**
 * Professional Shopping Cart System for LA BASICA
 * Handles cart functionality, localStorage persistence, and UI updates
 */
class ShoppingCartSystem {
    constructor() {
        this.cart = [];
        this.isOpen = false;
        this.storageKey = 'labasica_shopping_cart';
        this.taxRate = 0.21; // 21% IVA
        this.freeShippingThreshold = 2000;
        this.pointsRate = 0.01; // 1% cashback in points

        // DOM elements cache
        this.elements = {};
        
        this.init();
    }

    /**
     * Initialize the shopping cart system
     */
    init() {
        this.cacheElements();
        this.loadCartFromStorage();
        this.bindEvents();
        this.updateUI();
        
        if (AppConfig.debug) {
            // Shopping Cart initialized
        }
    }

    /**
     * Cache DOM elements for better performance
     */
    cacheElements() {
        this.elements = {
            // Cart triggers
            cartToggle: document.getElementById('cartToggle'),
            cartMobileBtn: document.querySelector('.cart-mobile-btn'),
            
            // Cart panel
            cartOverlay: document.getElementById('cartOverlay'),
            shoppingCart: document.getElementById('shoppingCart'),
            cartClose: document.getElementById('cartClose'),
            
            // Cart content
            cartEmpty: document.getElementById('cartEmpty'),
            cartItems: document.getElementById('cartItems'),
            cartItemsList: document.getElementById('cartItemsList'),
            cartFooter: document.getElementById('cartFooter'),
            
            // Cart summary
            cartSubtotal: document.getElementById('cartSubtotal'),
            cartShipping: document.getElementById('cartShipping'),
            cartTotal: document.getElementById('cartTotal'),
            
            // Cart actions
            clearCart: document.getElementById('clearCart'),
            proceedCheckout: document.getElementById('proceedCheckout'),
            
            // Cart badges
            cartBadge: document.getElementById('cartBadge'),
            mobileBadge: document.querySelector('.mobile-cart-badge')
        };
        
        // Log missing elements for debugging
        const missingElements = [];
        Object.entries(this.elements).forEach(([key, element]) => {
            if (!element) {
                missingElements.push(key);
            }
        });
        
        if (missingElements.length > 0) {
            // Cart elements missing
            // Components still loading
        } else {
            // All cart elements found
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Cart toggle events
        if (this.elements.cartToggle) {
            this.elements.cartToggle.addEventListener('click', () => this.openCart());
        }
        
        if (this.elements.cartMobileBtn) {
            this.elements.cartMobileBtn.addEventListener('click', () => this.openCart());
        }

        // Close cart events
        if (this.elements.cartClose) {
            this.elements.cartClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Cart close button pressed
                this.closeCart();
            });
            this.elements.cartClose._cartEventBound = true;
        } else {
            // Cart close button not found
        }
        
        if (this.elements.cartOverlay) {
            this.elements.cartOverlay.addEventListener('click', (e) => {
                if (e.target === this.elements.cartOverlay) {
                    this.closeCart();
                }
            });
        }

        if (this.elements.shoppingCart) {
            this.elements.shoppingCart.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Cart action events
        if (this.elements.clearCart) {
            this.elements.clearCart.addEventListener('click', () => this.clearCart());
        }
        
        if (this.elements.proceedCheckout) {
            this.elements.proceedCheckout.addEventListener('click', () => this.proceedToCheckout());
        }

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeCart();
            }
        });

        // Listen for product add events
        document.addEventListener('addToCart', (e) => {
            this.addItem(e.detail);
        });

        // Listen for mobile nav close to also close cart
        document.addEventListener('mobileNavClosed', () => {
            if (this.isOpen) {
                this.closeCart();
            }
        });
    }

    /**
     * Open shopping cart
     */
    openCart() {
        if (this.isOpen) return;
        
        // Re-cache elements if missing
        if (!this.elements.cartOverlay || !this.elements.shoppingCart || !this.elements.cartClose) {
            // Recaching cart elements
            this.cacheElements();
            
            // Re-bind events if cartClose was missing
            if (this.elements.cartClose && !this.elements.cartClose._cartEventBound) {
                this.elements.cartClose.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Cart close button pressed (rebind)
                    this.closeCart();
                });
                this.elements.cartClose._cartEventBound = true;
            }
        }
        
        // Check if elements are still missing
        if (!this.elements.cartOverlay || !this.elements.shoppingCart) {
            console.error('🛒 No se pueden encontrar los elementos del carrito. Verifica que el header se haya cargado.');
            // Retry after components load
            setTimeout(() => {
                this.reCache();
                if (this.elements.shoppingCart) {
                    this.openCart();
                }
            }, 1000);
            return;
        }
        
        this.isOpen = true;
        
        // Add active classes
        this.elements.cartOverlay.classList.add('active');
        this.elements.cartOverlay.setAttribute('aria-hidden', 'false');
        
        this.elements.shoppingCart.classList.add('active');
        this.elements.shoppingCart.setAttribute('aria-hidden', 'false');

        // Focus management
        if (this.elements.cartClose) {
            setTimeout(() => this.elements.cartClose.focus(), 100);
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Dispatch event
        document.dispatchEvent(new CustomEvent('cartOpened', {
            detail: { cartItems: this.cart.length }
        }));

        // Cart opened successfully
    }

    /**
     * Close shopping cart
     */
    closeCart() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        
        // Remove active classes
        if (this.elements.cartOverlay) {
            this.elements.cartOverlay.classList.remove('active');
            this.elements.cartOverlay.setAttribute('aria-hidden', 'true');
        }
        
        if (this.elements.shoppingCart) {
            this.elements.shoppingCart.classList.remove('active');
            this.elements.shoppingCart.setAttribute('aria-hidden', 'true');
        }

        // Restore body scroll
        document.body.style.overflow = '';

        // Focus management - return focus to cart button
        if (this.elements.cartToggle) {
            this.elements.cartToggle.focus();
        }

        // Dispatch event
        document.dispatchEvent(new CustomEvent('cartClosed'));

        if (AppConfig.debug) {
            // Cart closed
        }
    }

    /**
     * Add item to cart
     */
    addItem(product) {
        if (!product || !product.id) {
            console.error('Invalid product data');
            return false;
        }

        // Check if item already exists
        const existingItemIndex = this.cart.findIndex(item => item.id === product.id);
        
        if (existingItemIndex > -1) {
            // Update quantity
            this.cart[existingItemIndex].quantity += (product.quantity || 1);
        } else {
            // Add new item
            const cartItem = {
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                image: product.image,
                quantity: product.quantity || 1,
                addedAt: Date.now()
            };
            
            this.cart.push(cartItem);
        }

        this.saveCartToStorage();
        this.updateUI();
        this.showAddedToCartMessage(product);

        // Dispatch event
        document.dispatchEvent(new CustomEvent('itemAddedToCart', {
            detail: { product, cartTotal: this.cart.length }
        }));

        if (AppConfig.debug) {
            // Item added to cart
        }

        return true;
    }

    /**
     * Remove item from cart
     */
    removeItem(productId) {
        const initialLength = this.cart.length;
        this.cart = this.cart.filter(item => item.id !== productId);
        
        if (this.cart.length !== initialLength) {
            this.saveCartToStorage();
            this.updateUI();
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('itemRemovedFromCart', {
                detail: { productId, cartTotal: this.cart.length }
            }));

            if (AppConfig.debug) {
                // Item removed from cart
            }
            
            return true;
        }
        
        return false;
    }

    /**
     * Update item quantity
     */
    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        
        if (!item) return false;
        
        if (newQuantity <= 0) {
            return this.removeItem(productId);
        }
        
        item.quantity = parseInt(newQuantity);
        this.saveCartToStorage();
        this.updateUI();

        // Dispatch event
        document.dispatchEvent(new CustomEvent('cartQuantityUpdated', {
            detail: { productId, newQuantity, cartTotal: this.cart.length }
        }));

        return true;
    }

    /**
     * Clear entire cart
     */
    clearCart() {
        if (this.cart.length === 0) return;
        
        // Show confirmation
        if (!confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            return;
        }
        
        this.cart = [];
        this.saveCartToStorage();
        this.updateUI();

        // Dispatch event
        document.dispatchEvent(new CustomEvent('cartCleared'));

        // Show feedback
        this.showToast('Carrito vaciado', 'success');

        if (AppConfig.debug) {
            // Cart cleared
        }
    }

    /**
     * Get cart totals
     */
    getCartTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal >= this.freeShippingThreshold ? 0 : 250;
        const total = subtotal + shipping;
        const points = Math.floor(total * this.pointsRate * 100);
        
        return {
            itemCount: this.cart.reduce((sum, item) => sum + item.quantity, 0),
            subtotal,
            shipping,
            total,
            points,
            freeShipping: subtotal >= this.freeShippingThreshold
        };
    }

    /**
     * Update cart UI
     */
    updateUI() {
        const totals = this.getCartTotals();
        
        // Update badges
        this.updateBadges(totals.itemCount);
        
        // Update cart content
        this.updateCartContent();
        
        // Update cart summary
        this.updateCartSummary(totals);
        
        // Show/hide cart sections
        const isEmpty = this.cart.length === 0;
        
        if (this.elements.cartEmpty) {
            this.elements.cartEmpty.style.display = isEmpty ? 'flex' : 'none';
        }
        
        if (this.elements.cartItems) {
            this.elements.cartItems.style.display = isEmpty ? 'none' : 'block';
        }
        
        if (this.elements.cartFooter) {
            this.elements.cartFooter.style.display = isEmpty ? 'none' : 'block';
        }
    }

    /**
     * Update cart badges
     */
    updateBadges(itemCount) {
        const badges = [this.elements.cartBadge, this.elements.mobileBadge];
        
        badges.forEach(badge => {
            if (badge) {
                badge.textContent = itemCount;
                badge.classList.toggle('visible', itemCount > 0);
            }
        });
    }

    /**
     * Update cart content (items list)
     */
    updateCartContent() {
        if (!this.elements.cartItemsList) return;
        
        if (this.cart.length === 0) {
            this.elements.cartItemsList.innerHTML = '';
            return;
        }

        const cartHTML = this.cart.map(item => this.createCartItemHTML(item)).join('');
        this.elements.cartItemsList.innerHTML = cartHTML;
        
        // Bind item events
        this.bindCartItemEvents();
    }

    /**
     * Create cart item HTML
     */
    createCartItemHTML(item) {
        const itemTotal = item.price * item.quantity;
        
        return `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toLocaleString()}</div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn quantity-decrease" data-product-id="${item.id}" aria-label="Disminuir cantidad">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" data-product-id="${item.id}" aria-label="Cantidad">
                            <button class="quantity-btn quantity-increase" data-product-id="${item.id}" aria-label="Aumentar cantidad">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <button class="remove-item-btn" data-product-id="${item.id}" aria-label="Eliminar producto">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Bind cart item events
     */
    bindCartItemEvents() {
        // Quantity controls
        document.querySelectorAll('.quantity-decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.productId;
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity - 1);
                }
            });
        });

        document.querySelectorAll('.quantity-increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.productId;
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity + 1);
                }
            });
        });

        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const productId = e.currentTarget.dataset.productId;
                const newQuantity = parseInt(e.currentTarget.value);
                this.updateQuantity(productId, newQuantity);
            });
        });

        // Remove item buttons
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.productId;
                this.removeItem(productId);
            });
        });
    }

    /**
     * Update cart summary
     */
    updateCartSummary(totals) {
        if (this.elements.cartSubtotal) {
            this.elements.cartSubtotal.textContent = `$${totals.subtotal.toLocaleString()}`;
        }
        
        if (this.elements.cartShipping) {
            this.elements.cartShipping.textContent = totals.freeShipping ? 'Gratis' : `$${totals.shipping.toLocaleString()}`;
        }
        
        if (this.elements.cartTotal) {
            this.elements.cartTotal.textContent = `$${totals.total.toLocaleString()}`;
        }
    }

    /**
     * Proceed to checkout
     */
    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showToast('El carrito está vacío', 'error');
            return;
        }

        // Prepare checkout data
        const checkoutData = {
            items: this.cart,
            totals: this.getCartTotals(),
            timestamp: Date.now()
        };

        // Store checkout data
        localStorage.setItem('labasica_checkout_data', JSON.stringify(checkoutData));

        // Dispatch event
        document.dispatchEvent(new CustomEvent('checkoutInitiated', {
            detail: checkoutData
        }));

        // Redirect to checkout (placeholder for now)
        this.showToast('Funcionalidad de checkout próximamente', 'info');
        
        if (AppConfig.debug) {
            // Proceeding to checkout
        }
    }

    /**
     * Save cart to localStorage
     */
    saveCartToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
        } catch (error) {
            console.error('Failed to save cart to localStorage:', error);
        }
    }

    /**
     * Load cart from localStorage
     */
    loadCartFromStorage() {
        try {
            const savedCart = localStorage.getItem(this.storageKey);
            if (savedCart) {
                this.cart = JSON.parse(savedCart);
                
                // Validate cart items
                this.cart = this.cart.filter(item => 
                    item.id && item.name && item.price && item.quantity > 0
                );
                
                if (AppConfig.debug) {
                    // Cart loaded from storage
                }
            }
        } catch (error) {
            console.error('Failed to load cart from localStorage:', error);
            this.cart = [];
        }
    }

    /**
     * Show added to cart message
     */
    showAddedToCartMessage(product) {
        this.showToast(`${product.name} agregado al carrito`, 'success');
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to container
        const container = document.getElementById('toastContainer') || document.body;
        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Get toast icon based on type
     */
    getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Get cart data (for external use)
     */
    getCart() {
        return {
            items: [...this.cart],
            totals: this.getCartTotals(),
            isOpen: this.isOpen
        };
    }

    /**
     * Debug function to check cart elements
     */
    debugCartElements() {
        // Debug cart elements (silent)
        const manualCartClose = document.getElementById('cartClose');
        
        return {
            elements: this.elements,
            manualCartClose
        };
    }

    /**
     * Import cart data (for external use)
     */
    importCart(cartData) {
        if (Array.isArray(cartData)) {
            this.cart = cartData;
            this.saveCartToStorage();
            this.updateUI();
            return true;
        }
        return false;
    }
}

// Initialize cart system when DOM is ready
let shoppingCart;

function initializeCart() {
    // Evitar múltiples inicializaciones
    if (window.shoppingCart) {
        // Cart already initialized
        return;
    }
    
    // Wait for components to be loaded
    setTimeout(() => {
        try {
            shoppingCart = new ShoppingCartSystem();
            
            // Make available globally
            window.shoppingCart = shoppingCart;
            
            // Utility functions
            window.addToCart = (product) => shoppingCart.addItem(product);
            window.removeFromCart = (productId) => shoppingCart.removeItem(productId);
            window.updateCartQuantity = (productId, quantity) => shoppingCart.updateQuantity(productId, quantity);
            window.clearCart = () => shoppingCart.clearCart();
            window.openCart = () => shoppingCart.openCart();
            window.closeCart = () => shoppingCart.closeCart();
            window.debugCart = () => shoppingCart.debugCartElements();
            
            // Cart system initialized
        } catch (error) {
            console.error('Error al inicializar el carrito:', error);
        }
    }, 500);
}

// Multiple initialization attempts for robustness
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCart);
} else {
    initializeCart();
}

// Also listen for components ready
document.addEventListener('allComponentsReady', () => {
    if (!window.shoppingCart) {
        // Retrying cart initialization
        initializeCart();
    }
});

// Backup initialization after a delay
setTimeout(() => {
    if (!window.shoppingCart) {
        // Emergency cart initialization
        initializeCart();
    }
}, 2000);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShoppingCartSystem;
}