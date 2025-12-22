import { PartialType } from '@nestjs/mapped-types';
import { CreateGrupoCuentaContableDto } from './create_grupo_cuenta_contable.dto';

export class UpdateGrupoCuentaContableDto extends PartialType(CreateGrupoCuentaContableDto) { }
