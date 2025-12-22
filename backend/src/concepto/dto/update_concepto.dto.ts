import { PartialType } from '@nestjs/mapped-types';
import { CreateConceptoDto } from './create_concepto.dto';

export class UpdateConceptoDto extends PartialType(CreateConceptoDto) { }
