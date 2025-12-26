/**
 * Live Chat Validation
 * Provides comprehensive validation for chat functionality
 */

export interface ChatFormData {
    title: string;
    participants: string[];
    message?: string;
}

export interface ValidationErrors {
    title?: string;
    participants?: string;
    message?: string;
}

/**
 * Validates conversation title
 */
export function validateTitle(title: string): string | undefined {
    if (!title || title.trim().length === 0) {
        return "Conversation title is required";
    }
    if (title.trim().length < 3) {
        return "Title must be at least 3 characters long";
    }
    if (title.trim().length > 100) {
        return "Title must not exceed 100 characters";
    }
    return undefined;
}

/**
 * Validates participants selection
 */
export function validateParticipants(participants: string[]): string | undefined {
    if (!participants || participants.length === 0) {
        return "Please select at least one participant";
    }
    if (participants.length > 50) {
        return "Cannot add more than 50 participants";
    }
    return undefined;
}

/**
 * Validates message content
 */
export function validateMessage(message: string): string | undefined {
    if (!message || message.trim().length === 0) {
        return "Message cannot be empty";
    }
    if (message.trim().length > 10000) {
        return "Message must not exceed 10,000 characters";
    }
    return undefined;
}

/**
 * Validates file upload
 */
export function validateFile(file: File): string | undefined {
    // Max file size: 50MB
    const maxSize = 50 * 1024 * 1024;

    if (file.size > maxSize) {
        return "File size must not exceed 50MB";
    }

    // Blocked file types for security
    const blockedExtensions = ['.exe', '.bat', '.cmd', '.sh', '.app', '.dmg'];
    const fileName = file.name.toLowerCase();

    if (blockedExtensions.some(ext => fileName.endsWith(ext))) {
        return "This file type is not allowed for security reasons";
    }

    return undefined;
}

/**
 * Validates image upload
 */
export function validateImage(file: File): string | undefined {
    // Max image size: 10MB
    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
        return "Image size must not exceed 10MB";
    }

    // Allowed image types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
        return "Only JPEG, PNG, GIF, and WebP images are allowed";
    }

    return undefined;
}

/**
 * Validates entire chat form
 */
export function validateChatForm(formData: ChatFormData): ValidationErrors {
    const errors: ValidationErrors = {};

    const titleError = validateTitle(formData.title);
    if (titleError) errors.title = titleError;

    const participantsError = validateParticipants(formData.participants);
    if (participantsError) errors.participants = participantsError;

    if (formData.message) {
        const messageError = validateMessage(formData.message);
        if (messageError) errors.message = messageError;
    }

    return errors;
}

/**
 * Checks if form has validation errors
 */
export function hasValidationErrors(errors: ValidationErrors): boolean {
    return Object.keys(errors).length > 0;
}

/**
 * Sanitizes message content
 */
export function sanitizeMessage(message: string): string {
    return message
        .trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .substring(0, 10000); // Enforce max length
}

/**
 * Sanitizes title
 */
export function sanitizeTitle(title: string): string {
    return title
        .trim()
        .substring(0, 100); // Enforce max length
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validates search query
 */
export function validateSearchQuery(query: string): boolean {
    // Allow alphanumeric, spaces, and basic punctuation
    const validPattern = /^[a-zA-Z0-9\s\-_.,!?@]*$/;
    return validPattern.test(query) && query.length <= 100;
}
