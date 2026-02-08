import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assertPatientBelongsToTenant, TenantMismatchError } from './tenant-guard';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        patient: {
            findFirst: vi.fn(),
        },
    },
}));

import { prisma } from '@/lib/prisma';

const mockFindFirst = prisma.patient.findFirst as ReturnType<typeof vi.fn>;

describe('assertPatientBelongsToTenant', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should pass when patient belongs to tenant', async () => {
        mockFindFirst.mockResolvedValue({ id: 'patient-1' });

        await expect(
            assertPatientBelongsToTenant('patient-1', 'tenant-1')
        ).resolves.toBeUndefined();

        expect(mockFindFirst).toHaveBeenCalledWith({
            where: { id: 'patient-1', tenant_id: 'tenant-1' },
            select: { id: true },
        });
    });

    it('should throw TenantMismatchError when patient does not belong to tenant', async () => {
        mockFindFirst.mockResolvedValue(null);

        await expect(
            assertPatientBelongsToTenant('patient-1', 'wrong-tenant')
        ).rejects.toThrow(TenantMismatchError);
    });

    it('should throw TenantMismatchError when patient does not exist', async () => {
        mockFindFirst.mockResolvedValue(null);

        await expect(
            assertPatientBelongsToTenant('nonexistent', 'tenant-1')
        ).rejects.toThrow(TenantMismatchError);
    });

    it('TenantMismatchError should have correct name and message', async () => {
        mockFindFirst.mockResolvedValue(null);

        try {
            await assertPatientBelongsToTenant('patient-x', 'tenant-y');
            expect.fail('Should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(TenantMismatchError);
            expect((error as TenantMismatchError).name).toBe('TenantMismatchError');
            expect((error as TenantMismatchError).message).toContain('patient-x');
        }
    });

    it('should query with exact tenant_id and patient id', async () => {
        mockFindFirst.mockResolvedValue({ id: 'p-uuid' });

        await assertPatientBelongsToTenant('p-uuid', 't-uuid');

        expect(mockFindFirst).toHaveBeenCalledTimes(1);
        expect(mockFindFirst).toHaveBeenCalledWith({
            where: { id: 'p-uuid', tenant_id: 't-uuid' },
            select: { id: true },
        });
    });
});
