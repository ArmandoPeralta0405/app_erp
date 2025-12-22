import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    Patch,
    Delete,
    ValidationPipe,
    UseGuards,
} from '@nestjs/common';
import { GrupoCuentaContableService } from './grupo_cuenta_contable.service';
import { grupo_cuenta_contable as GrupoCuentaContableModel } from '@prisma/client';
import { CreateGrupoCuentaContableDto } from './dto/create_grupo_cuenta_contable.dto';
import { UpdateGrupoCuentaContableDto } from './dto/update_grupo_cuenta_contable.dto';
import { AuthGuard } from '@nestjs/passport';


@UseGuards(AuthGuard('jwt'))
@Controller('grupo-cuenta-contable')
export class GrupoCuentaContableController {
    constructor(private readonly grupoCuentaContableService: GrupoCuentaContableService) { }

    @Get()

    async findAll() {
        return this.grupoCuentaContableService.findAll();
    }

    @Get(':id')

    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.grupoCuentaContableService.findOne(id);
    }

    @Post()

    async create(
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
        createGrupoCuentaContableDto: CreateGrupoCuentaContableDto,
    ): Promise<GrupoCuentaContableModel> {
        return this.grupoCuentaContableService.create(createGrupoCuentaContableDto);
    }

    @Patch(':id')

    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
        updateGrupoCuentaContableDto: UpdateGrupoCuentaContableDto,
    ): Promise<GrupoCuentaContableModel> {
        return this.grupoCuentaContableService.update(id, updateGrupoCuentaContableDto);
    }

    @Delete(':id')

    async remove(@Param('id', ParseIntPipe) id: number): Promise<GrupoCuentaContableModel> {
        return this.grupoCuentaContableService.remove(id);
    }
}
