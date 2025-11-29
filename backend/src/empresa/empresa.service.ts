// src/empresa/empresa.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { empresa as EmpresaModel } from '@prisma/client';
import { CreateEmpresaDto } from './dto/create_empresa.dto';
import { UpdateEmpresaDto } from './dto/update_empresa.dto';

@Injectable()
export class EmpresaService {
  constructor(private prisma: PrismaService) { }

  // 1. OBTENER TODAS LAS EMPRESAS
  async findAll(): Promise<EmpresaModel[]> {
    return this.prisma.empresa.findMany({
      orderBy: {
        razon_social: 'asc',
      },
    });
  }

  // 2. OBTENER UNA EMPRESA POR ID
  async findOne(id: number): Promise<EmpresaModel> {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id_empresa: id },
    });

    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada.`);
    }

    return empresa;
  }

  // 3. CALCULAR DÍGITO VERIFICADOR DEL RUC
  async calcularDV(ruc: string): Promise<number> {
    try {
      const result = await this.prisma.$queryRaw<[{ calcular_dv_ruc: number }]>`
        SELECT calcular_dv_ruc(${ruc}) as calcular_dv_ruc
      `;
      return result[0].calcular_dv_ruc;
    } catch (error) {
      throw new BadRequestException('Error al calcular el dígito verificador del RUC');
    }
  }

  // 4. VALIDAR RUC COMPLETO
  async validarRUC(rucCompleto: string): Promise<boolean> {
    try {
      const result = await this.prisma.$queryRaw<[{ validar_ruc_completo: boolean }]>`
        SELECT validar_ruc_completo(${rucCompleto}) as validar_ruc_completo
      `;
      return result[0].validar_ruc_completo;
    } catch (error) {
      throw new BadRequestException('Error al validar el RUC');
    }
  }

  // 5. CREAR UNA NUEVA EMPRESA
  async create(data: CreateEmpresaDto): Promise<EmpresaModel> {
    // Validar RUC completo antes de crear
    const rucCompleto = data.ruc + data.dv;
    const esValido = await this.validarRUC(rucCompleto);

    if (!esValido) {
      throw new BadRequestException(
        'El RUC y dígito verificador no son válidos. Por favor verifique los datos.',
      );
    }

    return this.prisma.empresa.create({
      data: data,
    });
  }

  // 6. ACTUALIZAR UNA EMPRESA
  async update(id: number, data: UpdateEmpresaDto): Promise<EmpresaModel> {
    // Si se está actualizando el RUC o DV, validar
    if (data.ruc || data.dv) {
      const empresaActual = await this.findOne(id);
      const rucFinal = data.ruc || empresaActual.ruc;
      const dvFinal = data.dv || empresaActual.dv;
      const rucCompleto = rucFinal + dvFinal;

      const esValido = await this.validarRUC(rucCompleto);

      if (!esValido) {
        throw new BadRequestException(
          'El RUC y dígito verificador no son válidos. Por favor verifique los datos.',
        );
      }
    }

    try {
      return await this.prisma.empresa.update({
        where: { id_empresa: id },
        data: data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Empresa con ID ${id} no encontrada para actualizar.`,
        );
      }
      throw error;
    }
  }

  // 7. ELIMINACIÓN LÓGICA
  async remove(id: number): Promise<EmpresaModel> {
    try {
      return await this.prisma.empresa.update({
        where: { id_empresa: id },
        data: { estado: false },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Empresa con ID ${id} no encontrada para desactivación.`,
        );
      }
      throw error;
    }
  }
}
