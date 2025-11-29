import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';


@Controller('cliente')
@UseGuards(AuthGuard('jwt'))
export class ClienteController {
    constructor(private readonly clienteService: ClienteService) { }

    @Post()

    create(@Body() createDto: CreateClienteDto) {
        return this.clienteService.create(createDto);
    }

    @Get()

    findAll() {
        return this.clienteService.findAll();
    }

    @Get(':id')

    findOne(@Param('id') id: string) {
        return this.clienteService.findOne(+id);
    }

    @Patch(':id')

    update(@Param('id') id: string, @Body() updateDto: UpdateClienteDto) {
        return this.clienteService.update(+id, updateDto);
    }

    @Delete(':id')

    remove(@Param('id') id: string) {
        return this.clienteService.remove(+id);
    }
}
