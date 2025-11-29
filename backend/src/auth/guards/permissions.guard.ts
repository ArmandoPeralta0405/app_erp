import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSION_KEY, PermissionAction } from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermission = this.reflector.getAllAndOverride<{ resource: string; action: PermissionAction }>(
            PERMISSION_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredPermission) {
            return true; // Si no hay decorador, permitir acceso (o denegar según política por defecto)
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.roles || user.roles.length === 0) {
            throw new ForbiddenException('Usuario no tiene roles asignados');
        }

        const roleIds = user.roles.map((r: any) => r.id);

        // 💡 LÓGICA HÍBRIDA:
        // Si el recurso empieza con '/', asumimos que es una RUTA (legacy).
        // Si no, asumimos que es un CÓDIGO (nuevo sistema).
        const isPath = requiredPermission.resource.startsWith('/');

        const whereCondition: any = {
            id_rol: { in: roleIds },
            [this.mapActionToColumn(requiredPermission.action)]: true,
        };

        if (isPath) {
            whereCondition.programa = { ruta_acceso: requiredPermission.resource };
        } else {
            whereCondition.programa = { codigo_alfanumerico: requiredPermission.resource };
        }

        const hasPermission = await this.prisma.rol_programa.findFirst({
            where: whereCondition,
        });

        if (!hasPermission) {
            throw new ForbiddenException(`No tienes permiso de ${requiredPermission.action} para este recurso`);
        }

        return true;
    }

    private mapActionToColumn(action: PermissionAction): string {
        switch (action) {
            case 'lectura': return 'acceso_lectura';
            case 'escritura': return 'acceso_escritura';
            case 'eliminacion': return 'acceso_eliminacion';
            default: return 'acceso_lectura';
        }
    }
}
