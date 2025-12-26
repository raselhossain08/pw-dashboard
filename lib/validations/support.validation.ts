/**
 * Support Tickets Validation
 * Provides comprehensive validation for support ticket system
 */

import { TicketPriority, TicketStatus, TicketCategory } from '@/services/support.service';

export interface TicketFormData {
  subject: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
  attachments?: string[];
  tags?: string[];
}

export interface ValidationErrors {
  subject?: string;
  description?: string;
  category?: string;
  priority?: string;
  message?: string;
  rating?: string;
  assignedTo?: string;
}

/**
 * Validates ticket subject
 */
export function validateSubject(subject: string): string | undefined {
  if (!subject || subject.trim().length === 0) {
    return 'Subject is required';
  }
  if (subject.trim().length < 5) {
    return 'Subject must be at least 5 characters long';
  }
  if (subject.trim().length > 200) {
    return 'Subject must not exceed 200 characters';
  }
  return undefined;
}

/**
 * Validates ticket description
 */
export function validateDescription(description: string): string | undefined {
  if (!description || description.trim().length === 0) {
    return 'Description is required';
  }
  if (description.trim().length < 10) {
    return 'Description must be at least 10 characters long';
  }
  if (description.trim().length > 5000) {
    return 'Description must not exceed 5,000 characters';
  }
  return undefined;
}

/**
 * Validates ticket category
 */
export function validateCategory(category: string): string | undefined {
  const validCategories: TicketCategory[] = [
    'technical',
    'billing',
    'course_content',
    'account',
    'refund',
    'feature_request',
    'bug_report',
    'other',
  ];

  if (!category) {
    return 'Category is required';
  }

  if (!validCategories.includes(category as TicketCategory)) {
    return 'Invalid category selected';
  }

  return undefined;
}

/**
 * Validates ticket priority
 */
export function validatePriority(priority: string): string | undefined {
  const validPriorities: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];

  if (!priority) {
    return undefined; // Priority is optional
  }

  if (!validPriorities.includes(priority as TicketPriority)) {
    return 'Invalid priority level';
  }

  return undefined;
}

/**
 * Validates ticket status
 */
export function validateStatus(status: string): string | undefined {
  const validStatuses: TicketStatus[] = [
    'open',
    'in-progress',
    'pending',
    'closed',
    'escalated',
    'resolved',
    'waiting_for_customer',
  ];

  if (!status) {
    return 'Status is required';
  }

  if (!validStatuses.includes(status as TicketStatus)) {
    return 'Invalid status';
  }

  return undefined;
}

/**
 * Validates reply message
 */
export function validateReplyMessage(message: string): string | undefined {
  if (!message || message.trim().length === 0) {
    return 'Reply message is required';
  }
  if (message.trim().length < 3) {
    return 'Reply must be at least 3 characters long';
  }
  if (message.trim().length > 2000) {
    return 'Reply must not exceed 2,000 characters';
  }
  return undefined;
}

/**
 * Validates ticket rating
 */
export function validateRating(rating: number): string | undefined {
  if (rating === undefined || rating === null) {
    return 'Rating is required';
  }
  if (!Number.isInteger(rating)) {
    return 'Rating must be a whole number';
  }
  if (rating < 1 || rating > 5) {
    return 'Rating must be between 1 and 5';
  }
  return undefined;
}

/**
 * Validates feedback text
 */
export function validateFeedback(feedback: string): string | undefined {
  if (!feedback) {
    return undefined; // Feedback is optional
  }
  if (feedback.trim().length > 1000) {
    return 'Feedback must not exceed 1,000 characters';
  }
  return undefined;
}

/**
 * Validates user assignment
 */
export function validateAssignment(userId: string): string | undefined {
  if (!userId || userId.trim().length === 0) {
    return 'Please select a user to assign';
  }
  // Basic MongoDB ObjectId validation (24 hex characters)
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  if (!objectIdPattern.test(userId)) {
    return 'Invalid user ID format';
  }
  return undefined;
}

/**
 * Validates attachment URLs
 */
export function validateAttachments(attachments: string[]): string | undefined {
  if (!attachments || attachments.length === 0) {
    return undefined; // Attachments are optional
  }

  if (attachments.length > 10) {
    return 'Maximum 10 attachments allowed';
  }

  // Basic URL validation
  const urlPattern = /^https?:\/\/.+/;
  for (const url of attachments) {
    if (!urlPattern.test(url)) {
      return 'Invalid attachment URL format';
    }
  }

  return undefined;
}

/**
 * Validates tags array
 */
export function validateTags(tags: string[]): string | undefined {
  if (!tags || tags.length === 0) {
    return undefined; // Tags are optional
  }

  if (tags.length > 10) {
    return 'Maximum 10 tags allowed';
  }

  for (const tag of tags) {
    if (tag.trim().length === 0) {
      return 'Tags cannot be empty';
    }
    if (tag.length > 50) {
      return 'Each tag must not exceed 50 characters';
    }
  }

  return undefined;
}

/**
 * Validates entire ticket form
 */
export function validateTicketForm(formData: TicketFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  const subjectError = validateSubject(formData.subject);
  if (subjectError) errors.subject = subjectError;

  const descriptionError = validateDescription(formData.description);
  if (descriptionError) errors.description = descriptionError;

  const categoryError = validateCategory(formData.category);
  if (categoryError) errors.category = categoryError;

  if (formData.priority) {
    const priorityError = validatePriority(formData.priority);
    if (priorityError) errors.priority = priorityError;
  }

  if (formData.attachments) {
    const attachmentsError = validateAttachments(formData.attachments);
    if (attachmentsError) errors.description = attachmentsError;
  }

  if (formData.tags) {
    const tagsError = validateTags(formData.tags);
    if (tagsError) errors.description = tagsError;
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
 * Sanitizes ticket subject
 */
export function sanitizeSubject(subject: string): string {
  return subject
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .substring(0, 200); // Enforce max length
}

/**
 * Sanitizes ticket description
 */
export function sanitizeDescription(description: string): string {
  return description
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .substring(0, 5000); // Enforce max length
}

/**
 * Sanitizes reply message
 */
export function sanitizeReplyMessage(message: string): string {
  return message
    .trim()
    .replace(/\s+/g, ' ')
    .substring(0, 2000);
}

/**
 * Sanitizes feedback text
 */
export function sanitizeFeedback(feedback: string): string {
  return feedback
    .trim()
    .replace(/\s+/g, ' ')
    .substring(0, 1000);
}

/**
 * Sanitizes tags
 */
export function sanitizeTags(tags: string[]): string[] {
  return tags
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .slice(0, 10) // Max 10 tags
    .map(tag => tag.substring(0, 50)); // Max 50 chars per tag
}

/**
 * Formats ticket number
 */
export function formatTicketNumber(num: number): string {
  return `TKT-${String(num).padStart(6, '0')}`;
}

/**
 * Gets priority display name
 */
export function getPriorityLabel(priority: TicketPriority): string {
  const labels: Record<TicketPriority, string> = {
    low: 'Low Priority',
    medium: 'Medium Priority',
    high: 'High Priority',
    urgent: 'Urgent',
  };
  return labels[priority] || priority;
}

/**
 * Gets status display name
 */
export function getStatusLabel(status: TicketStatus): string {
  const labels: Record<TicketStatus, string> = {
    open: 'Open',
    'in-progress': 'In Progress',
    pending: 'Pending',
    closed: 'Closed',
    escalated: 'Escalated',
    resolved: 'Resolved',
    waiting_for_customer: 'Waiting for Customer',
  };
  return labels[status] || status;
}

/**
 * Gets category display name
 */
export function getCategoryLabel(category: TicketCategory): string {
  const labels: Record<TicketCategory, string> = {
    technical: 'Technical Support',
    billing: 'Billing',
    course_content: 'Course Content',
    account: 'Account',
    refund: 'Refund Request',
    feature_request: 'Feature Request',
    bug_report: 'Bug Report',
    other: 'Other',
  };
  return labels[category] || category;
}

/**
 * Validates search query
 */
export function validateSearchQuery(query: string): boolean {
  // Allow alphanumeric, spaces, hyphens, and basic punctuation
  const validPattern = /^[a-zA-Z0-9\s\-_.,!?@#]*$/;
  return validPattern.test(query) && query.length <= 200;
}

/**
 * Checks if ticket can be edited by user
 */
export function canEditTicket(
  ticket: { userId?: { _id: string } | string; status: TicketStatus },
  currentUserId: string,
  isAdmin: boolean
): boolean {
  // Admins can always edit
  if (isAdmin) return true;

  // Can't edit closed or resolved tickets
  if (ticket.status === 'closed' || ticket.status === 'resolved') {
    return false;
  }

  // Users can edit their own tickets
  const ticketUserId = typeof ticket.userId === 'string' 
    ? ticket.userId 
    : ticket.userId?._id;
  
  return ticketUserId === currentUserId;
}

/**
 * Checks if ticket can be deleted by user
 */
export function canDeleteTicket(
  ticket: { userId?: { _id: string } | string },
  currentUserId: string,
  isAdmin: boolean
): boolean {
  // Only admins can delete tickets
  return isAdmin;
}

/**
 * Gets priority color class
 */
export function getPriorityColor(priority: TicketPriority): string {
  const colors: Record<TicketPriority, string> = {
    low: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-red-600 bg-red-100',
    urgent: 'text-red-700 bg-red-200',
  };
  return colors[priority] || 'text-gray-600 bg-gray-100';
}

/**
 * Gets status color class
 */
export function getStatusColor(status: TicketStatus): string {
  const colors: Record<TicketStatus, string> = {
    open: 'text-blue-600 bg-blue-100',
    'in-progress': 'text-purple-600 bg-purple-100',
    pending: 'text-yellow-600 bg-yellow-100',
    closed: 'text-gray-600 bg-gray-100',
    escalated: 'text-red-600 bg-red-100',
    resolved: 'text-green-600 bg-green-100',
    waiting_for_customer: 'text-orange-600 bg-orange-100',
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
}

/**
 * Calculates time elapsed since date
 */
export function getTimeElapsed(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return past.toLocaleDateString();
}
