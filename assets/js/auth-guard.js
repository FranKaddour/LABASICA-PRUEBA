/**
 * AuthGuard - Sistema de Protección de Rutas
 * Controla el acceso a páginas que requieren autenticación
 */

class AuthGuard {
    constructor() {
        this.protectedPages = [
            '/pages/perfil.html',
            'perfil.html',
            '/perfil'
        ];

        this.init();
    }

    /**
     * Inicializa el AuthGuard
     */
    init() {
        // Esperar a que AuthManager esté listo
        this.waitForAuthManager().then(() => {
            this.checkCurrentPage();
            this.setupNavigationGuards();
        });
    }

    /**
     * Espera a que AuthManager esté disponible
     */
    async waitForAuthManager() {
        return new Promise((resolve) => {
            const checkAuth = () => {
                if (window.authManager && window.authManager.isInitialized) {
                    resolve();
                } else {
                    setTimeout(checkAuth, 100);
                }
            };
            checkAuth();
        });
    }

    /**
     * Verifica si la página actual requiere autenticación
     */
    checkCurrentPage() {
        const currentPath = window.location.pathname;
        const requiresAuth = this.isProtectedRoute(currentPath);

        if (requiresAuth) {
            this.guardRoute();
        }
    }

    /**
     * Verifica si una ruta está protegida
     */
    isProtectedRoute(path) {
        return this.protectedPages.some(protectedPage =>
            path.includes(protectedPage) || path.endsWith(protectedPage)
        );
    }

    /**
     * Protege la ruta actual
     */
    guardRoute() {
        const isAuthenticated = window.authManager?.checkAuth();

        if (!isAuthenticated) {
            this.blockAccess();
        } else {
            this.allowAccess();
        }
    }

    /**
     * Bloquea el acceso y muestra modal de login
     */
    blockAccess() {
        // Mostrar modal de autenticación
        this.showAuthRequiredModal();

        // Escuchar eventos de autenticación
        const removeListener = window.authManager?.addAuthListener((event, data) => {
            if (event === 'login') {
                this.allowAccess();
                removeListener?.();
            }
        });

        console.log('Access blocked - Authentication required');
    }

    /**
     * Permite el acceso a la página
     */
    allowAccess() {
        // Ocultar modal si está visible
        window.authManager?.hideAuthModal();

        // Mostrar contenido de la página
        this.showPageContent();

        console.log('Access granted - User authenticated');
    }

    /**
     * Muestra modal de autenticación requerida
     */
    showAuthRequiredModal() {
        // Ocultar contenido principal temporalmente
        this.hidePageContent();

        // Mostrar modal de autenticación
        setTimeout(() => {
            window.authManager?.showAuthModal();
        }, 300);
    }

    /**
     * Oculta el contenido de la página
     */
    hidePageContent() {
        const mainContent = document.querySelector('main.main-content');
        if (mainContent) {
            mainContent.style.display = 'none';
        }

        // Mostrar loader temporal
        this.showTemporaryLoader();
    }

    /**
     * Muestra el contenido de la página
     */
    showPageContent() {
        const mainContent = document.querySelector('main.main-content');
        if (mainContent) {
            mainContent.style.display = 'block';
        }

        // Ocultar loader
        this.hideTemporaryLoader();
    }

    /**
     * Muestra loader temporal mientras se verifica autenticación
     */
    showTemporaryLoader() {
        // Si ya existe, no crear otro
        if (document.getElementById('authGuardLoader')) return;

        const loader = document.createElement('div');
        loader.id = 'authGuardLoader';
        loader.innerHTML = `
            <div class="auth-guard-loader">
                <div class="auth-guard-spinner"></div>
                <p>Verificando acceso...</p>
            </div>
        `;

        // Estilos inline para el loader
        const styles = `
            <style>
                .auth-guard-loader {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    z-index: 9998;
                }

                .auth-guard-spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(210, 105, 30, 0.2);
                    border-top: 4px solid var(--accent-orange, #D2691E);
                    border-radius: 50%;
                    animation: authGuardSpin 1s linear infinite;
                    margin: 0 auto 1rem;
                }

                @keyframes authGuardSpin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .auth-guard-loader p {
                    color: var(--text-dark, #333);
                    font-weight: 500;
                    margin: 0;
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
        document.body.appendChild(loader);
    }

    /**
     * Oculta loader temporal
     */
    hideTemporaryLoader() {
        const loader = document.getElementById('authGuardLoader');
        if (loader) {
            loader.remove();
        }
    }

    /**
     * Configura guardias de navegación para enlaces
     */
    setupNavigationGuards() {
        // Interceptar clicks en enlaces del perfil
        this.setupLinkGuards();

        // Interceptar navegación programática
        this.setupProgrammaticGuards();
    }

    /**
     * Configura guardias para enlaces
     */
    setupLinkGuards() {
        // Buscar todos los enlaces que apuntan a páginas protegidas
        const profileLinks = document.querySelectorAll('a[href*="perfil"]');

        profileLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                if (this.isProtectedRoute(href)) {
                    const isAuthenticated = window.authManager?.checkAuth();

                    if (!isAuthenticated) {
                        e.preventDefault();
                        this.handleUnauthenticatedAccess(href);
                    }
                }
            });
        });
    }

    /**
     * Configura guardias para navegación programática
     */
    setupProgrammaticGuards() {
        // Interceptar window.location cambios
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = (...args) => {
            this.checkNavigationAuth(args[2]);
            return originalPushState.apply(history, args);
        };

        history.replaceState = (...args) => {
            this.checkNavigationAuth(args[2]);
            return originalReplaceState.apply(history, args);
        };

        // Interceptar eventos popstate (botón atrás/adelante)
        window.addEventListener('popstate', () => {
            setTimeout(() => this.checkCurrentPage(), 0);
        });
    }

    /**
     * Verifica autenticación en navegación
     */
    checkNavigationAuth(url) {
        if (url && this.isProtectedRoute(url)) {
            const isAuthenticated = window.authManager?.checkAuth();

            if (!isAuthenticated) {
                // Prevenir navegación y mostrar modal
                setTimeout(() => {
                    this.handleUnauthenticatedAccess(url);
                }, 0);
            }
        }
    }

    /**
     * Maneja acceso no autenticado
     */
    handleUnauthenticatedAccess(targetUrl) {
        // Guardar URL objetivo para redirección después del login
        sessionStorage.setItem('auth_redirect_url', targetUrl);

        // Mostrar modal de autenticación
        window.authManager?.showAuthModal();

        // Configurar redirección después del login
        const removeListener = window.authManager?.addAuthListener((event, data) => {
            if (event === 'login') {
                const redirectUrl = sessionStorage.getItem('auth_redirect_url');
                if (redirectUrl) {
                    sessionStorage.removeItem('auth_redirect_url');
                    // Usar setTimeout para permitir que el modal se cierre primero
                    setTimeout(() => {
                        window.location.href = redirectUrl;
                    }, 500);
                }
                removeListener?.();
            }
        });

        console.log('Unauthenticated access attempt to:', targetUrl);
    }

    /**
     * Método público para verificar si se puede acceder a una ruta
     */
    static canAccessRoute(route) {
        const guard = window.authGuard;
        if (!guard) return true;

        const isProtected = guard.isProtectedRoute(route);
        if (!isProtected) return true;

        return window.authManager?.checkAuth() || false;
    }

    /**
     * Método público para requerir autenticación
     */
    static requireAuth(callback, redirectUrl = null) {
        const isAuthenticated = window.authManager?.checkAuth();

        if (isAuthenticated) {
            callback?.();
            return true;
        }

        // Guardar callback y URL de redirección
        if (redirectUrl) {
            sessionStorage.setItem('auth_redirect_url', redirectUrl);
        }

        // Mostrar modal
        window.authManager?.showAuthModal();

        // Configurar callback después del login
        if (callback) {
            const removeListener = window.authManager?.addAuthListener((event, data) => {
                if (event === 'login') {
                    callback();
                    removeListener?.();
                }
            });
        }

        return false;
    }

    /**
     * Añadir página protegida dinámicamente
     */
    addProtectedPage(page) {
        if (!this.protectedPages.includes(page)) {
            this.protectedPages.push(page);
        }
    }

    /**
     * Remover página protegida
     */
    removeProtectedPage(page) {
        this.protectedPages = this.protectedPages.filter(p => p !== page);
    }
}

// Exportar la clase
window.AuthGuard = AuthGuard;

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authGuard = new AuthGuard();
    });
} else {
    window.authGuard = new AuthGuard();
}