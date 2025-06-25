import { CreateTaskDTO, UpdateTaskDTO } from '../models/Task';
import { CreateTaskListDTO, UpdateTaskListDTO } from '../models/TaskList';

/**
 * Validation utility functions for input data
 * Provides comprehensive validation for all DTOs and user inputs
 */

/**
 * Validates a string field ensuring it's not empty or just whitespace
 * @param value - The string value to validate
 * @param fieldName - Name of the field for error messages
 * @returns Validation result with success flag and error message
 */
export function validateRequiredString(value: any, fieldName: string): ValidationResult {
  if (typeof value !== 'string') {
    return {
      isValid: false,
      error: `${fieldName} must be a string`
    };
  }
  
  if (value.trim().length === 0) {
    return {
      isValid: false,
      error: `${fieldName} cannot be empty`
    };
  }
  
  if (value.length > 255) {
    return {
      isValid: false,
      error: `${fieldName} cannot exceed 255 characters`
    };
  }
  
  return { isValid: true };
}

/**
 * Validates an optional string field
 * @param value - The string value to validate (can be undefined)
 * @param fieldName - Name of the field for error messages
 * @returns Validation result with success flag and error message
 */
export function validateOptionalString(value: any, fieldName: string): ValidationResult {
  if (value === undefined || value === null) {
    return { isValid: true };
  }
  
  return validateRequiredString(value, fieldName);
}

/**
 * Validates UUID format
 * @param value - The UUID string to validate
 * @param fieldName - Name of the field for error messages
 * @returns Validation result with success flag and error message
 */
export function validateUUID(value: any, fieldName: string): ValidationResult {
  if (typeof value !== 'string') {
    return {
      isValid: false,
      error: `${fieldName} must be a string`
    };
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid UUID`
    };
  }
  
  return { isValid: true };
}

/**
 * Validates CreateTaskDTO object
 * @param data - The task creation data to validate
 * @returns Validation result with success flag and error message
 */
export function validateCreateTask(data: any): ValidationResult {
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      error: 'Request body must be an object'
    };
  }
  
  // Validate required title field
  const titleValidation = validateRequiredString(data.title, 'title');
  if (!titleValidation.isValid) {
    return titleValidation;
  }
  
  // Validate optional time field
  const timeValidation = validateOptionalString(data.time, 'time');
  if (!timeValidation.isValid) {
    return timeValidation;
  }
  
  // Validate required listId field
  const listIdValidation = validateUUID(data.listId, 'listId');
  if (!listIdValidation.isValid) {
    return listIdValidation;
  }
  
  return { isValid: true };
}

/**
 * Validates UpdateTaskDTO object
 * @param data - The task update data to validate
 * @returns Validation result with success flag and error message
 */
export function validateUpdateTask(data: any): ValidationResult {
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      error: 'Request body must be an object'
    };
  }
  
  // At least one field must be provided for update
  if (!data.title && !data.time && data.completed === undefined) {
    return {
      isValid: false,
      error: 'At least one field (title, time, or completed) must be provided for update'
    };
  }
  
  // Validate title if provided
  if (data.title !== undefined) {
    const titleValidation = validateRequiredString(data.title, 'title');
    if (!titleValidation.isValid) {
      return titleValidation;
    }
  }
  
  // Validate time if provided
  if (data.time !== undefined) {
    const timeValidation = validateOptionalString(data.time, 'time');
    if (!timeValidation.isValid) {
      return timeValidation;
    }
  }
  
  // Validate completed if provided
  if (data.completed !== undefined && typeof data.completed !== 'boolean') {
    return {
      isValid: false,
      error: 'completed must be a boolean'
    };
  }
  
  return { isValid: true };
}

/**
 * Validates CreateTaskListDTO object
 * @param data - The task list creation data to validate
 * @returns Validation result with success flag and error message
 */
export function validateCreateTaskList(data: any): ValidationResult {
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      error: 'Request body must be an object'
    };
  }
  
  // Validate required name field
  const nameValidation = validateRequiredString(data.name, 'name');
  if (!nameValidation.isValid) {
    return nameValidation;
  }
  
  return { isValid: true };
}

/**
 * Validates UpdateTaskListDTO object
 * @param data - The task list update data to validate
 * @returns Validation result with success flag and error message
 */
export function validateUpdateTaskList(data: any): ValidationResult {
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      error: 'Request body must be an object'
    };
  }
  
  // At least one field must be provided for update
  if (!data.name) {
    return {
      isValid: false,
      error: 'name field must be provided for update'
    };
  }
  
  // Validate name if provided
  const nameValidation = validateRequiredString(data.name, 'name');
  if (!nameValidation.isValid) {
    return nameValidation;
  }
  
  return { isValid: true };
}

/**
 * Interface for validation results
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
