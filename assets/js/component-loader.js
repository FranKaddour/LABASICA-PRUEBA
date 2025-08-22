/* ==================== COMPONENT LOADER SYSTEM ==================== */

/**
 * Advanced Component Loader for LA BASICA
 * Handles dynamic loading and initialization of HTML components
 */
class ComponentLoaderSystem {
    constructor() {
        this.loadedComponents = new Map();
        this.componentQueue = [];
        this.isLoading = false;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        
        this.init();
    }

    /**
     * Initialize the component loader system
     */
    init() {
        // Auto-load components on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.autoLoadComponents());
        } else {
            this.autoLoadComponents();
        }
    }

    /**
     * Automatically load components based on page type
     */
    async autoLoadComponents() {
        const currentPage = Navigation.getCurrentPage();
        const components = this.getPageComponents(currentPage);
        
        if (components.length > 0) {
            await this.loadComponentsBatch(components);
        }
    }

    /**
     * Get components needed for specific page
     */
    getPageComponents(page) {
        const baseComponents = [
            { name: 'header', target: '#header-placeholder, .header-container' },
        ];

        // Page-specific component configurations
        const pageConfigs = {
            'home': [
                ...baseComponents,
                { name: 'newsletter', target: '#newsletter-placeholder, .newsletter-container' },
                { name: 'footer', target: '#footer-placeholder, .footer-container' },
                { name: 'nav-bottom', target: '#nav-bottom-placeholder, .nav-bottom-container' }
            ],
            'nosotros': [
                ...baseComponents,
                { name: 'newsletter', target: '#newsletter-placeholder, .newsletter-container' },
                { name: 'footer', target: '#footer-placeholder, .footer-container' },
                { name: 'nav-bottom', target: '#nav-bottom-placeholder, .nav-bottom-container' }
            ],
            'productos': [
                ...baseComponents,
                { name: 'newsletter', target: '#newsletter-placeholder, .newsletter-container' },
                { name: 'footer', target: '#footer-placeholder, .footer-container' },
                { name: 'nav-bottom', target: '#nav-bottom-placeholder, .nav-bottom-container' }
            ],
            'contacto': [
                ...baseComponents,
                { name: 'newsletter', target: '#newsletter-placeholder, .newsletter-container' },
                { name: 'footer', target: '#footer-placeholder, .footer-container' },
                { name: 'nav-bottom', target: '#nav-bottom-placeholder, .nav-bottom-container' }
            ],
            'perfil': [
                ...baseComponents,
                { name: 'footer', target: '#footer-placeholder, .footer-container' },
                { name: 'nav-bottom', target: '#nav-bottom-placeholder, .nav-bottom-container' }
            ]
        };

        return pageConfigs[page] || baseComponents;
    }

    /**
     * Load multiple components in batch
     */
    async loadComponentsBatch(components) {
        this.isLoading = true;
        const loadPromises = components.map(component => 
            this.loadComponent(component.name, component.target, component.options)
        );

        try {
            const results = await Promise.allSettled(loadPromises);
            
            // Log results
            results.forEach((result, index) => {
                const component = components[index];
                if (result.status === 'fulfilled') {
                    // Component loaded successfully
                } else {
                    console.error(`❌ Failed to load component: ${component.name}`, result.reason);
                }
            });

            // Initialize all components after loading
            await this.initializeComponents();
            
        } catch (error) {
            console.error('Batch component loading failed:', error);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Load a single component with retry logic
     */
    async loadComponent(componentName, targetSelector, options = {}, retryCount = 0) {
        const cacheKey = `${componentName}-${targetSelector}`;
        
        // Check if already loaded
        if (this.loadedComponents.has(cacheKey)) {
            if (AppConfig.debug) {
                // Component already loaded
            }
            return true;
        }

        try {
            // Find target elements
            const targets = document.querySelectorAll(targetSelector);
            if (targets.length === 0) {
                if (AppConfig.debug) {
                    // No targets found for component
                }
                return false;
            }

            // Load component HTML
            const html = await this.fetchComponentHTML(componentName);
            
            // Insert HTML into targets
            targets.forEach(target => {
                target.innerHTML = html;
                target.setAttribute('data-component', componentName);
                target.setAttribute('data-loaded', 'true');
            });

            // Mark as loaded
            this.loadedComponents.set(cacheKey, {
                name: componentName,
                targets: Array.from(targets),
                html: html,
                loadedAt: Date.now(),
                options: options
            });

            // Dispatch load event
            this.dispatchComponentEvent('componentLoaded', {
                componentName,
                targetSelector,
                targets: Array.from(targets),
                options
            });

            return true;

        } catch (error) {
            // Retry logic
            if (retryCount < this.retryAttempts) {
                // Retrying component load
                await this.delay(this.retryDelay * (retryCount + 1));
                return this.loadComponent(componentName, targetSelector, options, retryCount + 1);
            } else {
                console.error(`Failed to load component ${componentName} after ${this.retryAttempts} attempts:`, error);
                throw error;
            }
        }
    }

    /**
     * Fetch component HTML from file
     */
    async fetchComponentHTML(componentName) {
        const url = `/components/${componentName}.html`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            
            if (!html.trim()) {
                throw new Error('Component HTML is empty');
            }

            return html;

        } catch (error) {
            // Fallback: try with timestamp to bypass cache
            if (!url.includes('?')) {
                const fallbackUrl = `${url}?t=${Date.now()}`;
                const fallbackResponse = await fetch(fallbackUrl);
                
                if (fallbackResponse.ok) {
                    return await fallbackResponse.text();
                }
            }
            
            throw error;
        }
    }

    /**
     * Initialize all loaded components
     */
    async initializeComponents() {
        // Wait a bit for DOM to be ready
        await this.delay(100);

        // Dispatch initialization events
        this.loadedComponents.forEach((componentData, key) => {
            this.dispatchComponentEvent('componentReady', {
                componentName: componentData.name,
                targets: componentData.targets,
                options: componentData.options
            });
        });

        // Global initialization complete event
        this.dispatchComponentEvent('allComponentsReady', {
            loadedComponents: Array.from(this.loadedComponents.keys()),
            totalComponents: this.loadedComponents.size
        });

        if (AppConfig.debug) {
            // All components initialized
        }
    }

    /**
     * Reload a specific component
     */
    async reloadComponent(componentName, targetSelector) {
        const cacheKey = `${componentName}-${targetSelector}`;
        
        // Remove from cache
        this.loadedComponents.delete(cacheKey);
        
        // Clear existing content
        const targets = document.querySelectorAll(targetSelector);
        targets.forEach(target => {
            target.innerHTML = '';
            target.removeAttribute('data-component');
            target.removeAttribute('data-loaded');
        });

        // Reload
        return await this.loadComponent(componentName, targetSelector);
    }

    /**
     * Preload components for faster navigation
     */
    async preloadComponents(components) {
        const preloadPromises = components.map(async (component) => {
            try {
                const html = await this.fetchComponentHTML(component.name);
                // Store in memory cache
                this.loadedComponents.set(`preload-${component.name}`, {
                    name: component.name,
                    html: html,
                    preloaded: true,
                    loadedAt: Date.now()
                });
                return true;
            } catch (error) {
                // Failed to preload component
                return false;
            }
        });

        const results = await Promise.allSettled(preloadPromises);
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
        
        if (AppConfig.debug) {
            // Components preloaded
        }

        return results;
    }

    /**
     * Get component loading status
     */
    getComponentStatus(componentName = null) {
        if (componentName) {
            const matches = Array.from(this.loadedComponents.entries()).filter(
                ([key, data]) => data.name === componentName
            );
            return matches.map(([key, data]) => ({
                key,
                ...data,
                isLoaded: true
            }));
        }

        return {
            totalLoaded: this.loadedComponents.size,
            isLoading: this.isLoading,
            components: Object.fromEntries(this.loadedComponents)
        };
    }

    /**
     * Unload component
     */
    unloadComponent(componentName, targetSelector = null) {
        if (targetSelector) {
            const cacheKey = `${componentName}-${targetSelector}`;
            const componentData = this.loadedComponents.get(cacheKey);
            
            if (componentData) {
                // Clear DOM
                componentData.targets.forEach(target => {
                    target.innerHTML = '';
                    target.removeAttribute('data-component');
                    target.removeAttribute('data-loaded');
                });
                
                // Remove from cache
                this.loadedComponents.delete(cacheKey);
                
                this.dispatchComponentEvent('componentUnloaded', {
                    componentName,
                    targetSelector
                });
                
                return true;
            }
        } else {
            // Unload all instances of the component
            let unloadCount = 0;
            
            this.loadedComponents.forEach((data, key) => {
                if (data.name === componentName) {
                    data.targets.forEach(target => {
                        target.innerHTML = '';
                        target.removeAttribute('data-component');
                        target.removeAttribute('data-loaded');
                    });
                    
                    this.loadedComponents.delete(key);
                    unloadCount++;
                }
            });
            
            if (unloadCount > 0) {
                this.dispatchComponentEvent('componentUnloaded', {
                    componentName,
                    instanceCount: unloadCount
                });
            }
            
            return unloadCount > 0;
        }
        
        return false;
    }

    /**
     * Dispatch component events
     */
    dispatchComponentEvent(eventType, detail) {
        document.dispatchEvent(new CustomEvent(eventType, {
            detail: {
                ...detail,
                timestamp: Date.now(),
                loader: 'ComponentLoaderSystem'
            }
        }));
    }

    /**
     * Utility: delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clear all components
     */
    clearAllComponents() {
        this.loadedComponents.forEach((data, key) => {
            data.targets.forEach(target => {
                target.innerHTML = '';
                target.removeAttribute('data-component');
                target.removeAttribute('data-loaded');
            });
        });
        
        this.loadedComponents.clear();
        this.dispatchComponentEvent('allComponentsCleared', {});
        
        if (AppConfig.debug) {
            // All components cleared
        }
    }

    /**
     * Get component HTML from cache
     */
    getComponentHTML(componentName) {
        const entry = Array.from(this.loadedComponents.entries()).find(
            ([key, data]) => data.name === componentName
        );
        
        return entry ? entry[1].html : null;
    }
}

// Create global instance
const componentLoader = new ComponentLoaderSystem();

// Export for other scripts
window.ComponentLoaderSystem = ComponentLoaderSystem;
window.componentLoader = componentLoader;

// Listen for page navigation to reload components if needed
window.addEventListener('popstate', () => {
    componentLoader.autoLoadComponents();
});

// Provide utility functions for manual component loading
window.loadComponent = (name, target, options) => componentLoader.loadComponent(name, target, options);
window.reloadComponent = (name, target) => componentLoader.reloadComponent(name, target);
window.unloadComponent = (name, target) => componentLoader.unloadComponent(name, target);

if (AppConfig.debug) {
    // Debug utilities
    window.componentLoaderDebug = {
        getStatus: () => componentLoader.getComponentStatus(),
        clearAll: () => componentLoader.clearAllComponents(),
        preload: (components) => componentLoader.preloadComponents(components),
        reload: (name, target) => componentLoader.reloadComponent(name, target)
    };
    
    // Component Loader Debug utilities available
}