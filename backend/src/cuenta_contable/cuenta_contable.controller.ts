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
import { CuentaContableService } from './cuenta_contable.service';
import { cuenta_contable as CuentaContableModel } from '@prisma/client';
import { CreateCuentaContableDto } from './dto/create_cuenta_contable.dto';
import { UpdateCuentaContableDto } from './dto/update_cuenta_contable.dto';
import { AuthGuard } from '@nestjs/passport';


@UseGuards(AuthGuard('jwt'))
@Controller('cuenta-contable')
export class CuentaContableController {
    constructor(private readonly cuentaContableService: CuentaContableService) { }

    @Get()

    async findAll() {
        return this.cuentaContableService.findAll();
    }

    @Get(':id')

    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.cuentaContableService.findOne(id);
    }

    @Post()

    async create(
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
        createCuentaContableDto: CreateCuentaContableDto,
    ): Promise<CuentaContableModel> {
        return this.cuentaContableService.create(createCuentaContableDto);
    }

    @Patch(':id')

    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
        updateCuentaContableDto: UpdateCuentaContableDto,
    ): Promise<CuentaContableModel> {
        return this.cuentaContableService.update(id, updateCuentaContableDto);
    }

    @Delete(':id')

    async remove(@Param('id', ParseIntPipe) id: number): Promise<CuentaContableModel> {
        return this.cuentaContableService.remove(id);
    }
}
