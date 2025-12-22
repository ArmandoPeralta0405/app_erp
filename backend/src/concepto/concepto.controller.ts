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
import { ConceptoService } from './concepto.service';
import { concepto as ConceptoModel } from '@prisma/client';
import { CreateConceptoDto } from './dto/create_concepto.dto';
import { UpdateConceptoDto } from './dto/update_concepto.dto';
import { AuthGuard } from '@nestjs/passport';


@UseGuards(AuthGuard('jwt'))
@Controller('concepto')
export class ConceptoController {
    constructor(private readonly conceptoService: ConceptoService) { }

    @Get()
    async findAll() {
        return this.conceptoService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.conceptoService.findOne(id);
    }

    @Post()
    async create(
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
        createConceptoDto: CreateConceptoDto,
    ): Promise<ConceptoModel> {
        return this.conceptoService.create(createConceptoDto);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
        updateConceptoDto: UpdateConceptoDto,
    ): Promise<ConceptoModel> {
        return this.conceptoService.update(id, updateConceptoDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<ConceptoModel> {
        return this.conceptoService.remove(id);
    }
}
