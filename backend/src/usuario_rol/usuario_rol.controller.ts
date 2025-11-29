import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  ParseIntPipe,
  ValidationPipe,
  Get,
  UseGuards,
} from '@nestjs/common';
import { UsuarioRolService } from './usuario_rol.service';
import { CreateUsuarioRolDto } from './dto/create_usuario_rol.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('usuario_rol')
export class UsuarioRolController {
  constructor(private readonly usuarioRolService: UsuarioRolService) { }

  @Post()
  async assignRole(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createUsuarioRolDto: CreateUsuarioRolDto,
  ) {
    return this.usuarioRolService.create(createUsuarioRolDto);
  }

  @Delete('usuario/:idUsuario/rol/:idRol')
  async removeRole(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Param('idRol', ParseIntPipe) idRol: number,
  ) {
    return this.usuarioRolService.remove(idUsuario, idRol);
  }

  @Get('usuario/:idUsuario')
  async getRolesByUsuario(@Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.usuarioRolService.findRolesByUsuario(idUsuario);
  }
}
