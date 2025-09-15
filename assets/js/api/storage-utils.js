/**
 * Storage Utilities - Sistema centralizado de almacenamiento
 * Maneja localStorage y operaciones con archivos JSON
 */

class StorageUtils {
    constructor() {
        this.storagePrefix = 'la_basica_';
        this.dataEndpoint = '/data/';
    }

    /**
     * Carga datos desde archivo JSON con fallback a localStorage
     */
    async loadData(fileName) {
        try {
            // Intentar cargar desde archivo JSON primero
            const response = await fetch(`${this.dataEndpoint}${fileName}`);
            if (response.ok) {
                const data = await response.json();

                // Guardar en localStorage como cache
                this.saveToLocalStorage(fileName, data);
                return data;
            }
        } catch (error) {
            console.log(`No se pudo cargar ${fileName} desde archivo, intentando localStorage`);
        }

        // Fallback a localStorage
        return this.loadFromLocalStorage(fileName);
    }

    /**
     * Guarda datos en localStorage
     */
    saveToLocalStorage(key, data) {
        try {
            const dataWithTimestamp = {
                ...data,
                _lastUpdated: new Date().toISOString()
            };

            localStorage.setItem(
                `${this.storagePrefix}${key}`,
                JSON.stringify(dataWithTimestamp)
            );

            return true;
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
            return false;
        }
    }

    /**
     * Carga datos desde localStorage
     */
    loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(`${this.storagePrefix}${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error cargando desde localStorage:', error);
            return null;
        }
    }

    /**
     * Elimina datos del localStorage
     */
    removeFromLocalStorage(key) {
        try {
            localStorage.removeItem(`${this.storagePrefix}${key}`);
            return true;
        } catch (error) {
            console.error('Error eliminando de localStorage:', error);
            return false;
        }
    }

    /**
     * Simula guardado de archivo JSON (en producción sería una API)
     */
    async saveData(fileName, data) {
        // En un entorno real, esto sería una llamada POST a tu API
        // Por ahora, guardamos en localStorage y simulamos éxito

        const success = this.saveToLocalStorage(fileName, data);

        if (success) {
            // Disparar evento para notificar cambios
            window.dispatchEvent(new CustomEvent('dataUpdated', {
                detail: { fileName, data }
            }));
        }

        return success;
    }

    /**
     * Obtiene todas las claves de localStorage del proyecto
     */
    getAllKeys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.storagePrefix)) {
                keys.push(key.replace(this.storagePrefix, ''));
            }
        }
        return keys;
    }

    /**
     * Limpia todos los datos del proyecto
     */
    clearAllData() {
        const keys = this.getAllKeys();
        keys.forEach(key => {
            this.removeFromLocalStorage(key);
        });

        window.dispatchEvent(new CustomEvent('dataCleared'));
        return true;
    }

    /**
     * Exporta todos los datos como un objeto
     */
    exportAllData() {
        const exportData = {};
        const keys = this.getAllKeys();

        keys.forEach(key => {
            const data = this.loadFromLocalStorage(key);
            if (data) {
                exportData[key] = data;
            }
        });

        return exportData;
    }

    /**
     * Importa datos desde un objeto
     */
    importAllData(importData) {
        try {
            Object.entries(importData).forEach(([key, data]) => {
                this.saveToLocalStorage(key, data);
            });

            window.dispatchEvent(new CustomEvent('dataImported'));
            return true;
        } catch (error) {
            console.error('Error importando datos:', error);
            return false;
        }
    }
}

// Instancia global
window.StorageUtils = StorageUtils;
window.storageUtils = new StorageUtils();