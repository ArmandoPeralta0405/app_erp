import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { MovimientoStockService } from './movimiento-stock.service';
import { CreateMovimientoStockDto, UpdateMovimientoStockDto } from './dto/movimiento-stock.dto';

@Controller('movimiento-stock')
export class MovimientoStockController {
    constructor(private readonly movimientoStockService: MovimientoStockService) { }

    // POST /movimiento-stock - Crear movimiento con cabecera y detalle
    @Post()
    create(@Body() createDto: CreateMovimientoStockDto) {
        return this.movimientoStockService.create(createDto);
    }

    // GET /movimiento-stock - Listar movimientos con filtros opcionales
    @Get()
    findAll(
        @Query('id_tipo_transaccion') id_tipo_transaccion?: string,
        @Query('id_sucursal') id_sucursal?: string,
        @Query('id_deposito') id_deposito?: string,
        @Query('fecha_desde') fecha_desde?: string,
        @Query('fecha_hasta') fecha_hasta?: string,
        @Query('id_cliente') id_cliente?: string,
        @Query('id_proveedor') id_proveedor?: string,
    ) {
        return this.movimientoStockService.findAll({
            id_tipo_transaccion: id_tipo_transaccion ? parseInt(id_tipo_transaccion) : undefined,
            id_sucursal: id_sucursal ? parseInt(id_sucursal) : undefined,
            id_deposito: id_deposito ? parseInt(id_deposito) : undefined,
            fecha_desde,
            fecha_hasta,
            id_cliente: id_cliente ? parseInt(id_cliente) : undefined,
            id_proveedor: id_proveedor ? parseInt(id_proveedor) : undefined,
        });
    }

    // GET /movimiento-stock/:id - Obtener un movimiento con su detalle
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.movimientoStockService.findOne(id);
    }

    // GET /movimiento-stock/:id/detalle - Obtener solo el detalle de un movimiento
    @Get(':id/detalle')
    findDetalle(@Param('id', ParseIntPipe) id: number) {
        return this.movimientoStockService.findDetalle(id);
    }

    // PUT /movimiento-stock/:id - Actualizar cabecera del movimiento
    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateMovimientoStockDto,
    ) {
        return this.movimientoStockService.update(id, updateDto);
    }

    // DELETE /movimiento-stock/:id - Eliminar movimiento
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.movimientoStockService.remove(id);
    }
}
