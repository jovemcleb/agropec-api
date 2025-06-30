import cors from "@fastify/cors";
import "dotenv/config";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { errorHandler } from "./handlers/error-handler";

import { authorization } from "./plugins/authorization";
import { imageUpload } from "./plugins/image-upload";
import { jwt } from "./plugins/jwt";
import { mongo } from "./plugins/mongo";
import { notifications } from "./plugins/notifications";
import { repositories } from "./plugins/repositories";
import { s3 } from "./plugins/s3";
import { websocket } from "./plugins/websocket";
import { routes } from "./routes";

const server = Fastify({
  logger: {
    level: "debug",
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
});

server.register(cors, {
  origin: ["http://localhost:3000", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Origin",
    "Accept",
    "Content-Length",
    "x-requested-with",
  ],
  exposedHeaders: ["Content-Disposition"],
  credentials: true,
  maxAge: 86400, // 24 horas em segundos
  preflight: true,
  strictPreflight: false,
});

server.register(mongo);
server.register(jwt);
server.register(authorization);
server.register(repositories);
server.register(websocket);
server.register(notifications);
server.register(s3);
server.register(imageUpload);

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.withTypeProvider<ZodTypeProvider>();
server.setErrorHandler(errorHandler);
server.register(routes);

server.get("/", async (request, reply) => {
  return reply.status(200).send({ message: "Hello World" });
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Server is running on http://localhost:3000");
  } catch (err) {
    console.error("!!! ERRO AO INICIAR O SERVIDOR !!!", err);
    process.exit(1);
  }
};

start();
