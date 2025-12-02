import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConfiguracionSistemaDto } from './dto/create-configuracion_sistema.dto';
import { UpdateConfiguracionSistemaDto } from './dto/update-configuracion_sistema.dto';

@Injectable()
export class ConfiguracionSistemaService {
    constructor(private prisma: PrismaService) { }

    create(createDto: CreateConfiguracionSistemaDto) {
        return this.prisma.configuracion_sistema.create({
            data: createDto,
        });
    }

    findAll() {
        return this.prisma.configuracion_sistema.findMany({
            include: {
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_ajuste_positivoTotipo_transaccion: true,
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_ajuste_negativoTotipo_transaccion: true,
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_factura_contado_emitidaTotipo_transaccion: true,
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_factura_contado_recibidaTotipo_transaccion: true,
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_factura_credito_emitidaTotipo_transaccion: true,
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_factura_credito_recibidaTotipo_transaccion: true,
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_nota_credito_emitidaTotipo_transaccion: true,
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_nota_credito_recibidaTotipo_transaccion: true,
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_remision_emitidaTotipo_transaccion: true,
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_remision_recibidaTotipo_transaccion: true,
            },
        });
    }

    async findOne(id: number) {
        const configuracion = await this.prisma.configuracion_sistema.findUnique({
            where: { id_configuracion_sistema: id },
            include: {
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_ajuste_positivoTotipo_transaccion: true,
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_ajuste_negativoTotipo_transaccion: true,
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_factura_contado_emitidaTotipo_transaccion: true,
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_factura_contado_recibidaTotipo_transaccion: true,
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_factura_credito_emitidaTotipo_transaccion: true,
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_factura_credito_recibidaTotipo_transaccion: true,
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_nota_credito_emitidaTotipo_transaccion: true,
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_nota_credito_recibidaTotipo_transaccion: true,
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_remision_emitidaTotipo_transaccion: true,
                tipo_transaccion_configuracion_sistema_id_tipo_transaccion_remision_recibidaTotipo_transaccion: true,
            },
        });

        if (!configuracion) {
            throw new NotFoundException(`Configuración con ID ${id} no encontrada`);
        }

        return configuracion;
    }

    update(id: number, updateDto: UpdateConfiguracionSistemaDto) {
        return this.prisma.configuracion_sistema.update({
            where: { id_configuracion_sistema: id },
            data: updateDto,
        });
    }

    remove(id: number) {
        return this.prisma.configuracion_sistema.update({
            where: { id_configuracion_sistema: id },
            data: { estado: false },
        });
    }
}
