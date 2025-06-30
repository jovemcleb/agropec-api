import "@fastify/jwt";
import "fastify";
import {
  INotification,
  INotificationResponse,
} from "../interfaces/notification";
import { AuthorizationStrategy } from "../plugins/authorization";
import { ValidationSchemas } from "../plugins/validation";
import { WebSocketManager } from "../plugins/websocket";
import { ActivityRepository } from "../repositories/ActivityRepository";
import { AdminRepository } from "../repositories/AdminRepository";
import { CategoryRepository } from "../repositories/CategoryRepository";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { StandRepository } from "../repositories/StandRepository";
import { UserNotificationRepository } from "../repositories/UserNotificationRepository";
import { UserRepository } from "../repositories/UserRepository";
import { GlobalNotificationService } from "../services/GlobalNotificationService";
import { ImageUploadService } from "../services/ImageUploadService";
import { NotificationScheduler } from "../services/NotificationScheduler";
import { S3Service } from "../services/S3Service";
import { UserNotificationService } from "../services/UserNotificationService";
import { SystemRole } from "../utils/user-role";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
    authorize: (
      strategy: AuthorizationStrategy
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    repositories: {
      activity: ActivityRepository;
      category: CategoryRepository;
      company: CompanyRepository;
      stand: StandRepository;
      admin: AdminRepository;
      user: UserRepository;
      notification: NotificationRepository;
      userNotification: UserNotificationRepository;
    };
    notificationScheduler: NotificationScheduler;
    userNotificationService: UserNotificationService;
    globalNotificationService: GlobalNotificationService;
    scheduleGlobalNotification: (notification: INotification) => Promise<void>;
    validateSchema: (
      schemas: ValidationSchemas
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    wsManager: WebSocketManager;
    s3: S3Service;
    imageUpload: ImageUploadService;
  }

  interface FastifyRequest {
    afterResponse?: () => Promise<void>;
  }

  interface FastifyReply {
    notification?: INotificationResponse;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      uuid: string;
      email: string;
      role: SystemRole;
    };
    user: {
      uuid: string;
      email: string;
      role: SystemRole;
    };
  }
}
