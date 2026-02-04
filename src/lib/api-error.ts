import { NextResponse } from 'next/server';

/**
 * Custom API Error class with status code and error code
 */
export class APIError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'APIError';
    }
}

/**
 * Common API error types
 */
export const APIErrors = {
    // 400 Bad Request
    BadRequest: (message: string = 'Bad request', details?: any) =>
        new APIError(400, message, 'BAD_REQUEST', details),

    InvalidInput: (message: string = 'Invalid input', details?: any) =>
        new APIError(400, message, 'INVALID_INPUT', details),

    ValidationError: (message: string = 'Validation failed', details?: any) =>
        new APIError(400, message, 'VALIDATION_ERROR', details),

    // 401 Unauthorized
    Unauthorized: (message: string = 'Unauthorized') =>
        new APIError(401, message, 'UNAUTHORIZED'),

    InvalidCredentials: (message: string = 'Invalid credentials') =>
        new APIError(401, message, 'INVALID_CREDENTIALS'),

    TokenExpired: (message: string = 'Token expired') =>
        new APIError(401, message, 'TOKEN_EXPIRED'),

    // 403 Forbidden
    Forbidden: (message: string = 'Forbidden') =>
        new APIError(403, message, 'FORBIDDEN'),

    InsufficientPermissions: (message: string = 'Insufficient permissions') =>
        new APIError(403, message, 'INSUFFICIENT_PERMISSIONS'),

    // 404 Not Found
    NotFound: (resource: string = 'Resource') =>
        new APIError(404, `${resource} not found`, 'NOT_FOUND'),

    // 409 Conflict
    Conflict: (message: string = 'Resource already exists') =>
        new APIError(409, message, 'CONFLICT'),

    // 429 Too Many Requests
    RateLimitExceeded: (message: string = 'Rate limit exceeded') =>
        new APIError(429, message, 'RATE_LIMIT_EXCEEDED'),

    // 500 Internal Server Error
    InternalServerError: (message: string = 'Internal server error') =>
        new APIError(500, message, 'INTERNAL_SERVER_ERROR'),

    DatabaseError: (message: string = 'Database error') =>
        new APIError(500, message, 'DATABASE_ERROR'),

    ExternalServiceError: (service: string) =>
        new APIError(500, `${service} service error`, 'EXTERNAL_SERVICE_ERROR'),

    // 503 Service Unavailable
    ServiceUnavailable: (message: string = 'Service temporarily unavailable') =>
        new APIError(503, message, 'SERVICE_UNAVAILABLE'),
};

/**
 * Handles API errors and returns appropriate NextResponse
 * @param error - Error object
 * @returns NextResponse with error details
 */
export function handleAPIError(error: unknown): NextResponse {
    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', error);
    }

    // Handle known APIError
    if (error instanceof APIError) {
        return NextResponse.json(
            {
                error: error.message,
                code: error.code,
                details: error.details,
            },
            { status: error.statusCode }
        );
    }

    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
        return NextResponse.json(
            {
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: error,
            },
            { status: 400 }
        );
    }

    // Handle generic errors
    if (error instanceof Error) {
        // Don't expose internal error messages in production
        const message =
            process.env.NODE_ENV === 'development'
                ? error.message
                : 'An unexpected error occurred';

        return NextResponse.json(
            {
                error: message,
                code: 'INTERNAL_SERVER_ERROR',
            },
            { status: 500 }
        );
    }

    // Unknown error type
    return NextResponse.json(
        {
            error: 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR',
        },
        { status: 500 }
    );
}

/**
 * Wraps an API route handler with error handling
 * @param handler - API route handler function
 * @returns Wrapped handler with error handling
 */
export function withErrorHandler(
    handler: (request: Request, context?: any) => Promise<NextResponse>
) {
    return async (request: Request, context?: any): Promise<NextResponse> => {
        try {
            return await handler(request, context);
        } catch (error) {
            return handleAPIError(error);
        }
    };
}

/**
 * Validates request body against a schema
 * @param request - Next request object
 * @param schema - Zod schema for validation
 * @returns Parsed and validated data
 * @throws APIError if validation fails
 */
export async function validateRequestBody<T>(
    request: Request,
    schema: any
): Promise<T> {
    try {
        const body = await request.json();
        return schema.parse(body);
    } catch (error) {
        if (error && typeof error === 'object' && 'issues' in error) {
            throw APIErrors.ValidationError('Invalid request body', error);
        }
        throw APIErrors.BadRequest('Invalid JSON in request body');
    }
}

/**
 * Validates query parameters against a schema
 * @param url - Request URL
 * @param schema - Zod schema for validation
 * @returns Parsed and validated query parameters
 * @throws APIError if validation fails
 */
export function validateQueryParams<T>(url: string, schema: any): T {
    try {
        const { searchParams } = new URL(url);
        const params = Object.fromEntries(searchParams.entries());
        return schema.parse(params);
    } catch (error) {
        if (error && typeof error === 'object' && 'issues' in error) {
            throw APIErrors.ValidationError('Invalid query parameters', error);
        }
        throw APIErrors.BadRequest('Invalid query parameters');
    }
}

/**
 * Creates a success response
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with success data
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json(
        {
            success: true,
            data,
        },
        { status }
    );
}

/**
 * Creates a paginated response
 * @param data - Array of items
 * @param total - Total count
 * @param page - Current page
 * @param limit - Items per page
 * @returns NextResponse with paginated data
 */
export function paginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): NextResponse {
    return NextResponse.json({
        success: true,
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total,
        },
    });
}
