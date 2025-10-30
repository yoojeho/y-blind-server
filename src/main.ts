import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";

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

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성 제거
      forbidNonWhitelisted: true, // DTO에 없는 속성이 들어오면 에러
      transform: true, // 요청 객체를 DTO 클래스로 변환
      skipMissingProperties: false, // PATCH 시에도 누락된 필드 검증
    }),
  );

  await app.listen(3000);
}
bootstrap();
