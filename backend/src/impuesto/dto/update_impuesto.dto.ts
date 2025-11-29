import { PartialType } from '@nestjs/mapped-types';
import { CreateImpuestoDto } from './create_impuesto.dto';

export class UpdateImpuestoDto extends PartialType(CreateImpuestoDto) { }
