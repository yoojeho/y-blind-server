import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ClassSerializerInterceptor } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle("Swagger API")
    .setDescription("API 문서")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  document.components = { schemas: {} };
  SwaggerModule.setup("api-docs", app, document);

  await app.listen(3000);
}
void bootstrap();
