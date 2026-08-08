import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.use(cookieParser());
  const extraOrigins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3001",
      "https://www.sullys1943.com",
      "https://sullys1943.com",
      "https://sullys1943-web.vercel.app",
      process.env.WEB_ORIGIN ?? "",
      process.env.STAFF_ORIGIN ?? "",
      ...extraOrigins,
    ].filter(Boolean),
    credentials: true,
  });
  app.setGlobalPrefix("api/v1");

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  const stripe = process.env.STRIPE_SECRET_KEY ? "stripe" : "mock";
  console.log(`Sully's API listening on http://localhost:${port}/api/v1`);
  console.log(`Billing mode: ${stripe}`);
}

void bootstrap();
