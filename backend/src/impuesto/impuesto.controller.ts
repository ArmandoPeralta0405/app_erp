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
import { ImpuestoService } from './impuesto.service';
import { impuesto as ImpuestoModel } from '@prisma/client';
import { CreateImpuestoDto } from './dto/create_impuesto.dto';
import { UpdateImpuestoDto } from './dto/update_impuesto.dto';
import { AuthGuard } from '@nestjs/passport';


@UseGuards(AuthGuard('jwt'))
@Controller('impuesto')
export class ImpuestoController {
    constructor(private readonly impuestoService: ImpuestoService) { }

    @Get()

    async findAll() {
        return this.impuestoService.findAll();
    }

    @Get(':id')

    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.impuestoService.findOne(id);
    }

    @Post()

    async create(
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
        createImpuestoDto: CreateImpuestoDto,
    ): Promise<ImpuestoModel> {
        return this.impuestoService.create(createImpuestoDto);
    }

    @Patch(':id')

    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
        updateImpuestoDto: UpdateImpuestoDto,
    ): Promise<ImpuestoModel> {
        return this.impuestoService.update(id, updateImpuestoDto);
    }

    @Delete(':id')

    async remove(@Param('id', ParseIntPipe) id: number): Promise<ImpuestoModel> {
        return this.impuestoService.remove(id);
    }
}
