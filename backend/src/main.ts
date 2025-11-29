// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 💡 Importar
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // 💡 Importar

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Habilitar CORS para permitir peticiones desde el frontend
  app.enableCors({
    origin: true, // Permite cualquier origen en desarrollo (incluyendo móvil)
    credentials: true,
  });

  // 2. Configuración del Prefijo Global (opcional, pero buena práctica)
  app.setGlobalPrefix('api/v1');

  // 3. Aplicar el ValidationPipe globalmente
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remueve propiedades que no están en el DTO
    forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
  }));

  // =======================================================
  // 4. CONFIGURACIÓN DE SWAGGER / OPENAPI
  // =======================================================

  const config = new DocumentBuilder()
    .setTitle('Gestión de Programas de Estudio API')
    .setDescription('API REST para la gestión de entidades.')
    .setVersion('1.0')
    // 💡 Configurar JWT Bearer Authentication
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingrese el Token JWT obtenido en /auth/login',
        in: 'header',
      },
      'access-token' // Nombre para referenciar este esquema de seguridad
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Configura la ruta de la documentación (ej: http://localhost:3000/docs)
  SwaggerModule.setup('docs', app, document);

  // =======================================================
  // FIN DE CONFIGURACIÓN DE SWAGGER
  // =======================================================

  // Usa el puerto de la variable de entorno o 3000 por defecto
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0'); // Escucha en todas las interfaces
}
bootstrap();