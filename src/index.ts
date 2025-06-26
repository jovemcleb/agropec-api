import cors from "@fastify/cors";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { errorHandler } from "./handlers/error-handler";

import { authorization } from "./plugins/authorization";
import { jwt } from "./plugins/jwt";
import { mongo } from "./plugins/mongo";
import { notifications } from "./plugins/notifications";
import { repositories } from "./plugins/repositories";
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
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  credentials: true,
});

server.register(mongo);
server.register(jwt);
server.register(authorization);
server.register(repositories);
server.register(websocket);
server.register(notifications);
server.register(jwt);

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
