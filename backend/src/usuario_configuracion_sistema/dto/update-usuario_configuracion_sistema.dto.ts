import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioConfiguracionSistemaDto } from './create-usuario_configuracion_sistema.dto';

export class UpdateUsuarioConfiguracionSistemaDto extends PartialType(CreateUsuarioConfiguracionSistemaDto) { }
