/**
 * API module for To-Do List Application
 * Handles all HTTP requests to the backend API
 */

class API {
    constructor() {
        this.baseURL = '/api';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    /**
     * Makes an HTTP request to the API
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Response data
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error(`API Request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Task List API Methods

    /**
     * Get all task lists
     * @returns {Promise<Array>} Array of task lists
     */
    async getTaskLists() {
        const response = await this.request('/lists');
        return response.data;
    }

    /**
     * Get a specific task list by ID
     * @param {string} id - Task list ID
     * @returns {Promise<Object>} Task list object
     */
    async getTaskList(id) {
        const response = await this.request(`/lists/${id}`);
        return response.data;
    }

    /**
     * Create a new task list
     * @param {Object} listData - Task list data
     * @param {string} listData.name - Task list name
     * @returns {Promise<Object>} Created task list
     */
    async createTaskList(listData) {
        const response = await this.request('/lists', {
            method: 'POST',
            body: JSON.stringify(listData),
        });
        return response.data;
    }

    /**
     * Update a task list
     * @param {string} id - Task list ID
     * @param {Object} listData - Updated task list data
     * @returns {Promise<Object>} Updated task list
     */
    async updateTaskList(id, listData) {
        const response = await this.request(`/lists/${id}`, {
            method: 'PUT',
            body: JSON.stringify(listData),
        });
        return response.data;
    }

    /**
     * Delete a task list
     * @param {string} id - Task list ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteTaskList(id) {
        const response = await this.request(`/lists/${id}`, {
            method: 'DELETE',
        });
        return response.data.deleted;
    }

    /**
     * Get task list statistics
     * @param {string} id - Task list ID
     * @returns {Promise<Object>} Statistics object
     */
    async getTaskListStats(id) {
        const response = await this.request(`/lists/${id}/stats`);
        return response.data;
    }

    // Task API Methods

    /**
     * Get all tasks for a specific list
     * @param {string} listId - Task list ID
     * @returns {Promise<Array>} Array of tasks
     */
    async getTasks(listId) {
        const response = await this.request(`/lists/${listId}/tasks`);
        return response.data;
    }

    /**
     * Get a specific task by ID
     * @param {string} id - Task ID
     * @returns {Promise<Object>} Task object
     */
    async getTask(id) {
        const response = await this.request(`/tasks/${id}`);
        return response.data;
    }

    /**
     * Create a new task
     * @param {string} listId - Task list ID
     * @param {Object} taskData - Task data
     * @param {string} taskData.title - Task title
     * @param {string} [taskData.time] - Optional time field
     * @returns {Promise<Object>} Created task
     */
    async createTask(listId, taskData) {
        const response = await this.request(`/lists/${listId}/tasks`, {
            method: 'POST',
            body: JSON.stringify(taskData),
        });
        return response.data;
    }

    /**
     * Update a task
     * @param {string} id - Task ID
     * @param {Object} taskData - Updated task data
     * @returns {Promise<Object>} Updated task
     */
    async updateTask(id, taskData) {
        const response = await this.request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(taskData),
        });
        return response.data;
    }

    /**
     * Toggle task completion status
     * @param {string} id - Task ID
     * @returns {Promise<Object>} Updated task
     */
    async toggleTask(id) {
        const response = await this.request(`/tasks/${id}/toggle`, {
            method: 'PATCH',
        });
        return response.data;
    }

    /**
     * Delete a task
     * @param {string} id - Task ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteTask(id) {
        const response = await this.request(`/tasks/${id}`, {
            method: 'DELETE',
        });
        return response.data.deleted;
    }

    /**
     * Search tasks
     * @param {string} query - Search query
     * @param {string} [listId] - Optional list ID to limit search
     * @returns {Promise<Array>} Array of matching tasks
     */
    async searchTasks(query, listId = null) {
        const params = new URLSearchParams({ q: query });
        if (listId) {
            params.append('listId', listId);
        }
        
        const response = await this.request(`/tasks/search?${params}`);
        return response.data;
    }

    /**
     * Get task statistics
     * @param {string} [listId] - Optional list ID for specific list stats
     * @returns {Promise<Object>} Statistics object
     */
    async getTaskStats(listId = null) {
        const params = listId ? `?listId=${listId}` : '';
        const response = await this.request(`/tasks/stats${params}`);
        return response.data;
    }

    /**
     * Get all tasks across all lists
     * @returns {Promise<Array>} Array of all tasks
     */
    async getAllTasks() {
        const response = await this.request('/tasks');
        return response.data;
    }

    // Health Check Methods

    /**
     * Check API health
     * @returns {Promise<Object>} Health status
     */
    async checkHealth() {
        const response = await this.request('/health');
        return response.data;
    }

    /**
     * Check task list service health
     * @returns {Promise<Object>} Service health status
     */
    async checkListServiceHealth() {
        const response = await this.request('/lists/health');
        return response.data;
    }

    /**
     * Check task service health
     * @returns {Promise<Object>} Service health status
     */
    async checkTaskServiceHealth() {
        const response = await this.request('/tasks/health');
        return response.data;
    }
}

// Create and export API instance
const api = new API();

// Make API available globally for debugging
if (typeof window !== 'undefined') {
    window.api = api;
}
