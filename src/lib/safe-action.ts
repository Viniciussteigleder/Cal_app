import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { RBAC_MATRIX, type Action, type Resource, type Role } from '@/lib/rbac';
import { prisma as db } from '@/lib/db';
import { APIError } from '@/lib/api-error';

type UserSession = {
    id: string;
    email: string;
    role: Role;
    tenant_id: string;
};

type ActionContext = {
    user: UserSession;
    db: typeof db;
};

/**
 * Creates a safe server action with built-in:
 * 1. Authentication Check
 * 2. Input Validation (Zod)
 * 3. RBAC Authorization
 * 4. Error Handling
 */
export const createSafeAction = <TInput, TOutput>(
    schema: z.Schema<TInput>,
    opts: {
        action: Action;
        resource: Resource;
    },
    handler: (input: TInput, ctx: ActionContext) => Promise<TOutput>
) => {
    return async (input: TInput): Promise<{ data?: TOutput; error?: string }> => {
        try {
            // 1. Validate Input
            const parseResult = schema.safeParse(input);
            if (!parseResult.success) {
                throw new Error(`Validation Error: ${parseResult.error.message}`);
            }
            const data = parseResult.data;

            // 2. Authentication & Session
            const cookieStore = cookies();
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        getAll() { return cookieStore.getAll() },
                        setAll(cookiesToSet) {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        },
                    },
                }
            );

            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                throw new Error('Unauthorized: No active session');
            }

            // 3. Extract Metadata (Tenant & Role)
            // Assumption: These are stored in user_metadata or we fetch from DB. 
            // For improved security, we fetch the User record from DB to ensure it's up to date.
            const dbUser = await db.user.findUnique({
                where: { id: user.id }, // Assuming Supabase Auth ID matches our DB ID. If not, map via email.
                select: { id: true, email: true, role: true, tenant_id: true, status: true }
            });

            if (!dbUser) {
                // Fallback: If using Supabase strict auth, maybe user is just in Auth but not in our DB yet?
                // For critical apps, failure here is correct.
                throw new Error('Unauthorized: User profile not found');
            }

            if (dbUser.status !== 'active') {
                throw new Error('Unauthorized: User account is inactive');
            }

            const session: UserSession = {
                id: dbUser.id,
                email: dbUser.email,
                role: dbUser.role as Role,
                tenant_id: dbUser.tenant_id,
            };

            // 4. RBAC Check
            const allowedRoles = RBAC_MATRIX[opts.resource]?.[opts.action];
            if (!allowedRoles || !allowedRoles.includes(session.role)) {
                throw new Error(`Forbidden: Role ${session.role} cannot ${opts.action} ${opts.resource}`);
            }

            // 5. Execute Handler with Context
            const result = await handler(data, { user: session, db });

            return { data: result };

        } catch (error: any) {
            console.error('SafeAction Error:', error);
            // Determine if we should expose the verified error message or a generic one
            return { error: error.message || 'Internal Server Error' };
        }
    };
};
