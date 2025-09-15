/**
 * AuthManager - Sistema de Autenticación con Google OAuth 2.0
 * Gestiona el estado de autenticación de manera centralizada
 */

class AuthManager {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.listeners = [];
        // REEMPLAZA 'TU_CLIENT_ID_AQUI' con tu Client ID real de Google
        this.googleClientId = 'TU_CLIENT_ID_AQUI.apps.googleusercontent.com';
        this.isInitialized = false;

        // Configuración
        this.config = {
            storageKey: 'la_basica_auth',
            redirectPages: ['/pages/perfil.html', 'perfil.html'],
            cookieExpiry: 7 // días
        };

        this.init();
    }

    /**
     * Inicializa el sistema de autenticación
     */
    async init() {
        try {
            // Restaurar estado de autenticación desde localStorage
            this.restoreAuthState();

            // Configurar Google Client ID (debes reemplazar esto)
            this.googleClientId = 'TU_GOOGLE_CLIENT_ID_AQUI'; // TODO: Configurar Google Client ID

            // Cargar Google Identity Services API si no está cargado
            await this.loadGoogleAPI();

            // Inicializar Google Sign-In
            this.initializeGoogleSignIn();

            this.isInitialized = true;
            this.notifyListeners('initialized', { isAuthenticated: this.isAuthenticated });

            console.log('AuthManager initialized successfully');
        } catch (error) {
            console.error('Error initializing AuthManager:', error);
            this.notifyListeners('error', { message: 'Error de inicialización' });
        }
    }

    /**
     * Carga la API de Google Identity Services
     */
    async loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            // Si ya está cargada, continuar
            if (window.google && window.google.accounts) {
                resolve();
                return;
            }

            // Si ya existe el script, esperar a que termine de cargar
            const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
            if (existingScript) {
                existingScript.onload = resolve;
                existingScript.onerror = reject;
                return;
            }

            // Crear y cargar el script
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load Google API'));

            document.head.appendChild(script);
        });
    }

    /**
     * Inicializa Google Sign-In
     */
    initializeGoogleSignIn() {
        if (!window.google || !this.googleClientId || this.googleClientId === 'TU_GOOGLE_CLIENT_ID_AQUI') {
            console.warn('Google API not loaded or Client ID not configured');
            return;
        }

        try {
            google.accounts.id.initialize({
                client_id: this.googleClientId,
                callback: this.handleGoogleResponse.bind(this),
                auto_select: false,
                cancel_on_tap_outside: true
            });
        } catch (error) {
            console.error('Error initializing Google Sign-In:', error);
        }
    }

    /**
     * Maneja la respuesta de Google OAuth
     */
    async handleGoogleResponse(response) {
        try {
            this.showLoading();

            // Decodificar el JWT token de Google
            const userInfo = this.decodeJWT(response.credential);

            // Crear objeto de usuario
            const user = {
                id: userInfo.sub,
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                givenName: userInfo.given_name,
                familyName: userInfo.family_name,
                emailVerified: userInfo.email_verified,
                locale: userInfo.locale,
                loginTime: new Date().toISOString()
            };

            // Actualizar estado
            this.user = user;
            this.isAuthenticated = true;

            // Guardar estado
            this.saveAuthState();

            // Notificar éxito
            this.notifyListeners('login', { user: this.user });

            // Ocultar modal
            this.hideAuthModal();

            // Mostrar toast de éxito
            this.showToast(`¡Bienvenido, ${user.givenName}!`, 'success');

            console.log('User authenticated successfully:', user.email);

            // Verificar si es empleado y redirigir al dashboard
            await this.checkEmployeeRedirect(user);

        } catch (error) {
            console.error('Error handling Google response:', error);
            this.showError('Error al procesar la respuesta de Google');
            this.notifyListeners('error', { message: error.message });
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Verifica si el usuario es empleado y redirige al dashboard
     */
    async checkEmployeeRedirect(user) {
        try {
            const response = await fetch('/data/employees.json');
            if (!response.ok) {
                console.log('Employee data not available, treating as regular user');
                return;
            }

            const employeeData = await response.json();
            const isEmployee = employeeData.authorizedEmployees.some(
                employee => employee.email.toLowerCase() === user.email.toLowerCase()
            );

            if (isEmployee) {
                console.log('Employee detected, redirecting to dashboard');
                // Pequeño delay para mostrar el toast antes de redirigir
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1500);
            }
        } catch (error) {
            console.error('Error checking employee status:', error);
            // Si hay error, continúa como usuario normal
        }
    }

    /**
     * Redirige al dashboard según la página actual
     */
    redirectToDashboard() {
        const currentPath = window.location.pathname;
        let dashboardPath = '/dashboard/index.html';

        // Si estamos en la página principal
        if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
            dashboardPath = 'dashboard/index.html';
        }

        window.location.href = dashboardPath;
    }

    /**
     * Decodifica un JWT token
     */
    decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            throw new Error('Invalid JWT token');
        }
    }

    /**
     * Inicia sesión con Google
     */
    async signInWithGoogle() {
        try {
            if (!window.google || !this.googleClientId || this.googleClientId === 'TU_GOOGLE_CLIENT_ID_AQUI') {
                this.showError('Servicio de autenticación no disponible');
                return;
            }

            this.showLoading();

            // Mostrar popup de Google Sign-In
            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // Fallback: mostrar botón de Google
                    google.accounts.id.renderButton(
                        document.getElementById('googleSignInBtn'),
                        {
                            theme: 'outline',
                            size: 'large',
                            width: '100%'
                        }
                    );
                }
            });

        } catch (error) {
            console.error('Error initiating Google sign-in:', error);
            this.showError('Error al iniciar sesión con Google');
            this.hideLoading();
        }
    }

    /**
     * Cierra la sesión del usuario
     */
    async signOut() {
        try {
            // Revocar token de Google si existe
            if (window.google && this.user) {
                google.accounts.id.disableAutoSelect();
            }

            // Limpiar estado local
            this.user = null;
            this.isAuthenticated = false;

            // Limpiar almacenamiento
            localStorage.removeItem(this.config.storageKey);

            // Notificar cierre de sesión
            this.notifyListeners('logout', {});

            // Mostrar toast
            this.showToast('Sesión cerrada correctamente', 'info');

            // Redireccionar si está en página protegida
            this.redirectIfOnProtectedPage();

            console.log('User signed out successfully');

        } catch (error) {
            console.error('Error signing out:', error);
            this.showError('Error al cerrar sesión');
        }
    }

    /**
     * Inicia sesión con email y contraseña
     */
    async signInWithEmailAndPassword(email, password, rememberMe = false) {
        try {
            console.log('Attempting email login for:', email);

            // Validar entrada
            if (!email || !password) {
                throw new Error('Email y contraseña son requeridos');
            }

            // Por ahora, simularemos la autenticación
            // En un entorno real, esto sería una llamada a tu API backend
            const loginData = await this.validateEmailLogin(email, password);

            if (loginData.success) {
                // Configurar usuario autenticado
                this.user = {
                    email: email,
                    name: loginData.user.name,
                    givenName: loginData.user.givenName || loginData.user.name?.split(' ')[0],
                    familyName: loginData.user.familyName || loginData.user.name?.split(' ').slice(1).join(' '),
                    picture: loginData.user.picture || null,
                    loginMethod: 'email'
                };

                this.isAuthenticated = true;

                // Configurar expiración según "recordarme"
                if (rememberMe) {
                    this.config.cookieExpiry = 30; // 30 días
                } else {
                    this.config.cookieExpiry = 1; // 1 día
                }

                // Guardar estado
                this.saveAuthState();

                // Emitir evento de login exitoso
                this.notifyListeners('login', {
                    user: this.user,
                    method: 'email',
                    timestamp: new Date().toISOString()
                });

                console.log('Email login successful for:', email);
                return { success: true, user: this.user };

            } else {
                throw new Error(loginData.message || 'Credenciales inválidas');
            }

        } catch (error) {
            console.error('Email login error:', error);
            this.notifyListeners('loginError', {
                error: error.message,
                method: 'email',
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }

    /**
     * Registra un nuevo usuario con email y contraseña
     */
    async registerWithEmailAndPassword(userData) {
        try {
            console.log('Attempting email registration for:', userData.email);

            // Validar entrada
            if (!userData.email || !userData.password || !userData.name) {
                throw new Error('Todos los campos son requeridos');
            }

            if (userData.password !== userData.confirmPassword) {
                throw new Error('Las contraseñas no coinciden');
            }

            if (userData.password.length < 8) {
                throw new Error('La contraseña debe tener al menos 8 caracteres');
            }

            // Simular registro - en un entorno real sería una llamada a la API
            const registrationData = await this.processEmailRegistration(userData);

            if (registrationData.success) {
                // Auto-login después del registro exitoso
                return await this.signInWithEmailAndPassword(userData.email, userData.password);
            } else {
                throw new Error(registrationData.message || 'Error en el registro');
            }

        } catch (error) {
            console.error('Email registration error:', error);
            this.notifyListeners('registrationError', {
                error: error.message,
                method: 'email',
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }

    /**
     * Valida las credenciales de login (simulado)
     * En un entorno real, esto sería una llamada a tu API backend
     */
    async validateEmailLogin(email, password) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Lista de usuarios de prueba (en un entorno real vendrían de tu base de datos)
        const testUsers = [
            {
                email: 'nflorenciailen@gmail.com',
                password: 'flor1234', // En producción, esto estaría hasheado
                name: 'Florencia',
                givenName: 'Flor',
                familyName: 'Admin',
                picture: null
            },
            {
                email: 'cliente@gmail.com.com',
                password: 'cliente123',
                name: 'Cliente LA BASICA',
                givenName: 'Cliente',
                familyName: 'LA BASICA',
                picture: null
            },
            {
                email: 'francokaddour@gmail.com',
                password: 'franco1234',
                name: 'Franco Kaddour',
                givenName: 'Franco',
                familyName: 'Kaddour',
                picture: null
            }
        ];

        const user = testUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (user && user.password === password) {
            return {
                success: true,
                user: {
                    name: user.name,
                    givenName: user.givenName,
                    familyName: user.familyName,
                    picture: user.picture
                }
            };
        } else {
            return {
                success: false,
                message: 'Email o contraseña incorrectos'
            };
        }
    }

    /**
     * Procesa el registro de email (simulado)
     * En un entorno real, esto sería una llamada a tu API backend
     */
    async processEmailRegistration(userData) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Verificar si el email ya existe (simulado)
        const existingEmails = [
            'nflorenciailen@gmail.com',
            'iarasol_55@hotmail.com',
            'francokaddour@gmail.com',
            'Madfa22@hotmail.com',
            'cliente@labasica.com'
        ];

        if (existingEmails.includes(userData.email.toLowerCase())) {
            return {
                success: false,
                message: 'Este email ya está registrado'
            };
        }

        // Simular registro exitoso
        return {
            success: true,
            message: 'Usuario registrado exitosamente'
        };
    }

    /**
     * Verifica si el usuario está autenticado
     */
    checkAuth() {
        return this.isAuthenticated && this.user !== null;
    }

    /**
     * Obtiene la información del usuario actual
     */
    getCurrentUser() {
        return this.user;
    }

    /**
     * Guarda el estado de autenticación en localStorage
     */
    saveAuthState() {
        try {
            const authData = {
                user: this.user,
                isAuthenticated: this.isAuthenticated,
                timestamp: new Date().toISOString(),
                expiresAt: new Date(Date.now() + (this.config.cookieExpiry * 24 * 60 * 60 * 1000)).toISOString()
            };

            localStorage.setItem(this.config.storageKey, JSON.stringify(authData));
        } catch (error) {
            console.error('Error saving auth state:', error);
        }
    }

    /**
     * Restaura el estado de autenticación desde localStorage
     */
    restoreAuthState() {
        try {
            const savedData = localStorage.getItem(this.config.storageKey);
            if (!savedData) return;

            const authData = JSON.parse(savedData);

            // Verificar si no ha expirado
            if (new Date() > new Date(authData.expiresAt)) {
                localStorage.removeItem(this.config.storageKey);
                return;
            }

            // Restaurar estado
            this.user = authData.user;
            this.isAuthenticated = authData.isAuthenticated;

            console.log('Auth state restored for user:', this.user?.email);

        } catch (error) {
            console.error('Error restoring auth state:', error);
            localStorage.removeItem(this.config.storageKey);
        }
    }

    /**
     * Verifica si la página actual requiere autenticación
     */
    requiresAuth() {
        const currentPath = window.location.pathname;
        return this.config.redirectPages.some(page => currentPath.includes(page));
    }

    /**
     * Redirecciona si está en una página protegida
     */
    redirectIfOnProtectedPage() {
        if (this.requiresAuth()) {
            window.location.href = '/';
        }
    }

    /**
     * Registra un listener para eventos de autenticación
     */
    addAuthListener(callback) {
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
                console.error('Error in auth listener:', error);
            }
        });
    }

    /**
     * Muestra el modal de autenticación
     */
    showAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Oculta el modal de autenticación
     */
    hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Muestra estado de carga
     */
    showLoading() {
        const loadingElement = document.getElementById('authLoading');
        const errorElement = document.getElementById('authError');
        const contentElement = document.querySelector('.auth-content');

        if (loadingElement) loadingElement.style.display = 'block';
        if (errorElement) errorElement.style.display = 'none';
        if (contentElement) contentElement.style.opacity = '0.5';
    }

    /**
     * Oculta estado de carga
     */
    hideLoading() {
        const loadingElement = document.getElementById('authLoading');
        const contentElement = document.querySelector('.auth-content');

        if (loadingElement) loadingElement.style.display = 'none';
        if (contentElement) contentElement.style.opacity = '1';
    }

    /**
     * Muestra error en el modal
     */
    showError(message) {
        const errorElement = document.getElementById('authError');
        const contentElement = document.querySelector('.auth-content');

        if (errorElement) {
            errorElement.querySelector('p').textContent = message;
            errorElement.style.display = 'block';
        }

        if (contentElement) contentElement.style.opacity = '1';
    }

    /**
     * Oculta error del modal
     */
    hideError() {
        const errorElement = document.getElementById('authError');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    /**
     * Muestra toast notification
     */
    showToast(message, type = 'info') {
        // Usar el sistema de toast existente si está disponible
        if (window.showToast) {
            window.showToast(message, type);
            return;
        }

        // Fallback: crear toast básico
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-orange);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

/**
 * Clase AuthModal para manejar la interfaz del modal
 */
class AuthModal {
    static init() {
        // Configurar event listeners del modal
        this.setupEventListeners();
    }

    static setupEventListeners() {
        // Botón de cerrar modal
        const closeBtn = document.getElementById('closeAuthModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                window.authManager?.hideAuthModal();
            });
        }

        // Click fuera del modal
        const overlay = document.getElementById('authModal');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    window.authManager?.hideAuthModal();
                }
            });
        }

        // Botón de Google Sign-In
        const googleBtn = document.getElementById('googleSignInBtn');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                window.authManager?.signInWithGoogle();
            });
        }

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                window.authManager?.hideAuthModal();
            }
        });
    }

    static hideError() {
        window.authManager?.hideError();
    }
}

// Crear instancia global cuando se cargue el script
window.AuthManager = AuthManager;
window.AuthModal = AuthModal;

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authManager = new AuthManager();
        AuthModal.init();
    });
} else {
    window.authManager = new AuthManager();
    AuthModal.init();
}