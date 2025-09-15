/**
 * Sync Manager - Sistema de sincronización en tiempo real
 * Mantiene la sincronización entre dashboard y frontend
 */

class SyncManager {
    constructor() {
        this.listeners = new Map();
        this.lastSync = null;
        this.syncInterval = null;
        this.isOnline = navigator.onLine;

        this.init();
    }

    init() {
        // Escuchar eventos de datos
        window.addEventListener('dataUpdated', (event) => {
            this.handleDataUpdate(event.detail);
        });

        // Escuchar eventos de conectividad
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncAll();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // Sincronización periódica (cada 30 segundos)
        this.startPeriodicSync();

        console.log('SyncManager inicializado');
    }

    handleDataUpdate(data) {
        const { fileName, data: updatedData } = data;

        // Notificar a listeners específicos
        if (this.listeners.has(fileName)) {
            const fileListeners = this.listeners.get(fileName);
            fileListeners.forEach(callback => {
                try {
                    callback('dataChanged', updatedData);
                } catch (error) {
                    console.error('Error en listener de sync:', error);
                }
            });
        }

        // Notificar a listeners globales
        if (this.listeners.has('*')) {
            const globalListeners = this.listeners.get('*');
            globalListeners.forEach(callback => {
                try {
                    callback('dataChanged', { fileName, data: updatedData });
                } catch (error) {
                    console.error('Error en listener global de sync:', error);
                }
            });
        }

        // Sincronizar con otras pestañas/ventanas
        this.broadcastToTabs({ type: 'dataUpdate', fileName, data: updatedData });

        this.lastSync = new Date().toISOString();
    }

    broadcastToTabs(message) {
        try {
            if (window.localStorage) {
                // Usar localStorage como canal de comunicación entre pestañas
                const broadcastChannel = 'la_basica_sync_' + Date.now();
                localStorage.setItem(broadcastChannel, JSON.stringify(message));

                // Limpiar después de un segundo
                setTimeout(() => {
                    localStorage.removeItem(broadcastChannel);
                }, 1000);
            }
        } catch (error) {
            console.error('Error broadcasting to tabs:', error);
        }
    }

    listenToTabBroadcasts() {
        if (window.addEventListener) {
            window.addEventListener('storage', (event) => {
                if (event.key && event.key.startsWith('la_basica_sync_')) {
                    try {
                        const message = JSON.parse(event.newValue);
                        this.handleTabBroadcast(message);
                    } catch (error) {
                        console.error('Error handling tab broadcast:', error);
                    }
                }
            });
        }
    }

    handleTabBroadcast(message) {
        if (message.type === 'dataUpdate') {
            // Recargar datos si estamos en la página de productos
            if (window.location.pathname.includes('productos.html')) {
                this.reloadProductsPage();
            }
        }
    }

    async reloadProductsPage() {
        try {
            // Recargar renderer de productos si existe
            if (window.productRenderer) {
                await window.productRenderer.reload();
            }

            // Recargar ProductosPage si existe
            if (window.productosPage && window.productosPage.productRenderer) {
                await window.productosPage.productRenderer.reload();
            }

            console.log('Productos sincronizados desde otra pestaña');
        } catch (error) {
            console.error('Error recargando productos:', error);
        }
    }

    startPeriodicSync() {
        // Verificar cambios cada 30 segundos
        this.syncInterval = setInterval(() => {
            if (this.isOnline) {
                this.checkForUpdates();
            }
        }, 30000);
    }

    async checkForUpdates() {
        try {
            // Verificar si hay actualizaciones en productos
            const currentProducts = await window.storageUtils.loadFromLocalStorage('products.json');
            const serverProducts = await fetch('/data/products.json').then(r => r.json());

            if (this.hasDataChanged(currentProducts, serverProducts)) {
                // Actualizar cache local
                await window.storageUtils.saveToLocalStorage('products.json', serverProducts);

                // Disparar evento de actualización
                window.dispatchEvent(new CustomEvent('dataUpdated', {
                    detail: { fileName: 'products.json', data: serverProducts }
                }));
            }

            // Verificar categorías
            const currentCategories = await window.storageUtils.loadFromLocalStorage('categories.json');
            const serverCategories = await fetch('/data/categories.json').then(r => r.json());

            if (this.hasDataChanged(currentCategories, serverCategories)) {
                // Actualizar cache local
                await window.storageUtils.saveToLocalStorage('categories.json', serverCategories);

                // Disparar evento de actualización
                window.dispatchEvent(new CustomEvent('dataUpdated', {
                    detail: { fileName: 'categories.json', data: serverCategories }
                }));
            }

        } catch (error) {
            // Error silencioso - normal si no hay conexión
            console.debug('Sync check failed (normal if offline):', error.message);
        }
    }

    hasDataChanged(localData, serverData) {
        if (!localData || !serverData) return true;

        const localTimestamp = localData.metadata?.lastUpdated || localData._lastUpdated;
        const serverTimestamp = serverData.metadata?.lastUpdated;

        if (!localTimestamp || !serverTimestamp) return true;

        return new Date(serverTimestamp) > new Date(localTimestamp);
    }

    async syncAll() {
        if (!this.isOnline) return;

        try {
            // Forzar sincronización completa
            await this.checkForUpdates();
            console.log('Sincronización completa realizada');
        } catch (error) {
            console.error('Error en sincronización completa:', error);
        }
    }

    // Registrar listener para cambios específicos
    addListener(fileName, callback) {
        if (!this.listeners.has(fileName)) {
            this.listeners.set(fileName, new Set());
        }

        this.listeners.get(fileName).add(callback);

        // Retornar función para desregistrar
        return () => {
            if (this.listeners.has(fileName)) {
                this.listeners.get(fileName).delete(callback);
            }
        };
    }

    // Listener para todos los cambios
    addGlobalListener(callback) {
        return this.addListener('*', callback);
    }

    // Forzar sincronización manual
    async forceSync() {
        await this.syncAll();

        // Notificar éxito
        if (window.dashboardUI) {
            window.dashboardUI.showToast('Datos sincronizados correctamente', 'success');
        }
    }

    // Obtener estado de sincronización
    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            lastSync: this.lastSync,
            hasListeners: this.listeners.size > 0
        };
    }

    // Cleanup
    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }

        this.listeners.clear();
    }
}

// Instancia global
window.SyncManager = SyncManager;
window.syncManager = new SyncManager();

// Inicializar listeners de broadcast
window.syncManager.listenToTabBroadcasts();