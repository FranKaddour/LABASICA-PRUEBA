/* ==================== SISTEMA DE SINCRONIZACIÓN DEL CARRITO ==================== */

/**
 * Sistema de Sincronización del Carrito
 * Mantiene sincronizado el carrito entre todas las páginas
 */
class CartSyncSystem {
    constructor() {
        this.storageKey = 'labasica_shopping_cart';
        this.lastUpdateKey = 'labasica_cart_last_update';
        this.syncInterval = 1000; // Verificar cada segundo
        this.lastKnownUpdate = 0;
        
        this.init();
    }

    /**
     * Inicializar sistema de sincronización
     */
    init() {
        // Verificar sincronización al cargar la página
        this.checkForUpdates();
        
        // Configurar listeners para cambios de storage
        this.setupStorageListener();
        
        // Configurar verificación periódica
        this.setupPeriodicSync();
        
        // Configurar listeners para eventos del carrito
        this.setupCartEventListeners();
        
        if (AppConfig.debug) {
            // Cart sync system initialized
        }
    }

    /**
     * Configurar listener para cambios en localStorage
     */
    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey || e.key === this.lastUpdateKey) {
                this.handleStorageChange(e);
            }
        });

        // También escuchar cambios en la misma pestaña
        document.addEventListener('cartUpdated', () => {
            this.updateTimestamp();
        });
    }

    /**
     * Configurar verificación periódica
     */
    setupPeriodicSync() {
        setInterval(() => {
            this.checkForUpdates();
        }, this.syncInterval);
    }

    /**
     * Configurar listeners para eventos del carrito
     */
    setupCartEventListeners() {
        // Escuchar eventos del carrito y actualizar timestamp
        const cartEvents = [
            'itemAddedToCart',
            'itemRemovedFromCart',
            'cartQuantityUpdated',
            'cartCleared'
        ];

        cartEvents.forEach(eventName => {
            document.addEventListener(eventName, () => {
                this.updateTimestamp();
                this.broadcastCartUpdate();
            });
        });
    }

    /**
     * Manejar cambios en el storage
     */
    handleStorageChange(event) {
        if (event.key === this.storageKey) {
            // El carrito cambió en otra pestaña
            this.syncCartFromStorage();
        } else if (event.key === this.lastUpdateKey) {
            // Timestamp cambió, verificar si necesitamos actualizar
            this.checkForUpdates();
        }
    }

    /**
     * Verificar si hay actualizaciones disponibles
     */
    checkForUpdates() {
        try {
            const lastUpdate = parseInt(localStorage.getItem(this.lastUpdateKey) || '0');
            
            if (lastUpdate > this.lastKnownUpdate) {
                this.lastKnownUpdate = lastUpdate;
                this.syncCartFromStorage();
            }
        } catch (error) {
            // Error checking cart updates
        }
    }

    /**
     * Sincronizar carrito desde localStorage
     */
    syncCartFromStorage() {
        if (!window.shoppingCart) {
            return; // Carrito no disponible aún
        }

        try {
            const savedCart = localStorage.getItem(this.storageKey);
            if (!savedCart) {
                return;
            }

            const cartData = JSON.parse(savedCart);
            
            // Verificar si es diferente al carrito actual
            const currentCart = window.shoppingCart.getCart();
            if (!this.cartsAreEqual(currentCart.items, cartData)) {
                // Actualizar carrito sin disparar eventos de storage
                this.updateCartSilently(cartData);
                
                if (AppConfig.debug) {
                    // Cart synced from storage
                }
            }
        } catch (error) {
            console.error('Error al sincronizar carrito desde storage:', error);
        }
    }

    /**
     * Actualizar carrito sin disparar eventos
     */
    updateCartSilently(cartData) {
        if (window.shoppingCart && typeof window.shoppingCart.importCart === 'function') {
            // Usar flag interno para suprimir eventos en lugar de modificar API nativa
            const originalSuppressEvents = window.shoppingCart.suppressEvents;
            window.shoppingCart.suppressEvents = true;
            
            // Importar datos del carrito
            window.shoppingCart.importCart(cartData);
            
            // Restaurar flag
            window.shoppingCart.suppressEvents = originalSuppressEvents || false;
            
            // Actualizar UI manualmente
            window.shoppingCart.updateUI();
        }
    }

    /**
     * Comparar si dos carritos son iguales
     */
    cartsAreEqual(cart1, cart2) {
        if (!cart1 || !cart2) return false;
        if (cart1.length !== cart2.length) return false;
        
        for (let i = 0; i < cart1.length; i++) {
            const item1 = cart1[i];
            const item2 = cart2[i];
            
            if (item1.id !== item2.id || 
                item1.quantity !== item2.quantity || 
                item1.price !== item2.price) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Actualizar timestamp de última modificación
     */
    updateTimestamp() {
        try {
            const now = Date.now();
            localStorage.setItem(this.lastUpdateKey, now.toString());
            this.lastKnownUpdate = now;
        } catch (error) {
            // Error updating cart timestamp
        }
    }

    /**
     * Transmitir actualización del carrito a otras pestañas
     */
    broadcastCartUpdate() {
        // Crear un evento personalizado para BroadcastChannel si está disponible
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                const channel = new BroadcastChannel('labasica_cart_sync');
                channel.postMessage({
                    type: 'cart_updated',
                    timestamp: Date.now(),
                    cart: window.shoppingCart ? window.shoppingCart.getCart() : null
                });
                channel.close();
            } catch (error) {
                // BroadcastChannel no soportado, usar localStorage como fallback
                this.updateTimestamp();
            }
        } else {
            // Fallback: usar localStorage
            this.updateTimestamp();
        }
    }

    /**
     * Forzar sincronización
     */
    forcSync() {
        this.checkForUpdates();
        
        if (window.shoppingCart) {
            window.shoppingCart.updateUI();
        }
        
        // Forced cart sync
    }

    /**
     * Obtener estado del sistema de sincronización
     */
    getStatus() {
        return {
            lastKnownUpdate: this.lastKnownUpdate,
            storageKey: this.storageKey,
            syncInterval: this.syncInterval,
            cartAvailable: !!window.shoppingCart,
            storageAvailable: typeof Storage !== 'undefined'
        };
    }

    /**
     * Limpiar datos de sincronización
     */
    cleanup() {
        try {
            localStorage.removeItem(this.lastUpdateKey);
            // Sync data cleaned
        } catch (error) {
            // Error cleaning sync data
        }
    }
}

// Inicializar sistema de sincronización cuando esté disponible
let cartSyncSystem;

function initializeCartSync() {
    if (!cartSyncSystem && typeof Storage !== 'undefined') {
        cartSyncSystem = new CartSyncSystem();
        
        // Hacer disponible globalmente
        window.cartSyncSystem = cartSyncSystem;
        
        // Función de utilidad
        window.syncCart = () => cartSyncSystem.forcSync();
    }
}

// Inicializar cuando DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCartSync);
} else {
    initializeCartSync();
}

// También inicializar cuando el carrito esté disponible
document.addEventListener('allComponentsReady', () => {
    if (!cartSyncSystem) {
        setTimeout(initializeCartSync, 100);
    }
});

// Configurar BroadcastChannel listener si está disponible
if (typeof BroadcastChannel !== 'undefined') {
    try {
        const channel = new BroadcastChannel('labasica_cart_sync');
        channel.addEventListener('message', (event) => {
            if (event.data.type === 'cart_updated' && cartSyncSystem) {
                // Pequeño delay para evitar conflictos
                setTimeout(() => {
                    cartSyncSystem.checkForUpdates();
                }, 50);
            }
        });
    } catch (error) {
        // BroadcastChannel no soportado
    }
}

// Limpiar al cerrar la página
window.addEventListener('beforeunload', () => {
    if (cartSyncSystem) {
        cartSyncSystem.updateTimestamp();
    }
});

// Exportar para sistemas de módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartSyncSystem;
}