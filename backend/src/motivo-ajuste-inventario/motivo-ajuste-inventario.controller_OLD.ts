import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MotivoAjusteInventarioService } from './motivo-ajuste-inventario.service';
import { CreateMotivoAjusteInventarioDto } from './dto/create-motivo-ajuste-inventario.dto';
import { UpdateMotivoAjusteInventarioDto } from './dto/update-motivo-ajuste-inventario.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('motivo-ajuste-inventario')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class MotivoAjusteInventarioController {
    constructor(private readonly motivoService: MotivoAjusteInventarioService) { }

    @Post()
    @RequirePermission('INV_MAN_006', 'escritura')
    create(@Body() createDto: CreateMotivoAjusteInventarioDto) {
        return this.motivoService.create(createDto);
    }

    @Get()
    @RequirePermission('INV_MAN_006', 'lectura')
    findAll() {
        return this.motivoService.findAll();
    }

    @Get(':id')
    @RequirePermission('INV_MAN_006', 'lectura')
    findOne(@Param('id') id: string) {
        return this.motivoService.findOne(+id);
    }

    @Patch(':id')
    @RequirePermission('INV_MAN_006', 'escritura')
    update(@Param('id') id: string, @Body() updateDto: UpdateMotivoAjusteInventarioDto) {
        return this.motivoService.update(+id, updateDto);
    }

    @Delete(':id')
    @RequirePermission('INV_MAN_006', 'eliminacion')
    remove(@Param('id') id: string) {
        return this.motivoService.remove(+id);
    }
}
