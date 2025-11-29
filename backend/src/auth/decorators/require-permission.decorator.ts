import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

export type PermissionAction = 'lectura' | 'escritura' | 'eliminacion';

export const RequirePermission = (resource: string, action: PermissionAction) =>
    SetMetadata(PERMISSION_KEY, { resource, action });
