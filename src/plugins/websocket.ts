import fastifyWebsocket, { WebsocketHandler } from "@fastify/websocket";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { WebSocketManager } from "../services/WebSocketManager";

interface WebSocketQuery {
  token?: string;
}

const websocketPlugin: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  await fastify.register(fastifyWebsocket);

  const wsManager = new WebSocketManager();
  fastify.decorate("wsManager", wsManager);

  fastify.get<{ Querystring: WebSocketQuery }>("/ws", { websocket: true }, ((
    connection,
    request
  ) => {
    console.log("[WebSocket] Nova conexão WebSocket recebida");

    // Obter token do query parameter
    const token = (request.query as WebSocketQuery).token;

    if (!token) {
      console.log("[WebSocket] Conexão rejeitada: token não encontrado");
      connection.close(1008, "Unauthorized: token não encontrado");
      return;
    }

    try {
      // Verificar e decodificar o JWT token
      const decoded = fastify.jwt.verify(token) as {
        uuid: string;
        email: string;
        role: string;
      };
      const userId = decoded.uuid;

      if (!userId) {
        console.log(
          "[WebSocket] Conexão rejeitada: userId não encontrado no token"
        );
        connection.close(1008, "Unauthorized: token inválido");
        return;
      }

      console.log(`[WebSocket] Token válido para usuário: ${userId}`);
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
      console.error("[WebSocket] Erro ao verificar token:", error);
      connection.close(1008, "Unauthorized: token inválido");
    }
  }) as WebsocketHandler);
};

export const websocket = fp(websocketPlugin, {
  name: "websocket-plugin",
  dependencies: ["@fastify/jwt"],
});
