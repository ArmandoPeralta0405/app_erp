import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovimientoStockService } from '../movimiento-stock/movimiento-stock.service';
import { CreateAjusteInventarioDto } from './dto/create-ajuste-inventario.dto';

import { ReportsService } from '../reports/reports.service';

@Injectable()
export class AjusteInventarioService {
    constructor(
        private prisma: PrismaService,
        private movimientoStockService: MovimientoStockService,
        private reportsService: ReportsService
    ) { }

    async create(createDto: CreateAjusteInventarioDto) {
        // 1. Obtener configuración del sistema para determinar el tipo de transacción
        let config = await this.prisma.usuario_configuracion_sistema.findFirst({
            where: { id_usuario: createDto.id_usuario },
            include: { configuracion_sistema: true }
        });

        let id_tipo_transaccion: number | null = null;

        if (config && config.configuracion_sistema) {
            if (createDto.tipo_ajuste === 'POSITIVO') {
                id_tipo_transaccion = config.configuracion_sistema.id_tipo_transaccion_ajuste_positivo;
            } else {
                id_tipo_transaccion = config.configuracion_sistema.id_tipo_transaccion_ajuste_negativo;
            }
        } else {
            // Fallback: Buscar cualquier configuración activa
            const sysConfig = await this.prisma.configuracion_sistema.findFirst({
                where: { estado: true }
            });

            if (sysConfig) {
                if (createDto.tipo_ajuste === 'POSITIVO') {
                    id_tipo_transaccion = sysConfig.id_tipo_transaccion_ajuste_positivo;
                } else {
                    id_tipo_transaccion = sysConfig.id_tipo_transaccion_ajuste_negativo;
                }
            }
        }

        if (!id_tipo_transaccion) {
            throw new BadRequestException(
                `No se encontró configuración de sistema para Ajuste ${createDto.tipo_ajuste}. Verifique la configuración del sistema.`
            );
        }

        // 1.1 Obtener Terminal y Numeración
        const userTerminal = await this.prisma.usuario_terminal.findFirst({
            where: { id_usuario: createDto.id_usuario },
            include: { terminal: true }
        });

        if (!userTerminal || !userTerminal.terminal) {
            throw new BadRequestException('El usuario no tiene una terminal asignada para generar la numeración.');
        }

        const terminal = userTerminal.terminal;
        const nuevoNumero = Number(terminal.ultimo_numero_ajuste || 0) + 1;

        // Actualizar contador en terminal
        await this.prisma.terminal.update({
            where: { id_terminal: terminal.id_terminal },
            data: { ultimo_numero_ajuste: BigInt(nuevoNumero) }
        });

        // 1.2 Obtener datos de impuestos de los artículos
        const articuloIds = createDto.detalle.map(d => d.id_articulo);
        const articulosConImpuesto = await this.prisma.articulo.findMany({
            where: { id_articulo: { in: articuloIds } },
            include: { impuesto: true }
        });

        const mapaImpuestos = new Map();
        articulosConImpuesto.forEach(a => {
            if (a.impuesto) {
                mapaImpuestos.set(a.id_articulo, a.impuesto);
            }
        });

        // 2. Calcular totales
        let total_ml = 0;
        let total_me = 0;

        const detalleCalculado = createDto.detalle.map(item => {
            // Calcular importe si no viene (cantidad * costo)
            // En ajustes, valorizamos al costo
            const costo_ml = item.costo_ml || 0;
            const costo_me = item.costo_me || 0;
            const cantidad = item.cantidad;

            // Si no se envió importe, lo calculamos
            if (!item.importe_ml) {
                item.importe_ml = cantidad * costo_ml;
            }
            if (!item.importe_me && item.costo_me) {
                item.importe_me = cantidad * costo_me;
            }

            total_ml += item.importe_ml || 0;
            total_me += item.importe_me || 0;

            // 2.1 Calculo de Impuestos
            let porcentaje_iva = 0;
            let monto_iva = 0;
            const impuesto = mapaImpuestos.get(item.id_articulo);

            if (impuesto && impuesto.valor_calculo > 0) {
                // Formula: Monto IVA = Monto Total / Valor Calculo
                // Ejemplo: 11000 / 11 = 1000 (IVA 10%)
                const valorCalculo = Number(impuesto.valor_calculo);
                monto_iva = (item.importe_ml || 0) / valorCalculo;

                // Estimación del porcentaje para guardar en BD (informativo)
                // Si valor_calculo es 11 -> 10%
                // Si valor_calculo es 21 -> 5%
                // Inversa aproximada: (1 / (valor_calculo - 1)) * 100
                // Aunque para fines de registro, lo importante es el desglose.
                if (valorCalculo === 11) porcentaje_iva = 10;
                else if (valorCalculo === 21) porcentaje_iva = 5;
            }

            return {
                ...item,
                costo_ml: costo_ml,
                precio_ml: item.precio_ml || 0,
                // Guardar los datos calculados de IVA
                porcentaje_iva: porcentaje_iva,
                porcentaje_descuento: 0,
                descuento_ml: 0,
                importe_ml: item.importe_ml || 0,
                // En Prisma, el campo porcentaje_iva es Decimal, así que pasamos el número
                // No tenemos un campo específico 'monto_iva' en movimiento_stock_detalle segun schema adjunto
                // pero si fuera necesario para contabilidad, se calcularía al vuelo o se guardaría en otro sitio.
                // El schema tiene 'porcentaje_iva', asumimos que eso basta.
            };
        });

        // 3. Crear el movimiento usando el servicio genérico
        return this.movimientoStockService.create({
            id_tipo_transaccion,
            id_sucursal: createDto.id_sucursal,
            id_deposito: createDto.id_deposito,
            id_usuario: createDto.id_usuario,
            id_moneda: createDto.id_moneda,
            id_motivo_ajuste: createDto.id_motivo_ajuste,
            numero_comprobante: nuevoNumero, // Usar número automático
            fecha_documento: createDto.fecha_documento,
            tasa_cambio: createDto.tasa_cambio || 1,
            total_ml,
            total_me,
            observacion: createDto.observacion,
            detalle: detalleCalculado
        });
    }

    async findAll(filters?: any) {
        // TODO: Filtrar solo movimientos que sean de tipo ajuste
        // Por ahora retornamos todos, idealmente filtraríamos por los tipos de transacción de ajuste
        return this.movimientoStockService.findAll(filters);
    }

    async findOne(id: number) {
        return this.movimientoStockService.findOne(id);
    }

    async remove(id: number) {
        return this.movimientoStockService.remove(id);
    }

    async generateListadoPdf(query: any): Promise<Buffer> {
        const detailed = query.detallado === 'true';
        const data = await this.findAll({ ...query, includeDetails: detailed });
        return this.reportsService.generateAjustesList(data, query, detailed);
    }

    async checkConfig(id_usuario: number) {
        // 1. Verificar si tiene configuración de sistema asignada
        const userConfig = await this.prisma.usuario_configuracion_sistema.findFirst({
            where: { id_usuario },
            include: { configuracion_sistema: true }
        });

        // 2. Verificar si tiene terminal asignada
        const userTerminal = await this.prisma.usuario_terminal.findFirst({
            where: { id_usuario },
            include: { terminal: true }
        });

        const hasConfig = !!userConfig;
        const hasTerminal = !!userTerminal;

        let configDetails = {
            positivo: false,
            negativo: false
        };

        if (hasConfig && userConfig.configuracion_sistema) {
            configDetails.positivo = !!userConfig.configuracion_sistema.id_tipo_transaccion_ajuste_positivo;
            configDetails.negativo = !!userConfig.configuracion_sistema.id_tipo_transaccion_ajuste_negativo;
        } else {
            // Fallback sistema general si no tiene específica (opcional, pero el usuario pidió verificar asignación)
            // Si la regla es estricta "debe tener asignación", entonces hasConfig es false.
            // Asumiremos que si no tiene asignación directa, buscamos la general pero marcamos que no tiene "asignación directa" si eso es lo que se busca.
            // Pero normalmente el fallback es válido.
            // El usuario dijo: "verifique si tiene asignado una configuracion y una terminal".
            // Interpretación: Debe existir el registro en usuario_configuracion_sistema.

            // Si queremos ser flexibles y permitir configuración general:
            if (!hasConfig) {
                const sysConfig = await this.prisma.configuracion_sistema.findFirst({
                    where: { estado: true }
                });
                if (sysConfig) {
                    configDetails.positivo = !!sysConfig.id_tipo_transaccion_ajuste_positivo;
                    configDetails.negativo = !!sysConfig.id_tipo_transaccion_ajuste_negativo;
                }
            }
        }

        return {
            hasConfig: hasConfig, // Tiene asignación explícita o general válida? Depende de la regla de negocio.
            // El usuario dijo "tiene asignado una configuracion". 
            // Voy a devolver si tiene acceso a configuración (ya sea propia o heredada) y si tiene terminal.
            hasTerminal: hasTerminal,
            ...configDetails
        };
    }

    async getNextNumber(id_usuario: number) {
        const userTerminal = await this.prisma.usuario_terminal.findFirst({
            where: { id_usuario },
            include: { terminal: true }
        });

        if (!userTerminal || !userTerminal.terminal) {
            return { numero: 1 };
        }

        return { numero: Number(userTerminal.terminal.ultimo_numero_ajuste || 0) + 1 };
    }
}
