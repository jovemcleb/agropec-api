import { WebSocket } from "ws";
import { INotification } from "../interfaces/notification";
import { IUserNotification } from "../interfaces/userNotification";

export interface WebSocketConnection {
  userId: string;
  connection: WebSocket;
}

export class WebSocketManager {
  private connections: Map<string, WebSocketConnection>;

  constructor() {
    this.connections = new Map();
  }

  addConnection(userId: string, connection: WebSocket) {
    console.log(`[WebSocket] Adicionando conexão para o usuário ${userId}`);
    console.log(
      `[WebSocket] Total de conexões antes: ${this.connections.size}`
    );
    this.connections.set(userId, { userId, connection });
    console.log(
      `[WebSocket] Total de conexões depois: ${this.connections.size}`
    );
  }

  removeConnection(userId: string) {
    console.log(`[WebSocket] Removendo conexão para o usuário ${userId}`);
    console.log(
      `[WebSocket] Total de conexões antes: ${this.connections.size}`
    );
    this.connections.delete(userId);
    console.log(
      `[WebSocket] Total de conexões depois: ${this.connections.size}`
    );
  }

  sendNotification(userId: string, notification: IUserNotification) {
    console.log(
      `[WebSocket] Tentando enviar notificação para usuário ${userId}`
    );
    const connection = this.connections.get(userId);
    if (connection) {
      console.log(`[WebSocket] Conexão encontrada, enviando notificação`);
      connection.connection.send(JSON.stringify(notification));
    } else {
      console.log(`[WebSocket] Conexão não encontrada para usuário ${userId}`);
    }
  }

  broadcastNotification(
    notification: INotification,
    audience: string[] = ["all"]
  ) {
    console.log(`[WebSocket] Iniciando broadcast para audiência:`, audience);
    console.log(`[WebSocket] Total de conexões: ${this.connections.size}`);
    this.connections.forEach((connection) => {
      if (audience.includes("all")) {
        console.log(`[WebSocket] Enviando broadcast para ${connection.userId}`);
        connection.connection.send(JSON.stringify(notification));
      }
    });
  }
}
