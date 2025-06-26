import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

export type AuthorizationStrategy =
  | "anyAdmin"
  | "selfOrAnyAdmin"
  | "superAdmin";

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
            case "superAdmin":
              if (user.role !== "SUPER_ADMIN") {
                return reply.status(403).send({
                  error: "Forbidden: SUPER_ADMIN access required.",
                });
              }
              break;
            case "anyAdmin":
              if (!["SUPER_ADMIN", "admin"].includes(user.role)) {
                return reply.status(403).send({
                  error: "Forbidden: Admin level access required.",
                });
              }
              break;

            case "selfOrAnyAdmin":
              const isAdminLevel = ["SUPER_ADMIN", "admin"].includes(user.role);
              const isSelf = params.uuid === user.uuid;

              if (!isAdminLevel && !isSelf) {
                return reply.status(403).send({
                  error:
                    "Forbidden: You don't have permission to perform this action.",
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
