import fastifyWebsocket, { WebsocketHandler } from "@fastify/websocket";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { WebSocketManager } from "../services/WebSocketManager";

const websocketPlugin: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  await fastify.register(fastifyWebsocket);

  const wsManager = new WebSocketManager();
  fastify.decorate("wsManager", wsManager);

  fastify.get("/ws", { websocket: true }, ((connection, request) => {
    console.log("[WebSocket] Nova conexão WebSocket recebida");
    const userId = request.headers["x-user-id"] as string;

    if (!userId) {
      console.log("[WebSocket] Conexão rejeitada: x-user-id não encontrado");
      connection.close(1008, "Unauthorized: x-user-id não encontrado");
      return;
    }

    try {
      wsManager.addConnection(userId, connection);

      connection.send(JSON.stringify({ type: "connected", userId }));

      connection.on("message", (message: Buffer) => {
        console.log(
          `[WebSocket] Mensagem recebida do usuário ${userId}:`,
          message.toString()
        );
      });

      connection.on("close", (code: number, reason: string) => {
        console.log(
          `[WebSocket] Cliente desconectado - Código: ${code}, Razão: ${reason}`
        );
        wsManager.removeConnection(userId);
      });

      connection.on("error", (error: Error) => {
        console.error(
          `[WebSocket] Erro na conexão do usuário ${userId}:`,
          error
        );
        wsManager.removeConnection(userId);
      });
    } catch (error) {
      console.error("[WebSocket] Erro ao estabelecer conexão:", error);
      connection.close(1011, "Erro interno ao estabelecer conexão");
    }
  }) as WebsocketHandler);
};

export const websocket = fp(websocketPlugin, {
  name: "websocket-plugin",
  dependencies: ["@fastify/jwt"],
});
