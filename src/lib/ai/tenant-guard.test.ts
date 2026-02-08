import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assertPatientBelongsToTenant, TenantMismatchError } from './tenant-guard';

const { mockFindFirst, mockWithSession } = vi.hoisted(() => {
    const mockFindFirst = vi.fn();
    const mockWithSession = vi.fn(async (_claims: any, fn: any) => {
        return fn({
            patient: {
                findFirst: mockFindFirst,
            },
        });
    });
    return { mockFindFirst, mockWithSession };
});

vi.mock('@/lib/db', async () => {
    const actual = await vi.importActual<any>('@/lib/db');
    return {
        ...actual,
        withSession: mockWithSession,
    };
});

describe('assertPatientBelongsToTenant', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should pass when patient belongs to tenant', async () => {
        mockFindFirst.mockResolvedValue({ id: 'patient-1' });

        const claims = { user_id: 'u1', tenant_id: 'tenant-1', role: 'TENANT_ADMIN' as const };
        await expect(
            assertPatientBelongsToTenant('patient-1', claims)
        ).resolves.toBeUndefined();

        expect(mockWithSession).toHaveBeenCalledWith(claims, expect.any(Function));
        expect(mockFindFirst).toHaveBeenCalledWith({
            where: { id: 'patient-1', tenant_id: 'tenant-1' },
            select: { id: true },
        });
    });

    it('should throw TenantMismatchError when patient does not belong to tenant', async () => {
        mockFindFirst.mockResolvedValue(null);

        const claims = { user_id: 'u1', tenant_id: 'wrong-tenant', role: 'TENANT_ADMIN' as const };
        await expect(
            assertPatientBelongsToTenant('patient-1', claims)
        ).rejects.toThrow(TenantMismatchError);
    });

    it('should throw TenantMismatchError when patient does not exist', async () => {
        mockFindFirst.mockResolvedValue(null);

        const claims = { user_id: 'u1', tenant_id: 'tenant-1', role: 'TENANT_ADMIN' as const };
        await expect(
            assertPatientBelongsToTenant('nonexistent', claims)
        ).rejects.toThrow(TenantMismatchError);
    });

    it('TenantMismatchError should have correct name and message', async () => {
        mockFindFirst.mockResolvedValue(null);

        try {
            const claims = { user_id: 'u1', tenant_id: 'tenant-y', role: 'TENANT_ADMIN' as const };
            await assertPatientBelongsToTenant('patient-x', claims);
            expect.fail('Should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(TenantMismatchError);
            expect((error as TenantMismatchError).name).toBe('TenantMismatchError');
            expect((error as TenantMismatchError).message).toContain('patient-x');
        }
    });

    it('should query with exact tenant_id and patient id', async () => {
        mockFindFirst.mockResolvedValue({ id: 'p-uuid' });

        const claims = { user_id: 'u1', tenant_id: 't-uuid', role: 'TENANT_ADMIN' as const };
        await assertPatientBelongsToTenant('p-uuid', claims);

        expect(mockFindFirst).toHaveBeenCalledTimes(1);
        expect(mockFindFirst).toHaveBeenCalledWith({
            where: { id: 'p-uuid', tenant_id: 't-uuid' },
            select: { id: true },
        });
    });
});
