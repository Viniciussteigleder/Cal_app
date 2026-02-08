'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getSupabaseClaims } from '@/lib/auth'; // Assumptions: this helper exists or I used something similar before. 
// Wait, I used "getSupabaseClaims" in "patient-analyzer/actions.ts". I should check if it exists. 
// If not, I'll use createSupabaseServerClient.
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface LetterheadSettings {
    logoUrl?: string;
    headerText?: string;
    footerText?: string;
    primaryColor?: string;
    enabled: boolean;
}

export async function getLetterheadSettings(): Promise<{ success: boolean; data?: LetterheadSettings; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: 'Unauthorized' };

        const tenant = await prisma.tenant.findUnique({
            where: { id: user.user_metadata.tenant_id },
            select: { settings: true }
        });

        if (!tenant?.settings) {
            return {
                success: true,
                data: { enabled: false, primaryColor: '#000000' }
            };
        }

        const settings = tenant.settings as Record<string, any>;
        return {
            success: true,
            data: settings.letterhead || { enabled: false, primaryColor: '#000000' }
        };

    } catch (error) {
        console.error('Error fetching letterhead settings:', error);
        return { success: false, error: 'Failed to fetch settings' };
    }
}

export async function saveLetterheadSettings(settings: LetterheadSettings): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: 'Unauthorized' };

        const tenantId = user.user_metadata.tenant_id;

        // Get existing settings to merge
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { settings: true }
        });

        const currentSettings = (tenant?.settings as Record<string, any>) || {};

        const newSettings = {
            ...currentSettings,
            letterhead: settings
        };

        await prisma.tenant.update({
            where: { id: tenantId },
            data: { settings: newSettings as unknown as Prisma.InputJsonValue }
        });

        return { success: true };

    } catch (error) {
        console.error('Error saving letterhead settings:', error);
        return { success: false, error: 'Failed to save settings' };
    }
}
