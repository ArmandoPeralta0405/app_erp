import { PartialType } from '@nestjs/mapped-types';
import { CreateArticuloCodigoBarraDto } from './create-articulo_codigo_barra.dto';

export class UpdateArticuloCodigoBarraDto extends PartialType(CreateArticuloCodigoBarraDto) { }
