import { PartialType } from '@nestjs/mapped-types';
import { CreateTipo_articuloDto } from './create-tipo_articulo.dto';

export class UpdateTipo_articuloDto extends PartialType(CreateTipo_articuloDto) { }
