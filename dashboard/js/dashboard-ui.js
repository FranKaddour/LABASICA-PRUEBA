/**
 * Dashboard UI Components - Componentes reutilizables para el dashboard
 */

class DashboardUI {
    constructor() {
        this.toastContainer = document.getElementById('toastContainer');
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }

    /**
     * Muestra un toast notification
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    ${this.getToastIcon(type)}
                </div>
                <div class="toast-message">${message}</div>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        if (this.toastContainer) {
            this.toastContainer.appendChild(toast);

            // Auto remove
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, duration);

            // Animate in
            setTimeout(() => toast.classList.add('show'), 100);
        }
    }

    /**
     * Obtiene el icono para el tipo de toast
     */
    getToastIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons.info;
    }

    /**
     * Muestra el overlay de carga
     */
    showLoading(message = 'Cargando...') {
        if (this.loadingOverlay) {
            this.loadingOverlay.querySelector('p').textContent = message;
            this.loadingOverlay.classList.add('active');
        }
    }

    /**
     * Oculta el overlay de carga
     */
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('active');
        }
    }

    /**
     * Crea un modal dinámico
     */
    createModal(options) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal dashboard-modal">
                <div class="modal-header">
                    <h3>${options.title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${options.content}
                </div>
                <div class="modal-footer">
                    ${options.footer || ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 100);

        return modal;
    }

    /**
     * Crea una tabla responsiva
     */
    createTable(headers, data, actions = []) {
        let tableHTML = `
            <div class="table-container">
                <table class="dashboard-table">
                    <thead>
                        <tr>
                            ${headers.map(header => `<th>${header}</th>`).join('')}
                            ${actions.length > 0 ? '<th>Acciones</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.forEach(row => {
            tableHTML += '<tr>';
            headers.forEach(header => {
                const key = header.toLowerCase().replace(' ', '');
                const value = row[key] || row[header] || '-';

                if (key === 'imagen' || key === 'image') {
                    tableHTML += `<td><img src="${value}" alt="Imagen" class="table-image"></td>`;
                } else if (key === 'precio' || key === 'price') {
                    tableHTML += `<td>$${value}</td>`;
                } else if (key === 'disponible' || key === 'available') {
                    const badge = value ? 'success' : 'danger';
                    const text = value ? 'Disponible' : 'No Disponible';
                    tableHTML += `<td><span class="badge badge-${badge}">${text}</span></td>`;
                } else {
                    tableHTML += `<td>${value}</td>`;
                }
            });

            if (actions.length > 0) {
                tableHTML += '<td class="table-actions">';
                actions.forEach(action => {
                    tableHTML += `
                        <button class="action-btn ${action.class}"
                                onclick="${action.onclick}"
                                data-id="${row.id}"
                                title="${action.title}">
                            <i class="${action.icon}"></i>
                        </button>
                    `;
                });
                tableHTML += '</td>';
            }

            tableHTML += '</tr>';
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        return tableHTML;
    }

    /**
     * Crea un formulario dinámico
     */
    createForm(fields, submitText = 'Guardar', submitClass = 'btn-primary') {
        let formHTML = '<form class="dashboard-form">';

        fields.forEach(field => {
            formHTML += `<div class="form-group">`;

            if (field.label) {
                formHTML += `<label for="${field.name}">${field.label}</label>`;
            }

            switch (field.type) {
                case 'textarea':
                    formHTML += `
                        <textarea
                            id="${field.name}"
                            name="${field.name}"
                            placeholder="${field.placeholder || ''}"
                            ${field.required ? 'required' : ''}
                            rows="${field.rows || 4}"
                        >${field.value || ''}</textarea>
                    `;
                    break;

                case 'select':
                    formHTML += `<select id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>`;
                    if (field.placeholder) {
                        formHTML += `<option value="">${field.placeholder}</option>`;
                    }
                    field.options.forEach(option => {
                        const selected = option.value === field.value ? 'selected' : '';
                        formHTML += `<option value="${option.value}" ${selected}>${option.text}</option>`;
                    });
                    formHTML += '</select>';
                    break;

                case 'checkbox':
                    const checked = field.value ? 'checked' : '';
                    formHTML += `
                        <div class="checkbox-group">
                            <input
                                type="checkbox"
                                id="${field.name}"
                                name="${field.name}"
                                ${checked}
                            >
                            <label for="${field.name}" class="checkbox-label">${field.checkboxLabel}</label>
                        </div>
                    `;
                    break;

                default:
                    formHTML += `
                        <input
                            type="${field.type || 'text'}"
                            id="${field.name}"
                            name="${field.name}"
                            placeholder="${field.placeholder || ''}"
                            value="${field.value || ''}"
                            ${field.required ? 'required' : ''}
                            ${field.min ? `min="${field.min}"` : ''}
                            ${field.max ? `max="${field.max}"` : ''}
                            ${field.step ? `step="${field.step}"` : ''}
                        >
                    `;
            }

            if (field.help) {
                formHTML += `<small class="form-help">${field.help}</small>`;
            }

            formHTML += '</div>';
        });

        formHTML += `
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                    Cancelar
                </button>
                <button type="submit" class="${submitClass}">
                    ${submitText}
                </button>
            </div>
        </form>`;

        return formHTML;
    }

    /**
     * Crea una confirmación de eliminación
     */
    confirmDelete(title, message, onConfirm) {
        const modal = this.createModal({
            title: title,
            content: `
                <div class="confirm-delete">
                    <div class="confirm-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <p>${message}</p>
                </div>
            `,
            footer: `
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                    Cancelar
                </button>
                <button type="button" class="btn btn-danger" id="confirmDeleteBtn">
                    Eliminar
                </button>
            `
        });

        modal.querySelector('#confirmDeleteBtn').addEventListener('click', () => {
            onConfirm();
            modal.remove();
        });

        return modal;
    }

    /**
     * Crea cards estadísticas
     */
    createStatsCard(title, value, icon, color = 'primary') {
        return `
            <div class="stats-card stats-card-${color}">
                <div class="stats-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="stats-content">
                    <h4>${value}</h4>
                    <p>${title}</p>
                </div>
            </div>
        `;
    }

    /**
     * Actualiza navegación activa
     */
    updateActiveNav(sectionId) {
        document.querySelectorAll('.dashboard-nav-link').forEach(link => {
            link.parentElement.classList.remove('active');
        });

        const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.parentElement.classList.add('active');
        }
    }

    /**
     * Actualiza sección activa
     */
    updateActiveSection(sectionId) {
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });

        const activeSection = document.getElementById(`${sectionId}-section`);
        if (activeSection) {
            activeSection.classList.add('active');
        }
    }
}

// Instancia global
window.DashboardUI = DashboardUI;
window.dashboardUI = new DashboardUI();