// src/prisma/prisma.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'; // <-- Importa OnModuleDestroy
import { PrismaClient } from '@prisma/client';

@Injectable()
// Implementa OnModuleDestroy
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
  }

  // Se ejecuta cuando el módulo se inicializa (conexión)
  async onModuleInit() {
    await this.$connect();
  }

  // 💡 ESTE ES EL CAMBIO CLAVE: Se ejecuta cuando la aplicación se apaga (desconexión)
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
