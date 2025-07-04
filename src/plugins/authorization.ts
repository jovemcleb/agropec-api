import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { SystemRole } from "../utils/user-role";

export type AuthorizationStrategy =
  | "anyAdmin"
  | "selfOrAnyAdmin"
  | "selfOrSuperAdmin"
  | "superAdmin"
  | "self"
  | "authenticated";

interface UuidParams {
  uuid: string;
}

async function authorizationPlugin(fastify: FastifyInstance) {
  fastify.decorate(
    "authorize",
    (strategy: AuthorizationStrategy) =>
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          // Verificar se o usuário está autenticado
          if (!request.user) {
            return reply.status(401).send({
              error: "Token de acesso é obrigatório para esta ação.",
            });
          }

          const user = request.user;
          const params = request.params as UuidParams;

          // Validar se o role é válido
          const validRoles: SystemRole[] = ["SUPER_ADMIN", "admin", "user"];
          if (!validRoles.includes(user.role as SystemRole)) {
            return reply.status(403).send({
              error: "Role de usuário inválido.",
            });
          }

          switch (strategy) {
            case "superAdmin":
              if (user.role !== "SUPER_ADMIN") {
                return reply.status(403).send({
                  error: "Acesso negado: requer permissão de SUPER_ADMIN.",
                });
              }
              break;

            case "anyAdmin":
              if (!["SUPER_ADMIN", "admin"].includes(user.role)) {
                return reply.status(403).send({
                  error: "Acesso negado: requer permissão de administrador.",
                });
              }
              break;

            case "selfOrAnyAdmin":
              const isAdminLevel = ["SUPER_ADMIN", "admin"].includes(user.role);
              const isSelf = params.uuid === user.uuid;

              if (!isAdminLevel && !isSelf) {
                return reply.status(403).send({
                  error:
                    "Acesso negado: você não tem permissão para esta ação.",
                });
              }
              break;

            case "selfOrSuperAdmin":
              const isSuperAdmin = user.role === "SUPER_ADMIN";
              const isSelfUser = params.uuid === user.uuid;

              if (!isSuperAdmin && !isSelfUser) {
                return reply.status(403).send({
                  error:
                    "Acesso negado: apenas você mesmo ou SUPER_ADMIN podem realizar esta ação.",
                });
              }
              break;

            case "self":
              if (!params.uuid) {
                return reply.status(400).send({
                  error: "UUID é obrigatório para validação de acesso próprio.",
                });
              }
              if (params.uuid !== user.uuid) {
                return reply.status(403).send({
                  error:
                    "Acesso negado: você só pode acessar seus próprios recursos.",
                });
              }
              break;

            case "authenticated":
              // Se chegou aqui, já está autenticado pelo middleware authenticate
              break;

            default:
              return reply.status(500).send({
                error: "Erro interno: estratégia de autorização inválida.",
              });
          }
        } catch (err) {
          request.log.error(err);
          reply.status(500).send({ error: "Erro interno do servidor" });
        }
      }
  );
}

export const authorization = fp(authorizationPlugin);
