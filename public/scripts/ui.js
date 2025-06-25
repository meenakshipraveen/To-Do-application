/**
 * UI utilities module for To-Do List Application
 * Handles DOM manipulation, modals, toasts, and other UI interactions
 */

class UI {
    constructor() {
        this.modals = new Map();
        this.toastContainer = null;
        this.toastCounter = 0;
        this.init();
    }

    /**
     * Initialize UI utilities
     */
    init() {
        this.toastContainer = document.getElementById('toast-container');
        this.setupModals();
        this.setupGlobalEventListeners();
    }

    /**
     * Setup modal functionality
     */
    setupModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const modalId = modal.id;
            this.modals.set(modalId, modal);

            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modalId);
                }
            });

            // Close modal when clicking close button
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.hideModal(modalId);
                });
            }
        });
    }

    /**
     * Setup global event listeners
     */
    setupGlobalEventListeners() {
        // Close modals on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                this.closeAllDropdowns();
            }
        });
    }

    // Modal Methods

    /**
     * Show a modal
     * @param {string} modalId - Modal ID
     */
    showModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Focus first input in modal
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    /**
     * Hide a modal
     * @param {string} modalId - Modal ID
     */
    hideModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            
            // Reset form if exists
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
        }
    }

    /**
     * Hide all modals
     */
    hideAllModals() {
        this.modals.forEach((modal, modalId) => {
            this.hideModal(modalId);
        });
    }

    // Toast Notification Methods

    /**
     * Show a toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds (default: 5000)
     */
    showToast(message, type = 'info', duration = 5000) {
        const toastId = `toast-${++this.toastCounter}`;
        const toast = this.createToastElement(toastId, message, type);
        
        this.toastContainer.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto-remove toast
        if (duration > 0) {
            setTimeout(() => this.removeToast(toastId), duration);
        }
        
        return toastId;
    }

    /**
     * Create toast element
     * @param {string} toastId - Toast ID
     * @param {string} message - Toast message
     * @param {string} type - Toast type
     * @returns {HTMLElement} Toast element
     */
    createToastElement(toastId, message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-title">${titles[type] || titles.info}</div>
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">&times;</button>
        `;
        
        // Add close functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.removeToast(toastId));
        
        return toast;
    }

    /**
     * Remove a toast notification
     * @param {string} toastId - Toast ID
     */
    removeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.classList.remove('show');
            toast.classList.add('slide-out-right');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 250);
        }
    }

    // Loading Methods

    /**
     * Show loading spinner
     */
    showLoading() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.style.display = 'flex';
        }
    }

    /**
     * Hide loading spinner
     */
    hideLoading() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }

    // Dropdown Methods

    /**
     * Toggle dropdown
     * @param {HTMLElement} dropdown - Dropdown element
     */
    toggleDropdown(dropdown) {
        const isOpen = dropdown.classList.contains('show');
        this.closeAllDropdowns();
        
        if (!isOpen) {
            dropdown.classList.add('show');
        }
    }

    /**
     * Close all dropdowns
     */
    closeAllDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown.show');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }

    // Form Methods

    /**
     * Get form data as object
     * @param {HTMLFormElement} form - Form element
     * @returns {Object} Form data object
     */
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value.trim();
        }
        
        return data;
    }

    /**
     * Set form data from object
     * @param {HTMLFormElement} form - Form element
     * @param {Object} data - Data object
     */
    setFormData(form, data) {
        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"], #${key}`);
            if (input) {
                input.value = data[key] || '';
            }
        });
    }

    /**
     * Clear form
     * @param {HTMLFormElement} form - Form element
     */
    clearForm(form) {
        form.reset();
        
        // Clear any custom validation states
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.classList.remove('error', 'success');
        });
    }

    // Element Creation Methods

    /**
     * Create task list item element
     * @param {Object} taskList - Task list object
     * @param {boolean} isActive - Whether this list is currently active
     * @returns {HTMLElement} Task list item element
     */
    createTaskListElement(taskList, isActive = false) {
        const listItem = document.createElement('div');
        listItem.className = `task-list-item ${isActive ? 'active' : ''}`;
        listItem.dataset.listId = taskList.id;
        
        listItem.innerHTML = `
            <div class="task-list-info">
                <div class="task-list-name">${this.escapeHtml(taskList.name)}</div>
                <div class="task-list-meta">
                    <span>Created: ${this.formatDate(taskList.createdAt)}</span>
                </div>
            </div>
            <div class="task-list-actions">
                <button class="btn btn-secondary btn-sm edit-list-btn" data-list-id="${taskList.id}" aria-label="Edit list">
                    <span class="btn-icon">✏️</span>
                </button>
                <button class="btn btn-danger btn-sm delete-list-btn" data-list-id="${taskList.id}" aria-label="Delete list">
                    <span class="btn-icon">🗑️</span>
                </button>
            </div>
        `;
        
        return listItem;
    }

    /**
     * Create task item element
     * @param {Object} task - Task object
     * @returns {HTMLElement} Task item element
     */
    createTaskElement(task) {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.taskId = task.id;
        
        taskItem.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}"></div>
            <div class="task-content">
                <div class="task-title">${this.escapeHtml(task.title)}</div>
                ${task.time ? `<div class="task-time">${this.escapeHtml(task.time)}</div>` : ''}
            </div>
            <div class="task-actions">
                <button class="btn btn-secondary btn-sm edit-task-btn" data-task-id="${task.id}" aria-label="Edit task">
                    <span class="btn-icon">✏️</span>
                </button>
                <button class="btn btn-danger btn-sm delete-task-btn" data-task-id="${task.id}" aria-label="Delete task">
                    <span class="btn-icon">🗑️</span>
                </button>
            </div>
        `;
        
        return taskItem;
    }

    // Utility Methods

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Format date for display
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date
     */
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Format date and time for display
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date and time
     */
    formatDateTime(date) {
        const d = new Date(date);
        return d.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Animate element
     * @param {HTMLElement} element - Element to animate
     * @param {string} animation - Animation class name
     * @param {number} duration - Animation duration in milliseconds
     */
    animate(element, animation, duration = 250) {
        element.classList.add(animation);
        setTimeout(() => {
            element.classList.remove(animation);
        }, duration);
    }

    /**
     * Smooth scroll to element
     * @param {HTMLElement} element - Element to scroll to
     * @param {Object} options - Scroll options
     */
    scrollTo(element, options = {}) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            ...options
        });
    }

    /**
     * Update element text content safely
     * @param {string} elementId - Element ID
     * @param {string} text - Text content
     */
    updateText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Update element HTML content safely
     * @param {string} elementId - Element ID
     * @param {string} html - HTML content
     */
    updateHTML(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    }

    /**
     * Show/hide element
     * @param {string} elementId - Element ID
     * @param {boolean} show - Whether to show the element
     */
    toggleElement(elementId, show) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = show ? '' : 'none';
        }
    }
}

// Create and export UI instance
const ui = new UI();

// Make UI available globally for debugging
if (typeof window !== 'undefined') {
    window.ui = ui;
}
