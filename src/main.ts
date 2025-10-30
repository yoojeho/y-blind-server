import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("Swagger API")
    .setDescription("API 문서")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("api-docs", app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1, // DTO 목록(Models) 안보이도록
      defaultModelExpandDepth: 2, // 각 스키마 상세 열린 상태로
    },
  });

  await app.listen(3000);
}
bootstrap();
