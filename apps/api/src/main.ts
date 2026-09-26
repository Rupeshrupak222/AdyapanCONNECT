import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { validateEnv } from './config/env.validation';

async function bootstrap() {
  // Fail fast on missing/weak secrets before any traffic is served.
  validateEnv();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Security headers. In production we drop 'unsafe-inline' from styleSrc for a
  // stricter CSP; in dev it is allowed so the Swagger UI renders correctly.
  const isProduction = process.env.NODE_ENV === 'production';
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: isProduction ? ["'self'"] : ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Cookie parser (COOKIE_SECRET is enforced by validateEnv above)
  app.use(cookieParser(process.env.COOKIE_SECRET));

  // CORS
  app.enableCors({
    origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 'Authorization', 'X-Tenant-Slug',
      'Idempotency-Key', 'X-Request-ID',
    ],
  });

  // API versioning
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global pipes
  // NOTE: forbidNonWhitelisted is intentionally false. Many controllers accept
  // freeform bodies (no decorated DTO class yet); with it enabled the pipe would
  // reject every field. Decorated DTOs (e.g. auth) are still validated. `whitelist`
  // still strips unknown props for endpoints that DO declare a DTO class.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Adyapan Connect API')
      .setDescription('AI-Powered WhatsApp Business Messaging, CRM & Automation SaaS - REST API')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
      .addApiKey({ type: 'apiKey', in: 'header', name: 'X-API-Key' }, 'API-Key')
      .addServer('http://localhost:4000', 'Local Development')
      .addServer('https://api.adyapanconnect.com', 'Production')
      .addTag('Auth', 'Authentication & authorization')
      .addTag('Tenants', 'Multi-tenant management')
      .addTag('Users', 'User management')
      .addTag('WhatsApp', 'WhatsApp integration')
      .addTag('Contacts', 'Contact management')
      .addTag('Conversations', 'Inbox & conversations')
      .addTag('Messages', 'Message sending & receiving')
      .addTag('Templates', 'WhatsApp templates')
      .addTag('Campaigns', 'Campaign management')
      .addTag('CRM', 'Customer relationship management')
      .addTag('Analytics', 'Analytics & reporting')
      .addTag('Billing', 'Billing & subscriptions')
      .addTag('Webhooks', 'Webhook management')
      .addTag('Developer', 'Developer API & keys')
      .addTag('Admin', 'Super admin panel')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'method',
      },
    });
  }

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Adyapan Connect API running on: http://localhost:${port}/api`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
