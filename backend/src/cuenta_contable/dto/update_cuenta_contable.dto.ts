import { PartialType } from '@nestjs/mapped-types';
import { CreateCuentaContableDto } from './create_cuenta_contable.dto';

export class UpdateCuentaContableDto extends PartialType(CreateCuentaContableDto) { }
