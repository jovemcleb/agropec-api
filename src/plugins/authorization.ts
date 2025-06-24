import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

export type AuthorizationStrategy = "admin" | "selfOrAdmin";

interface AuthenticatedUser {
  uuid: string;
  role: string;
}

interface UuidParams {
  uuid: string;
}

async function authorizationPlugin(fastify: FastifyInstance) {
  fastify.decorate(
    "authorize",
    (strategy: AuthorizationStrategy) =>
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          const user = request.user as AuthenticatedUser;
          const params = request.params as UuidParams;

          switch (strategy) {
            case "admin":
              if (user.role !== "admin") {
                return reply.status(403).send({
                  error: "Forbidden: Admin access required.",
                });
              }
              break;

            case "selfOrAdmin":
              if (user.role !== "admin" && params.uuid !== user.uuid) {
                return reply.status(403).send({
                  error: "Forbidden: You don't have permission to perform this action.",
                });
              }
              break;

            default:
              return reply.status(500).send({
                error: "Internal Server Error: Invalid authorization strategy.",
              });
          }
        } catch (err) {
            reply.status(500).send({ error: "Internal Server Error" });
        }
      }
  );
}

export const authorization = fp(authorizationPlugin);