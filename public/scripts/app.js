/**
 * Main application module for To-Do List Application
 * Handles application state, event listeners, and business logic
 */

class TodoApp {
    constructor() {
        this.currentListId = null;
        this.taskLists = [];
        this.currentTasks = [];
        this.isEditingList = false;
        this.editingTaskId = null;
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            ui.showLoading();
            await this.setupEventListeners();
            await this.loadTaskLists();
            await this.updateOverallStats();
            ui.hideLoading();
            
            // Show welcome screen if no lists exist
            if (this.taskLists.length === 0) {
                this.showWelcomeScreen();
            }
            
            console.log('Todo App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            ui.showToast('Failed to initialize application', 'error');
            ui.hideLoading();
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Header buttons
        document.getElementById('add-list-btn').addEventListener('click', () => {
            this.showAddListModal();
        });

        document.getElementById('welcome-add-list-btn').addEventListener('click', () => {
            this.showAddListModal();
        });

        // List modal form
        document.getElementById('list-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleListFormSubmit();
        });

        document.getElementById('list-form-cancel').addEventListener('click', () => {
            ui.hideModal('list-modal');
        });

        // Task form
        document.getElementById('add-task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddTask();
        });

        // Task edit modal form
        document.getElementById('task-edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTaskEditSubmit();
        });

        document.getElementById('task-form-cancel').addEventListener('click', () => {
            ui.hideModal('task-modal');
        });

        // Current list actions
        document.getElementById('edit-list-btn').addEventListener('click', () => {
            if (this.currentListId) {
                this.showEditListModal(this.currentListId);
            }
        });

        document.getElementById('delete-list-btn').addEventListener('click', () => {
            if (this.currentListId) {
                this.confirmDeleteList(this.currentListId);
            }
        });

        // Delegate events for dynamic content
        this.setupDelegatedEvents();
    }

    /**
     * Setup delegated event listeners for dynamic content
     */
    setupDelegatedEvents() {
        // Task list clicks
        document.getElementById('task-lists-container').addEventListener('click', (e) => {
            const listItem = e.target.closest('.task-list-item');
            if (listItem && !e.target.closest('.task-list-actions')) {
                const listId = listItem.dataset.listId;
                this.selectTaskList(listId);
            }

            // Edit list button
            if (e.target.closest('.edit-list-btn')) {
                const listId = e.target.closest('.edit-list-btn').dataset.listId;
                this.showEditListModal(listId);
            }

            // Delete list button
            if (e.target.closest('.delete-list-btn')) {
                const listId = e.target.closest('.delete-list-btn').dataset.listId;
                this.confirmDeleteList(listId);
            }
        });

        // Task interactions
        document.getElementById('tasks-container').addEventListener('click', (e) => {
            // Task checkbox toggle
            if (e.target.closest('.task-checkbox')) {
                const taskId = e.target.closest('.task-checkbox').dataset.taskId;
                this.toggleTask(taskId);
            }

            // Edit task button
            if (e.target.closest('.edit-task-btn')) {
                const taskId = e.target.closest('.edit-task-btn').dataset.taskId;
                this.showEditTaskModal(taskId);
            }

            // Delete task button
            if (e.target.closest('.delete-task-btn')) {
                const taskId = e.target.closest('.delete-task-btn').dataset.taskId;
                this.confirmDeleteTask(taskId);
            }
        });
    }

    // Task List Management

    /**
     * Load all task lists
     */
    async loadTaskLists() {
        try {
            this.taskLists = await api.getTaskLists();
            this.renderTaskLists();
        } catch (error) {
            console.error('Failed to load task lists:', error);
            ui.showToast('Failed to load task lists', 'error');
        }
    }

    /**
     * Render task lists in sidebar
     */
    renderTaskLists() {
        const container = document.getElementById('task-lists-container');
        const emptyState = document.getElementById('empty-lists-state');

        if (this.taskLists.length === 0) {
            emptyState.style.display = 'flex';
            return;
        }

        emptyState.style.display = 'none';

        // Clear existing lists (except empty state)
        const existingLists = container.querySelectorAll('.task-list-item');
        existingLists.forEach(item => item.remove());

        // Render each task list
        this.taskLists.forEach(taskList => {
            const isActive = taskList.id === this.currentListId;
            const listElement = ui.createTaskListElement(taskList, isActive);
            container.appendChild(listElement);
        });
    }

    /**
     * Select a task list
     */
    async selectTaskList(listId) {
        try {
            this.currentListId = listId;
            const taskList = this.taskLists.find(list => list.id === listId);
            
            if (!taskList) {
                throw new Error('Task list not found');
            }

            // Update UI
            this.hideWelcomeScreen();
            this.showTaskListView();
            this.renderTaskLists(); // Re-render to update active state
            
            // Update list title
            ui.updateText('current-list-title', taskList.name);
            
            // Load tasks for this list
            await this.loadTasks(listId);
            await this.updateListStats(listId);
            
        } catch (error) {
            console.error('Failed to select task list:', error);
            ui.showToast('Failed to load task list', 'error');
        }
    }

    /**
     * Show add list modal
     */
    showAddListModal() {
        this.isEditingList = false;
        ui.updateText('list-modal-title', 'Add New List');
        ui.updateText('list-form-submit', 'Create List');
        ui.showModal('list-modal');
    }

    /**
     * Show edit list modal
     */
    async showEditListModal(listId) {
        try {
            const taskList = this.taskLists.find(list => list.id === listId);
            if (!taskList) {
                throw new Error('Task list not found');
            }

            this.isEditingList = true;
            this.editingListId = listId;
            
            ui.updateText('list-modal-title', 'Edit List');
            ui.updateText('list-form-submit', 'Update List');
            
            // Set form data
            const form = document.getElementById('list-form');
            ui.setFormData(form, { 'list-name-input': taskList.name });
            
            ui.showModal('list-modal');
        } catch (error) {
            console.error('Failed to show edit list modal:', error);
            ui.showToast('Failed to load list data', 'error');
        }
    }

    /**
     * Handle list form submission
     */
    async handleListFormSubmit() {
        try {
            const form = document.getElementById('list-form');
            const formData = ui.getFormData(form);
            const listName = formData['list-name-input'] || document.getElementById('list-name-input').value;

            if (!listName.trim()) {
                ui.showToast('Please enter a list name', 'warning');
                return;
            }

            ui.showLoading();

            if (this.isEditingList) {
                // Update existing list
                const updatedList = await api.updateTaskList(this.editingListId, { name: listName });
                
                // Update local data
                const listIndex = this.taskLists.findIndex(list => list.id === this.editingListId);
                if (listIndex !== -1) {
                    this.taskLists[listIndex] = updatedList;
                }
                
                // Update current list title if editing current list
                if (this.currentListId === this.editingListId) {
                    ui.updateText('current-list-title', updatedList.name);
                }
                
                ui.showToast('List updated successfully', 'success');
            } else {
                // Create new list
                const newList = await api.createTaskList({ name: listName });
                this.taskLists.push(newList);
                
                ui.showToast('List created successfully', 'success');
                
                // Auto-select the new list
                await this.selectTaskList(newList.id);
            }

            this.renderTaskLists();
            await this.updateOverallStats();
            ui.hideModal('list-modal');
            ui.hideLoading();

        } catch (error) {
            console.error('Failed to save list:', error);
            ui.showToast(error.message || 'Failed to save list', 'error');
            ui.hideLoading();
        }
    }

    /**
     * Confirm delete list
     */
    confirmDeleteList(listId) {
        const taskList = this.taskLists.find(list => list.id === listId);
        if (!taskList) return;

        const confirmed = confirm(`Are you sure you want to delete "${taskList.name}"? This will also delete all tasks in this list.`);
        if (confirmed) {
            this.deleteTaskList(listId);
        }
    }

    /**
     * Delete a task list
     */
    async deleteTaskList(listId) {
        try {
            ui.showLoading();
            
            await api.deleteTaskList(listId);
            
            // Remove from local data
            this.taskLists = this.taskLists.filter(list => list.id !== listId);
            
            // If deleting current list, show welcome screen
            if (this.currentListId === listId) {
                this.currentListId = null;
                this.currentTasks = [];
                
                if (this.taskLists.length > 0) {
                    // Select first available list
                    await this.selectTaskList(this.taskLists[0].id);
                } else {
                    this.showWelcomeScreen();
                }
            }
            
            this.renderTaskLists();
            await this.updateOverallStats();
            ui.showToast('List deleted successfully', 'success');
            ui.hideLoading();
            
        } catch (error) {
            console.error('Failed to delete list:', error);
            ui.showToast(error.message || 'Failed to delete list', 'error');
            ui.hideLoading();
        }
    }

    // Task Management

    /**
     * Load tasks for current list
     */
    async loadTasks(listId) {
        try {
            this.currentTasks = await api.getTasks(listId);
            this.renderTasks();
        } catch (error) {
            console.error('Failed to load tasks:', error);
            ui.showToast('Failed to load tasks', 'error');
        }
    }

    /**
     * Render tasks in the tasks container
     */
    renderTasks() {
        const container = document.getElementById('tasks-container');
        const emptyState = document.getElementById('empty-tasks-state');

        if (this.currentTasks.length === 0) {
            container.innerHTML = '';
            container.appendChild(emptyState);
            emptyState.style.display = 'flex';
            return;
        }

        emptyState.style.display = 'none';
        container.innerHTML = '';

        // Render each task
        this.currentTasks.forEach(task => {
            const taskElement = ui.createTaskElement(task);
            container.appendChild(taskElement);
        });
    }

    /**
     * Handle add task form submission
     */
    async handleAddTask() {
        try {
            const titleInput = document.getElementById('task-title-input');
            const timeInput = document.getElementById('task-time-input');
            
            const title = titleInput.value.trim();
            const time = timeInput.value.trim();

            if (!title) {
                ui.showToast('Please enter a task title', 'warning');
                titleInput.focus();
                return;
            }

            if (!this.currentListId) {
                ui.showToast('Please select a list first', 'warning');
                return;
            }

            const taskData = { title };
            if (time) {
                taskData.time = time;
            }

            const newTask = await api.createTask(this.currentListId, taskData);
            
            // Add to local data
            this.currentTasks.unshift(newTask);
            
            // Update UI
            this.renderTasks();
            await this.updateListStats(this.currentListId);
            await this.updateOverallStats();
            
            // Clear form
            titleInput.value = '';
            timeInput.value = '';
            titleInput.focus();
            
            ui.showToast('Task added successfully', 'success');
            
        } catch (error) {
            console.error('Failed to add task:', error);
            ui.showToast(error.message || 'Failed to add task', 'error');
        }
    }

    /**
     * Toggle task completion
     */
    async toggleTask(taskId) {
        try {
            const updatedTask = await api.toggleTask(taskId);
            
            // Update local data
            const taskIndex = this.currentTasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                this.currentTasks[taskIndex] = updatedTask;
            }
            
            // Update UI
            this.renderTasks();
            await this.updateListStats(this.currentListId);
            await this.updateOverallStats();
            
        } catch (error) {
            console.error('Failed to toggle task:', error);
            ui.showToast(error.message || 'Failed to update task', 'error');
        }
    }

    /**
     * Show edit task modal
     */
    showEditTaskModal(taskId) {
        const task = this.currentTasks.find(t => t.id === taskId);
        if (!task) return;

        this.editingTaskId = taskId;
        
        // Set form data
        const form = document.getElementById('task-edit-form');
        ui.setFormData(form, {
            'edit-task-title-input': task.title,
            'edit-task-time-input': task.time || ''
        });
        
        ui.showModal('task-modal');
    }

    /**
     * Handle task edit form submission
     */
    async handleTaskEditSubmit() {
        try {
            const form = document.getElementById('task-edit-form');
            const formData = ui.getFormData(form);
            
            const title = formData['edit-task-title-input'] || document.getElementById('edit-task-title-input').value;
            const time = formData['edit-task-time-input'] || document.getElementById('edit-task-time-input').value;

            if (!title.trim()) {
                ui.showToast('Please enter a task title', 'warning');
                return;
            }

            const taskData = { title: title.trim() };
            if (time.trim()) {
                taskData.time = time.trim();
            }

            const updatedTask = await api.updateTask(this.editingTaskId, taskData);
            
            // Update local data
            const taskIndex = this.currentTasks.findIndex(task => task.id === this.editingTaskId);
            if (taskIndex !== -1) {
                this.currentTasks[taskIndex] = updatedTask;
            }
            
            // Update UI
            this.renderTasks();
            ui.hideModal('task-modal');
            ui.showToast('Task updated successfully', 'success');
            
        } catch (error) {
            console.error('Failed to update task:', error);
            ui.showToast(error.message || 'Failed to update task', 'error');
        }
    }

    /**
     * Confirm delete task
     */
    confirmDeleteTask(taskId) {
        const task = this.currentTasks.find(t => t.id === taskId);
        if (!task) return;

        const confirmed = confirm(`Are you sure you want to delete "${task.title}"?`);
        if (confirmed) {
            this.deleteTask(taskId);
        }
    }

    /**
     * Delete a task
     */
    async deleteTask(taskId) {
        try {
            await api.deleteTask(taskId);
            
            // Remove from local data
            this.currentTasks = this.currentTasks.filter(task => task.id !== taskId);
            
            // Update UI
            this.renderTasks();
            await this.updateListStats(this.currentListId);
            await this.updateOverallStats();
            
            ui.showToast('Task deleted successfully', 'success');
            
        } catch (error) {
            console.error('Failed to delete task:', error);
            ui.showToast(error.message || 'Failed to delete task', 'error');
        }
    }

    // UI State Management

    /**
     * Show welcome screen
     */
    showWelcomeScreen() {
        ui.toggleElement('welcome-screen', true);
        ui.toggleElement('task-list-view', false);
    }

    /**
     * Hide welcome screen
     */
    hideWelcomeScreen() {
        ui.toggleElement('welcome-screen', false);
    }

    /**
     * Show task list view
     */
    showTaskListView() {
        ui.toggleElement('task-list-view', true);
        ui.toggleElement('welcome-screen', false);
    }

    // Statistics

    /**
     * Update overall statistics
     */
    async updateOverallStats() {
        try {
            const stats = await api.getTaskStats();
            ui.updateText('total-tasks', stats.totalTasks);
            ui.updateText('completed-tasks', stats.completedTasks);
        } catch (error) {
            console.error('Failed to update overall stats:', error);
        }
    }

    /**
     * Update current list statistics
     */
    async updateListStats(listId) {
        try {
            const stats = await api.getTaskStats(listId);
            ui.updateText('list-total-tasks', stats.totalTasks);
            ui.updateText('list-completed-tasks', stats.completedTasks);
            ui.updateText('list-completion-rate', `${stats.completionRate}%`);
        } catch (error) {
            console.error('Failed to update list stats:', error);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});
