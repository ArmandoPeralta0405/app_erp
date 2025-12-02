import { Module } from '@nestjs/common';
import { TipoTransaccionService } from './tipo_transaccion.service';
import { TipoTransaccionController } from './tipo_transaccion.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [TipoTransaccionController],
    providers: [TipoTransaccionService],
})
export class TipoTransaccionModule { }
