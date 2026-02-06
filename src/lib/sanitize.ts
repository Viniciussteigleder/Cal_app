import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param dirty - Potentially unsafe HTML string
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOW_DATA_ATTR: false,
    });
}

/**
 * Sanitizes plain text input by removing potentially dangerous characters
 * @param input - User input string
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized string
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .substring(0, maxLength);
}

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns True if valid email format
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validates phone number format (international)
 * @param phone - Phone number to validate
 * @returns True if valid phone format
 */
export function validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
}

/**
 * Validates Brazilian CPF
 * @param cpf - CPF to validate
 * @returns True if valid CPF
 */
export function validateCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/[^\d]/g, '');

    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCPF)) return false; // All same digits

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

    return true;
}

/**
 * Sanitizes file name to prevent directory traversal attacks
 * @param fileName - Original file name
 * @returns Safe file name
 */
export function sanitizeFileName(fileName: string): string {
    return fileName
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
        .replace(/\.{2,}/g, '.') // Remove multiple dots
        .replace(/^\./, '') // Remove leading dot
        .substring(0, 255); // Limit length
}

/**
 * Validates URL format and protocol
 * @param url - URL to validate
 * @param allowedProtocols - Allowed protocols (default: http, https)
 * @returns True if valid and safe URL
 */
export function validateUrl(
    url: string,
    allowedProtocols: string[] = ['http', 'https']
): boolean {
    try {
        const parsed = new URL(url);
        return allowedProtocols.includes(parsed.protocol.replace(':', ''));
    } catch {
        return false;
    }
}

/**
 * Escapes special characters for SQL (use with caution, prefer parameterized queries)
 * @param value - Value to escape
 * @returns Escaped value
 */
export function escapeSql(value: string): string {
    return value.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

/**
 * Validates and sanitizes numeric input
 * @param value - Value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Sanitized number or null if invalid
 */
export function sanitizeNumber(
    value: string | number,
    min?: number,
    max?: number
): number | null {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num) || !isFinite(num)) return null;
    if (min !== undefined && num < min) return null;
    if (max !== undefined && num > max) return null;

    return num;
}

/**
 * Validates date format and range
 * @param dateString - Date string to validate
 * @param minDate - Minimum allowed date
 * @param maxDate - Maximum allowed date
 * @returns True if valid date
 */
export function validateDate(
    dateString: string,
    minDate?: Date,
    maxDate?: Date
): boolean {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return false;
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;

    return true;
}

/**
 * Sanitizes object by removing null/undefined values and limiting depth
 * @param obj - Object to sanitize
 * @param maxDepth - Maximum nesting depth (default: 5)
 * @returns Sanitized object
 */
export function sanitizeObject(obj: unknown, maxDepth: number = 5): unknown {
    if (maxDepth <= 0) return null;
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj
            .filter(item => item !== null && item !== undefined)
            .map(item => sanitizeObject(item, maxDepth - 1));
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        if (value !== null && value !== undefined) {
            sanitized[key] = sanitizeObject(value, maxDepth - 1);
        }
    }

    return sanitized;
}
