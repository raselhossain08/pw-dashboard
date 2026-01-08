/**
 * API utility functions for handling common response patterns
 */

/**
 * Transform API response to extract data from nested structures
 * Handles various response formats from the backend:
 * - response.data.data.data (triple nested)
 * - response.data.data (double nested)
 * - response.data (single nested)
 * - response (direct)
 */
export function extractResponseData<T>(response: any): T {
    let data: any;

    // Check for triple nested structure: response.data.data.data
    if (response?.data?.data?.data !== undefined) {
        data = response.data.data.data;
    }
    // Check for double nested structure: response.data.data
    else if (response?.data?.data !== undefined) {
        data = response.data.data;
    }
    // Check for single nested structure: response.data
    else if (response?.data !== undefined) {
        data = response.data;
    }
    // Use response directly
    else {
        data = response;
    }

    return data as T;
}

/**
 * Normalize boolean fields in an object
 * Converts string "true"/"false" to boolean true/false
 * Converts null/undefined to false
 */
export function normalizeBooleanField(data: any, fieldName: string): void {
    if (data && fieldName in data) {
        // Convert string "true"/"false" to boolean if needed
        if (typeof data[fieldName] === 'string') {
            data[fieldName] = data[fieldName].toLowerCase() === 'true';
        }
        // Handle null/undefined as false
        else if (data[fieldName] == null) {
            data[fieldName] = false;
        }
        // Ensure it's a boolean
        else {
            data[fieldName] = Boolean(data[fieldName]);
        }
    }
}

/**
 * Normalize multiple boolean fields in an object
 */
export function normalizeBooleanFields(data: any, fieldNames: string[]): void {
    fieldNames.forEach(fieldName => normalizeBooleanField(data, fieldName));
}

/**
 * Transform API response with optional boolean field normalization
 */
export function transformApiResponse<T>(
    response: any,
    booleanFields?: string[]
): T {
    const data = extractResponseData<T>(response);

    if (booleanFields && booleanFields.length > 0) {
        normalizeBooleanFields(data, booleanFields);
    }

    return data;
}
