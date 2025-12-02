import { Module } from '@nestjs/common';
import { ClaseDocumentoService } from './clase_documento.service';
import { ClaseDocumentoController } from './clase_documento.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ClaseDocumentoController],
    providers: [ClaseDocumentoService],
})
export class ClaseDocumentoModule { }
