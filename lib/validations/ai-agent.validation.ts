/**
 * AI Agent Form Validation
 * Provides comprehensive validation for AI agent creation and updates
 */

export interface AgentFormData {
    name: string;
    description: string;
    agentType: string;
    knowledgeBase?: string[];
    status?: "active" | "inactive" | "training";
}

export interface ValidationErrors {
    name?: string;
    description?: string;
    agentType?: string;
    knowledgeBase?: string;
    status?: string;
}

/**
 * Validates agent name field
 */
export function validateAgentName(name: string): string | undefined {
    if (!name || name.trim().length === 0) {
        return "Agent name is required";
    }
    if (name.trim().length < 3) {
        return "Agent name must be at least 3 characters long";
    }
    if (name.trim().length > 100) {
        return "Agent name must not exceed 100 characters";
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
        return "Agent name can only contain letters, numbers, spaces, hyphens, and underscores";
    }
    return undefined;
}

/**
 * Validates agent description field
 */
export function validateAgentDescription(description: string): string | undefined {
    if (!description || description.trim().length === 0) {
        return "Agent description is required";
    }
    if (description.trim().length < 10) {
        return "Description must be at least 10 characters long";
    }
    if (description.trim().length > 500) {
        return "Description must not exceed 500 characters";
    }
    return undefined;
}

/**
 * Validates agent type field
 */
export function validateAgentType(agentType: string): string | undefined {
    const validTypes = [
        "Course Advisor",
        "Study Assistant",
        "Assignment Helper",
        "Progress Tracker",
        "Language Tutor",
        "Custom",
    ];

    if (!agentType || agentType.trim().length === 0) {
        return "Agent type is required";
    }

    if (!validTypes.includes(agentType)) {
        return "Invalid agent type selected";
    }

    return undefined;
}

/**
 * Validates knowledge base selection
 */
export function validateKnowledgeBase(knowledgeBase?: string[]): string | undefined {
    if (!knowledgeBase || knowledgeBase.length === 0) {
        return "Please select at least one knowledge base";
    }

    if (knowledgeBase.length > 10) {
        return "Cannot select more than 10 knowledge bases";
    }

    return undefined;
}

/**
 * Validates agent status field
 */
export function validateAgentStatus(status?: string): string | undefined {
    const validStatuses = ["active", "inactive", "training"];

    if (status && !validStatuses.includes(status)) {
        return "Invalid status value";
    }

    return undefined;
}

/**
 * Validates entire agent form data
 */
export function validateAgentForm(formData: AgentFormData): ValidationErrors {
    const errors: ValidationErrors = {};

    const nameError = validateAgentName(formData.name);
    if (nameError) errors.name = nameError;

    const descError = validateAgentDescription(formData.description);
    if (descError) errors.description = descError;

    const typeError = validateAgentType(formData.agentType);
    if (typeError) errors.agentType = typeError;

    const kbError = validateKnowledgeBase(formData.knowledgeBase);
    if (kbError) errors.knowledgeBase = kbError;

    const statusError = validateAgentStatus(formData.status);
    if (statusError) errors.status = statusError;

    return errors;
}

/**
 * Checks if form has any validation errors
 */
export function hasValidationErrors(errors: ValidationErrors): boolean {
    return Object.keys(errors).length > 0;
}

/**
 * Sanitizes form data before submission
 */
export function sanitizeAgentFormData(formData: AgentFormData): AgentFormData {
    return {
        name: formData.name.trim(),
        description: formData.description.trim(),
        agentType: formData.agentType.trim(),
        knowledgeBase: formData.knowledgeBase || [],
        status: formData.status || "active",
    };
}
