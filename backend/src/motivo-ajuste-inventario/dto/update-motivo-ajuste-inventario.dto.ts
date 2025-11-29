import { PartialType } from '@nestjs/mapped-types';
import { CreateMotivoAjusteInventarioDto } from './create-motivo-ajuste-inventario.dto';

export class UpdateMotivoAjusteInventarioDto extends PartialType(CreateMotivoAjusteInventarioDto) { }
