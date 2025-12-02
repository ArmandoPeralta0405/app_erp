import { PartialType } from '@nestjs/mapped-types';
import { CreateClaseDocumentoDto } from './create-clase_documento.dto';

export class UpdateClaseDocumentoDto extends PartialType(CreateClaseDocumentoDto) { }
