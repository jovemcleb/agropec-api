import fastifyJwt from "@fastify/jwt";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

export const jwt = fp(
  async (fastify: FastifyInstance) => {
    fastify.register(fastifyJwt, {
      secret: process.env.JWT_SECRET || "oSistemaEhFalho",
      sign: {
        expiresIn: "1d",
      },
    });

    fastify.decorate(
      "authenticate",
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          await request.jwtVerify();
        } catch (err) {
          console.log("❌ Erro na verificação JWT:", err);
          request.log.warn({ msg: "Falha na autenticação JWT", error: err });
          reply.status(401).send({
            message: "Unauthorized, missing or invalid token",
            error: (err as Error).message,
          });
        }
      }
    );
  },
  {
    name: "jwt-plugin",
  }
);
