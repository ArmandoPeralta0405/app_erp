import { Controller, Get, Query } from '@nestjs/common';
import { ArticuloDepositoService } from './articulo-deposito.service';

@Controller('articulo-deposito')
export class ArticuloDepositoController {
    constructor(private readonly articuloDepositoService: ArticuloDepositoService) { }

    @Get('existencias')
    getExistencias(@Query() query: any) {
        return this.articuloDepositoService.findExistencias(query);
    }
}
