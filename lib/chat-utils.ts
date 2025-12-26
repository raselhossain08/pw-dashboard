import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - The potentially unsafe HTML string
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'code', 'pre'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
}

/**
 * Validate message content before sending
 * @param content - Message content to validate
 * @returns Object with isValid flag and error message
 */
export function validateMessageContent(content: string): { isValid: boolean; error?: string } {
    if (!content || content.trim().length === 0) {
        return { isValid: false, error: 'Message cannot be empty' };
    }

    if (content.length > 5000) {
        return { isValid: false, error: 'Message too long (max 5000 characters)' };
    }

    return { isValid: true };
}

/**
 * Rate limiter for message sending
 */
export class MessageRateLimiter {
    private messageTimestamps: number[] = [];
    private readonly maxMessages: number;
    private readonly timeWindow: number;

    constructor(maxMessages: number = 5, timeWindowMs: number = 5000) {
        this.maxMessages = maxMessages;
        this.timeWindow = timeWindowMs;
    }

    /**
     * Check if sending a message is allowed
     * @returns Object with allowed flag and retry time
     */
    canSendMessage(): { allowed: boolean; retryAfter?: number } {
        const now = Date.now();

        // Remove timestamps older than the time window
        this.messageTimestamps = this.messageTimestamps.filter(
            timestamp => now - timestamp < this.timeWindow
        );

        if (this.messageTimestamps.length >= this.maxMessages) {
            const oldestTimestamp = this.messageTimestamps[0];
            const retryAfter = Math.ceil((oldestTimestamp + this.timeWindow - now) / 1000);
            return { allowed: false, retryAfter };
        }

        this.messageTimestamps.push(now);
        return { allowed: true };
    }

    /**
     * Reset the rate limiter
     */
    reset(): void {
        this.messageTimestamps = [];
    }
}
/**
 * Get date divider label for a message timestamp
 * @param timestamp - ISO string or Date object
 * @returns Formatted date label (Today, Yesterday, or date)
 */
export function getDateDividerLabel(timestamp: string | Date): string {
    const messageDate = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to compare only dates
    const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (messageDateOnly.getTime() === todayOnly.getTime()) {
        return 'Today';
    } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
        return 'Yesterday';
    } else {
        // Format as "Mon, Jan 15, 2024"
        return messageDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }
}

/**
 * Group messages by date for rendering dividers
 * @param messages - Array of messages with createdAt timestamps
 * @returns Array of messages with date divider flags
 */
export function groupMessagesByDate<T extends { createdAt?: string }>(
    messages: T[]
): Array<T & { showDateDivider?: boolean; dateLabel?: string }> {
    if (!messages || messages.length === 0) return [];

    const result: Array<T & { showDateDivider?: boolean; dateLabel?: string }> = [];
    let currentDate: string | null = null;

    messages.forEach((message) => {
        if (!message.createdAt) {
            result.push(message);
            return;
        }

        const messageDate = new Date(message.createdAt);
        const messageDateStr = messageDate.toDateString();

        if (messageDateStr !== currentDate) {
            currentDate = messageDateStr;
            result.push({
                ...message,
                showDateDivider: true,
                dateLabel: getDateDividerLabel(messageDate),
            });
        } else {
            result.push(message);
        }
    });

    return result;
}