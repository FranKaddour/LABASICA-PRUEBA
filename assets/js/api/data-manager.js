/**
 * DataManager - API centralizada para gestión de datos
 * Maneja operaciones CRUD para productos y categorías
 */

class DataManager {
    constructor() {
        this.listeners = [];
        this.cache = {
            products: null,
            categories: null
        };

        // Inicializar datos por defecto si no existen
        this.init();
    }

    async init() {
        // Cargar datos iniciales
        await this.loadInitialData();

        // Escuchar cambios de storage
        window.addEventListener('dataUpdated', (event) => {
            const { fileName } = event.detail;
            if (fileName === 'products.json') {
                this.cache.products = null; // Invalidar cache
            } else if (fileName === 'categories.json') {
                this.cache.categories = null; // Invalidar cache
            }
            this.notifyListeners('dataChanged', { fileName });
        });
    }

    async loadInitialData() {
        try {
            // Si no existen datos, crear estructura inicial
            const products = await this.getProducts();
            const categories = await this.getCategories();

            if (!products || !products.products) {
                await this.initializeDefaultProducts();
            }

            if (!categories || !categories.categories) {
                await this.initializeDefaultCategories();
            }

        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        }
    }

    // ==================== PRODUCTOS ====================

    /**
     * Obtiene todos los productos
     */
    async getProducts() {
        if (this.cache.products) {
            return this.cache.products;
        }

        const data = await window.storageUtils.loadData('products.json');
        this.cache.products = data;
        return data;
    }

    /**
     * Obtiene un producto por ID
     */
    async getProductById(id) {
        const data = await this.getProducts();
        return data?.products?.find(product => product.id === parseInt(id));
    }

    /**
     * Obtiene productos por categoría
     */
    async getProductsByCategory(categoryId) {
        const data = await this.getProducts();
        return data?.products?.filter(product => product.categoryId === parseInt(categoryId)) || [];
    }

    /**
     * Agrega un nuevo producto
     */
    async addProduct(productData) {
        try {
            const data = await this.getProducts();

            const newProduct = {
                id: data.metadata.nextId,
                ...productData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            data.products.push(newProduct);
            data.metadata.totalProducts = data.products.length;
            data.metadata.nextId++;
            data.metadata.lastUpdated = new Date().toISOString();

            const success = await window.storageUtils.saveData('products.json', data);

            if (success) {
                this.cache.products = data;
                this.notifyListeners('productAdded', newProduct);
                return { success: true, product: newProduct };
            }

            return { success: false, error: 'Error guardando producto' };
        } catch (error) {
            console.error('Error agregando producto:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Actualiza un producto existente
     */
    async updateProduct(id, updateData) {
        try {
            const data = await this.getProducts();
            const productIndex = data.products.findIndex(p => p.id === parseInt(id));

            if (productIndex === -1) {
                return { success: false, error: 'Producto no encontrado' };
            }

            data.products[productIndex] = {
                ...data.products[productIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            data.metadata.lastUpdated = new Date().toISOString();

            const success = await window.storageUtils.saveData('products.json', data);

            if (success) {
                this.cache.products = data;
                this.notifyListeners('productUpdated', data.products[productIndex]);
                return { success: true, product: data.products[productIndex] };
            }

            return { success: false, error: 'Error actualizando producto' };
        } catch (error) {
            console.error('Error actualizando producto:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Elimina un producto
     */
    async deleteProduct(id) {
        try {
            const data = await this.getProducts();
            const productIndex = data.products.findIndex(p => p.id === parseInt(id));

            if (productIndex === -1) {
                return { success: false, error: 'Producto no encontrado' };
            }

            const deletedProduct = data.products[productIndex];
            data.products.splice(productIndex, 1);
            data.metadata.totalProducts = data.products.length;
            data.metadata.lastUpdated = new Date().toISOString();

            const success = await window.storageUtils.saveData('products.json', data);

            if (success) {
                this.cache.products = data;
                this.notifyListeners('productDeleted', deletedProduct);
                return { success: true, product: deletedProduct };
            }

            return { success: false, error: 'Error eliminando producto' };
        } catch (error) {
            console.error('Error eliminando producto:', error);
            return { success: false, error: error.message };
        }
    }

    // ==================== CATEGORÍAS ====================

    /**
     * Obtiene todas las categorías
     */
    async getCategories() {
        if (this.cache.categories) {
            return this.cache.categories;
        }

        const data = await window.storageUtils.loadData('categories.json');
        this.cache.categories = data;
        return data;
    }

    /**
     * Obtiene una categoría por ID
     */
    async getCategoryById(id) {
        const data = await this.getCategories();
        return data?.categories?.find(category => category.id === parseInt(id));
    }

    /**
     * Agrega una nueva categoría
     */
    async addCategory(categoryData) {
        try {
            const data = await this.getCategories();

            const newCategory = {
                id: data.metadata.nextId,
                ...categoryData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            data.categories.push(newCategory);
            data.metadata.totalCategories = data.categories.length;
            data.metadata.nextId++;
            data.metadata.lastUpdated = new Date().toISOString();

            const success = await window.storageUtils.saveData('categories.json', data);

            if (success) {
                this.cache.categories = data;
                this.notifyListeners('categoryAdded', newCategory);
                return { success: true, category: newCategory };
            }

            return { success: false, error: 'Error guardando categoría' };
        } catch (error) {
            console.error('Error agregando categoría:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Actualiza una categoría existente
     */
    async updateCategory(id, updateData) {
        try {
            const data = await this.getCategories();
            const categoryIndex = data.categories.findIndex(c => c.id === parseInt(id));

            if (categoryIndex === -1) {
                return { success: false, error: 'Categoría no encontrada' };
            }

            data.categories[categoryIndex] = {
                ...data.categories[categoryIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            data.metadata.lastUpdated = new Date().toISOString();

            const success = await window.storageUtils.saveData('categories.json', data);

            if (success) {
                this.cache.categories = data;
                this.notifyListeners('categoryUpdated', data.categories[categoryIndex]);
                return { success: true, category: data.categories[categoryIndex] };
            }

            return { success: false, error: 'Error actualizando categoría' };
        } catch (error) {
            console.error('Error actualizando categoría:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Elimina una categoría
     */
    async deleteCategory(id) {
        try {
            const data = await this.getCategories();
            const categoryIndex = data.categories.findIndex(c => c.id === parseInt(id));

            if (categoryIndex === -1) {
                return { success: false, error: 'Categoría no encontrada' };
            }

            // Verificar si hay productos usando esta categoría
            const products = await this.getProducts();
            const productsUsingCategory = products.products.filter(p => p.categoryId === parseInt(id));

            if (productsUsingCategory.length > 0) {
                return {
                    success: false,
                    error: `No se puede eliminar. Hay ${productsUsingCategory.length} productos usando esta categoría`
                };
            }

            const deletedCategory = data.categories[categoryIndex];
            data.categories.splice(categoryIndex, 1);
            data.metadata.totalCategories = data.categories.length;
            data.metadata.lastUpdated = new Date().toISOString();

            const success = await window.storageUtils.saveData('categories.json', data);

            if (success) {
                this.cache.categories = data;
                this.notifyListeners('categoryDeleted', deletedCategory);
                return { success: true, category: deletedCategory };
            }

            return { success: false, error: 'Error eliminando categoría' };
        } catch (error) {
            console.error('Error eliminando categoría:', error);
            return { success: false, error: error.message };
        }
    }

    // ==================== DATOS INICIALES ====================

    async initializeDefaultProducts() {
        const defaultProducts = {
            products: [],
            metadata: {
                lastUpdated: new Date().toISOString(),
                totalProducts: 0,
                nextId: 1,
                totalCategories: 0,
                averageRating: 0,
                totalReviews: 0
            }
        };

        await window.storageUtils.saveData('products.json', defaultProducts);
        this.cache.products = defaultProducts;
    }

    async initializeDefaultCategories() {
        const defaultCategories = {
            categories: [],
            metadata: {
                lastUpdated: new Date().toISOString(),
                totalCategories: 0,
                nextId: 1
            }
        };

        await window.storageUtils.saveData('categories.json', defaultCategories);
        this.cache.categories = defaultCategories;
    }

    // ==================== UTILIDADES ====================

    /**
     * Registra un listener para cambios de datos
     */
    addListener(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }

    /**
     * Notifica a todos los listeners
     */
    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Error en listener:', error);
            }
        });
    }

    /**
     * Limpia toda la cache
     */
    clearCache() {
        this.cache = {
            products: null,
            categories: null
        };
    }

    /**
     * Obtiene estadísticas generales
     */
    async getStats() {
        const [productsData, categoriesData] = await Promise.all([
            this.getProducts(),
            this.getCategories()
        ]);

        return {
            totalProducts: productsData?.metadata?.totalProducts || 0,
            totalCategories: categoriesData?.metadata?.totalCategories || 0,
            lastUpdated: Math.max(
                new Date(productsData?.metadata?.lastUpdated || 0).getTime(),
                new Date(categoriesData?.metadata?.lastUpdated || 0).getTime()
            )
        };
    }
}

// Instancia global
window.DataManager = DataManager;
window.dataManager = new DataManager();