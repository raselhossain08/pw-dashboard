/**
 * AI Assistant Validation Module
 * 
 * Comprehensive validation functions for the AI Assistant feature.
 * Covers message validation, conversation management, ratings, escalations,
 * knowledge base entries, attachments, preferences, and security checks.
 * 
 * @module ai-assistant.validation
 */

// ========================================
// MESSAGE VALIDATION
// ========================================

/**
 * Validates user message content
 * @param message - User message text
 * @returns Validation result with error message if invalid
 */
export function validateMessage(message: string): { valid: boolean; error?: string } {
    if (!message || typeof message !== 'string') {
        return { valid: false, error: 'Message is required' };
    }

    const trimmed = message.trim();

    if (trimmed.length === 0) {
        return { valid: false, error: 'Message cannot be empty' };
    }

    if (trimmed.length < 1) {
        return { valid: false, error: 'Message is too short' };
    }

    if (trimmed.length > 5000) {
        return { valid: false, error: 'Message is too long (max 5000 characters)' };
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /<iframe[^>]*>.*?<\/iframe>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi, // event handlers
    ];

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(trimmed)) {
            return { valid: false, error: 'Message contains potentially unsafe content' };
        }
    }

    return { valid: true };
}

/**
 * Validates session ID format
 * @param sessionId - Session identifier
 * @returns Whether session ID is valid
 */
export function validateSessionId(sessionId: string): boolean {
    if (!sessionId || typeof sessionId !== 'string') return false;

    // UUID v4 format or timestamp-based format
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const timestampPattern = /^\d{13,}$/;

    return uuidPattern.test(sessionId) || timestampPattern.test(sessionId);
}

/**
 * Sanitizes message content for safe display
 * @param message - Raw message text
 * @returns Sanitized message
 */
export function sanitizeMessage(message: string): string {
    if (!message) return '';

    return message
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .trim();
}

/**
 * Validates message context object
 * @param context - Optional context object with metadata
 * @returns Validation result
 */
export function validateContext(context?: Record<string, unknown>): { valid: boolean; error?: string } {
    if (!context) return { valid: true };

    if (typeof context !== 'object' || Array.isArray(context)) {
        return { valid: false, error: 'Context must be an object' };
    }

    // Check context size
    const contextStr = JSON.stringify(context);
    if (contextStr.length > 10000) {
        return { valid: false, error: 'Context data is too large' };
    }

    return { valid: true };
}

// ========================================
// RATING VALIDATION
// ========================================

/**
 * Validates conversation rating
 * @param rating - Rating value (1-5)
 * @returns Validation result
 */
export function validateRating(rating: number): { valid: boolean; error?: string } {
    if (typeof rating !== 'number') {
        return { valid: false, error: 'Rating must be a number' };
    }

    if (!Number.isInteger(rating)) {
        return { valid: false, error: 'Rating must be a whole number' };
    }

    if (rating < 1 || rating > 5) {
        return { valid: false, error: 'Rating must be between 1 and 5' };
    }

    return { valid: true };
}

/**
 * Validates rating feedback text
 * @param feedback - Optional feedback text
 * @returns Validation result
 */
export function validateRatingFeedback(feedback?: string): { valid: boolean; error?: string } {
    if (!feedback) return { valid: true };

    if (typeof feedback !== 'string') {
        return { valid: false, error: 'Feedback must be text' };
    }

    const trimmed = feedback.trim();

    if (trimmed.length > 1000) {
        return { valid: false, error: 'Feedback is too long (max 1000 characters)' };
    }

    return { valid: true };
}

// ========================================
// ESCALATION VALIDATION
// ========================================

/**
 * Validates escalation reason
 * @param reason - Reason for escalating to human agent
 * @returns Validation result
 */
export function validateEscalationReason(reason?: string): { valid: boolean; error?: string } {
    if (!reason) return { valid: true };

    if (typeof reason !== 'string') {
        return { valid: false, error: 'Reason must be text' };
    }

    const trimmed = reason.trim();

    if (trimmed.length > 500) {
        return { valid: false, error: 'Reason is too long (max 500 characters)' };
    }

    const validReasons = [
        'user_request',
        'complex_query',
        'urgent_issue',
        'dissatisfaction',
        'technical_problem',
        'billing_question',
        'other'
    ];

    // If it's a predefined reason, validate against list
    if (trimmed.length < 50 && !validReasons.includes(trimmed)) {
        // It's a short custom reason, which is fine
        return { valid: true };
    }

    return { valid: true };
}

// ========================================
// ATTACHMENT VALIDATION
// ========================================

/**
 * Validates file attachment
 * @param file - File object to validate
 * @returns Validation result
 */
export function validateAttachment(file: File): { valid: boolean; error?: string } {
    if (!file || !(file instanceof File)) {
        return { valid: false, error: 'Invalid file' };
    }

    // File size limit: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        return { valid: false, error: 'File is too large (max 10MB)' };
    }

    if (file.size === 0) {
        return { valid: false, error: 'File is empty' };
    }

    // Allowed file types
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'File type not supported' };
    }

    // File name validation
    if (file.name.length > 255) {
        return { valid: false, error: 'File name is too long' };
    }

    // Check for dangerous file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.msi', '.app', '.deb', '.rpm'];
    const fileName = file.name.toLowerCase();

    for (const ext of dangerousExtensions) {
        if (fileName.endsWith(ext)) {
            return { valid: false, error: 'File type not allowed for security reasons' };
        }
    }

    return { valid: true };
}

/**
 * Validates multiple attachments
 * @param files - Array or FileList of files
 * @returns Validation result
 */
export function validateAttachments(files: FileList | File[]): { valid: boolean; error?: string } {
    const fileArray = files instanceof FileList ? Array.from(files) : files;

    if (fileArray.length === 0) {
        return { valid: true };
    }

    if (fileArray.length > 5) {
        return { valid: false, error: 'Too many files (max 5 per message)' };
    }

    // Validate total size
    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSize = 25 * 1024 * 1024; // 25MB total

    if (totalSize > maxTotalSize) {
        return { valid: false, error: 'Total file size exceeds 25MB' };
    }

    // Validate each file
    for (const file of fileArray) {
        const result = validateAttachment(file);
        if (!result.valid) {
            return result;
        }
    }

    return { valid: true };
}

// ========================================
// PREFERENCES VALIDATION
// ========================================

/**
 * Validates user preferences object
 * @param preferences - User preferences
 * @returns Validation result
 */
export function validatePreferences(preferences: {
    showTimestamps?: boolean;
    compactMode?: boolean;
    retainDays?: number;
}): { valid: boolean; error?: string } {
    if (!preferences || typeof preferences !== 'object') {
        return { valid: false, error: 'Preferences must be an object' };
    }

    if (preferences.showTimestamps !== undefined && typeof preferences.showTimestamps !== 'boolean') {
        return { valid: false, error: 'showTimestamps must be a boolean' };
    }

    if (preferences.compactMode !== undefined && typeof preferences.compactMode !== 'boolean') {
        return { valid: false, error: 'compactMode must be a boolean' };
    }

    if (preferences.retainDays !== undefined) {
        if (typeof preferences.retainDays !== 'number') {
            return { valid: false, error: 'retainDays must be a number' };
        }

        if (!Number.isInteger(preferences.retainDays)) {
            return { valid: false, error: 'retainDays must be a whole number' };
        }

        if (preferences.retainDays < 1 || preferences.retainDays > 365) {
            return { valid: false, error: 'retainDays must be between 1 and 365' };
        }
    }

    return { valid: true };
}

// ========================================
// KNOWLEDGE BASE VALIDATION
// ========================================

/**
 * Validates knowledge base entry title
 * @param title - Entry title
 * @returns Validation result
 */
export function validateKnowledgeTitle(title: string): { valid: boolean; error?: string } {
    if (!title || typeof title !== 'string') {
        return { valid: false, error: 'Title is required' };
    }

    const trimmed = title.trim();

    if (trimmed.length < 3) {
        return { valid: false, error: 'Title must be at least 3 characters' };
    }

    if (trimmed.length > 200) {
        return { valid: false, error: 'Title is too long (max 200 characters)' };
    }

    return { valid: true };
}

/**
 * Validates knowledge base entry content
 * @param content - Entry content
 * @returns Validation result
 */
export function validateKnowledgeContent(content: string): { valid: boolean; error?: string } {
    if (!content || typeof content !== 'string') {
        return { valid: false, error: 'Content is required' };
    }

    const trimmed = content.trim();

    if (trimmed.length < 10) {
        return { valid: false, error: 'Content must be at least 10 characters' };
    }

    if (trimmed.length > 50000) {
        return { valid: false, error: 'Content is too long (max 50000 characters)' };
    }

    return { valid: true };
}

/**
 * Validates knowledge base category
 * @param category - Entry category
 * @returns Validation result
 */
export function validateKnowledgeCategory(category: string): { valid: boolean; error?: string } {
    if (!category || typeof category !== 'string') {
        return { valid: false, error: 'Category is required' };
    }

    const validCategories = [
        'general',
        'courses',
        'aircraft',
        'training',
        'technical',
        'billing',
        'support',
        'faq',
        'troubleshooting',
        'best_practices'
    ];

    if (!validCategories.includes(category.toLowerCase())) {
        return { valid: false, error: 'Invalid category' };
    }

    return { valid: true };
}

/**
 * Validates knowledge base tags
 * @param tags - Array of tags
 * @returns Validation result
 */
export function validateKnowledgeTags(tags: string[]): { valid: boolean; error?: string } {
    if (!Array.isArray(tags)) {
        return { valid: false, error: 'Tags must be an array' };
    }

    if (tags.length > 10) {
        return { valid: false, error: 'Too many tags (max 10)' };
    }

    for (const tag of tags) {
        if (typeof tag !== 'string') {
            return { valid: false, error: 'Each tag must be a string' };
        }

        if (tag.trim().length === 0) {
            return { valid: false, error: 'Tags cannot be empty' };
        }

        if (tag.length > 50) {
            return { valid: false, error: 'Tag is too long (max 50 characters)' };
        }
    }

    return { valid: true };
}

// ========================================
// AGENT VALIDATION
// ========================================

/**
 * Validates AI agent name
 * @param name - Agent name
 * @returns Validation result
 */
export function validateAgentName(name: string): { valid: boolean; error?: string } {
    if (!name || typeof name !== 'string') {
        return { valid: false, error: 'Agent name is required' };
    }

    const trimmed = name.trim();

    if (trimmed.length < 2) {
        return { valid: false, error: 'Agent name must be at least 2 characters' };
    }

    if (trimmed.length > 100) {
        return { valid: false, error: 'Agent name is too long (max 100 characters)' };
    }

    return { valid: true };
}

/**
 * Validates AI agent description
 * @param description - Agent description
 * @returns Validation result
 */
export function validateAgentDescription(description?: string): { valid: boolean; error?: string } {
    if (!description) return { valid: true };

    if (typeof description !== 'string') {
        return { valid: false, error: 'Description must be text' };
    }

    if (description.trim().length > 1000) {
        return { valid: false, error: 'Description is too long (max 1000 characters)' };
    }

    return { valid: true };
}

/**
 * Validates AI agent system prompt
 * @param prompt - System prompt
 * @returns Validation result
 */
export function validateAgentSystemPrompt(prompt: string): { valid: boolean; error?: string } {
    if (!prompt || typeof prompt !== 'string') {
        return { valid: false, error: 'System prompt is required' };
    }

    const trimmed = prompt.trim();

    if (trimmed.length < 10) {
        return { valid: false, error: 'System prompt must be at least 10 characters' };
    }

    if (trimmed.length > 5000) {
        return { valid: false, error: 'System prompt is too long (max 5000 characters)' };
    }

    return { valid: true };
}

/**
 * Validates agent temperature setting
 * @param temperature - Temperature value (0-2)
 * @returns Validation result
 */
export function validateAgentTemperature(temperature: number): { valid: boolean; error?: string } {
    if (typeof temperature !== 'number') {
        return { valid: false, error: 'Temperature must be a number' };
    }

    if (temperature < 0 || temperature > 2) {
        return { valid: false, error: 'Temperature must be between 0 and 2' };
    }

    return { valid: true };
}

/**
 * Validates agent max tokens setting
 * @param maxTokens - Maximum tokens
 * @returns Validation result
 */
export function validateAgentMaxTokens(maxTokens: number): { valid: boolean; error?: string } {
    if (typeof maxTokens !== 'number') {
        return { valid: false, error: 'Max tokens must be a number' };
    }

    if (!Number.isInteger(maxTokens)) {
        return { valid: false, error: 'Max tokens must be a whole number' };
    }

    if (maxTokens < 100 || maxTokens > 8000) {
        return { valid: false, error: 'Max tokens must be between 100 and 8000' };
    }

    return { valid: true };
}

// ========================================
// TASK VALIDATION
// ========================================

/**
 * Validates bot task title
 * @param title - Task title
 * @returns Validation result
 */
export function validateTaskTitle(title: string): { valid: boolean; error?: string } {
    if (!title || typeof title !== 'string') {
        return { valid: false, error: 'Task title is required' };
    }

    const trimmed = title.trim();

    if (trimmed.length < 3) {
        return { valid: false, error: 'Task title must be at least 3 characters' };
    }

    if (trimmed.length > 200) {
        return { valid: false, error: 'Task title is too long (max 200 characters)' };
    }

    return { valid: true };
}

/**
 * Validates bot task description
 * @param description - Task description
 * @returns Validation result
 */
export function validateTaskDescription(description?: string): { valid: boolean; error?: string } {
    if (!description) return { valid: true };

    if (typeof description !== 'string') {
        return { valid: false, error: 'Description must be text' };
    }

    if (description.trim().length > 5000) {
        return { valid: false, error: 'Description is too long (max 5000 characters)' };
    }

    return { valid: true };
}

/**
 * Validates task priority
 * @param priority - Task priority level
 * @returns Validation result
 */
export function validateTaskPriority(priority: string): { valid: boolean; error?: string } {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];

    if (!validPriorities.includes(priority.toLowerCase())) {
        return { valid: false, error: 'Invalid priority level' };
    }

    return { valid: true };
}

/**
 * Validates task status
 * @param status - Task status
 * @returns Validation result
 */
export function validateTaskStatus(status: string): { valid: boolean; error?: string } {
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];

    if (!validStatuses.includes(status.toLowerCase())) {
        return { valid: false, error: 'Invalid task status' };
    }

    return { valid: true };
}

/**
 * Validates task due date
 * @param dueDate - Due date string or Date object
 * @returns Validation result
 */
export function validateTaskDueDate(dueDate?: string | Date): { valid: boolean; error?: string } {
    if (!dueDate) return { valid: true };

    const date = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;

    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return { valid: false, error: 'Invalid date format' };
    }

    // Don't allow dates in the past
    const now = new Date();
    if (date < now) {
        return { valid: false, error: 'Due date cannot be in the past' };
    }

    return { valid: true };
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Formats connection status for display
 * @param status - Connection status
 * @returns Formatted status string
 */
export function formatConnectionStatus(status: 'connected' | 'disconnected' | 'connecting'): string {
    const statusMap = {
        connected: '🟢 Connected',
        disconnected: '🔴 Disconnected',
        connecting: '🟡 Connecting...'
    };

    return statusMap[status] || 'Unknown';
}

/**
 * Gets color class for connection status
 * @param status - Connection status
 * @returns Tailwind color class
 */
export function getConnectionStatusColor(status: 'connected' | 'disconnected' | 'connecting'): string {
    const colorMap = {
        connected: 'text-green-600',
        disconnected: 'text-red-600',
        connecting: 'text-yellow-600'
    };

    return colorMap[status] || 'text-gray-600';
}

/**
 * Truncates long text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Checks if user has permission for admin features
 * @param userRole - User's role
 * @returns Whether user has admin access
 */
export function hasAdminAccess(userRole: string): boolean {
    const adminRoles = ['admin', 'super_admin'];
    return adminRoles.includes(userRole.toLowerCase());
}

/**
 * Checks if user can manage agents
 * @param userRole - User's role
 * @returns Whether user can manage agents
 */
export function canManageAgents(userRole: string): boolean {
    const allowedRoles = ['admin', 'super_admin', 'instructor'];
    return allowedRoles.includes(userRole.toLowerCase());
}

/**
 * Checks if conversation can be rated
 * @param messageCount - Number of messages in conversation
 * @returns Whether conversation can be rated
 */
export function canRateConversation(messageCount: number): boolean {
    // Need at least 2 messages (user + AI response) to rate
    return messageCount >= 2;
}

/**
 * Gets estimated reading time for content
 * @param content - Text content
 * @returns Reading time in minutes
 */
export function getReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}

/**
 * Validates export format
 * @param format - Export format (csv, html, json)
 * @returns Whether format is valid
 */
export function validateExportFormat(format: string): boolean {
    const validFormats = ['csv', 'html', 'json'];
    return validFormats.includes(format.toLowerCase());
}

/**
 * Gets message character count without formatting
 * @param message - Message with markdown
 * @returns Character count
 */
export function getPlainTextLength(message: string): number {
    // Remove markdown formatting for accurate character count
    return message
        .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
        .replace(/_([^_]+)_/g, '$1') // italic
        .replace(/`([^`]+)`/g, '$1') // code
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
        .trim()
        .length;
}
