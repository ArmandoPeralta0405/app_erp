import { PartialType } from '@nestjs/mapped-types';
import { CreateConfiguracionSistemaDto } from './create-configuracion_sistema.dto';

export class UpdateConfiguracionSistemaDto extends PartialType(CreateConfiguracionSistemaDto) { }
