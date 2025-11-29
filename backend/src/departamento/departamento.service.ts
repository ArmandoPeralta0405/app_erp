import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { departamento as DepartamentoModel, Prisma } from '@prisma/client';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

type DepartamentoUniqueKey = Prisma.departamentoWhereUniqueInput;

@Injectable()
export class DepartamentoService {
  constructor(private prisma: PrismaService) { }

  create(createDepartamentoDto: CreateDepartamentoDto) {
    return this.prisma.departamento.create({
      data: createDepartamentoDto,
      include: {
        pais: true,
      },
    });
  }

  findAll() {
    return this.prisma.departamento.findMany({
      include: {
        pais: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  async findOne(id: number): Promise<DepartamentoModel> {
    const key: DepartamentoUniqueKey = { id_departamento: id };

    const departamento = await this.prisma.departamento.findUnique({
      where: key,
      include: {
        pais: true,
      },
    });

    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado.`);
    }
    return departamento;
  }

  update(id: number, updateDepartamentoDto: UpdateDepartamentoDto) {
    return this.prisma.departamento.update({
      where: { id_departamento: id },
      data: updateDepartamentoDto,
      include: {
        pais: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.departamento.update({
      where: { id_departamento: id },
      data: { estado: false },
    });
  }
}
