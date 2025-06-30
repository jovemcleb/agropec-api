import fastifyJwt from "@fastify/jwt";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

export const jwt = fp(
  async (fastify: FastifyInstance) => {
    // Verificar se as variáveis de ambiente estão configuradas
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

    // Verificar se JWT_SECRET está definido e não é o valor padrão
    if (!jwtSecret) {
      fastify.log.warn(
        "JWT_SECRET nao foi definido, usando valor padrao inseguro!"
      );
      throw new Error("JWT_SECRET nao foi definido");
    }

    fastify.register(fastifyJwt, {
      secret: jwtSecret,
      sign: {
        expiresIn: jwtExpiresIn,
      },
    });

    fastify.decorate(
      "authenticate",
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          // Verificar se o header Authorization existe
          const authHeader = request.headers.authorization;
          if (!authHeader) {
            return reply.status(401).send({
              error: "Token de acesso é obrigatório",
              message: "Header Authorization não encontrado",
            });
          }

          // Verificar se o formato do header está correto
          if (!authHeader.startsWith("Bearer ")) {
            return reply.status(401).send({
              error: "Formato de token inválido",
              message: "Use o formato: Bearer <token>",
            });
          }

          await request.jwtVerify();

          // Verificar se o payload do JWT tem os campos necessários
          if (
            !request.user ||
            !request.user.uuid ||
            !request.user.email ||
            !request.user.role
          ) {
            return reply.status(401).send({
              error: "Token inválido",
              message: "Payload do token está incompleto",
            });
          }
        } catch (err) {
          request.log.warn({ msg: "Falha na autenticação JWT", error: err });

          // Tratamento específico para diferentes tipos de erro JWT
          const error = err as Error;
          let message = "Token inválido";

          if (error.message.includes("expired")) {
            message = "Token expirado, faça login novamente";
          } else if (error.message.includes("malformed")) {
            message = "Token malformado";
          } else if (error.message.includes("signature")) {
            message = "Assinatura do token inválida";
          }

          reply.status(401).send({
            error: "Não autorizado",
            message,
          });
        }
      }
    );
  },
  {
    name: "jwt-plugin",
  }
);
