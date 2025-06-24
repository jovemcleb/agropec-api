import cors from "@fastify/cors";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { errorHandler } from "./handlers/error-handler";

import { mongo } from "./plugins/mongo";
import { repositories } from "./plugins/repositories";
import { routes } from "./routes";
import { jwt } from "./plugins/jwt";
import { authorization } from "./plugins/authorization";

const server = Fastify();

server.register(mongo);
server.register(repositories);
server.register(jwt);
server.register(authorization);
server.register(cors, {
  origin: true,
});

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
