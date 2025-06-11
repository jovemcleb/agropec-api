import "@fastify/jwt";
import "fastify";

import { AdminRepository } from "../repositories/AdminRepository";
import { CategoryRepository } from "../repositories/CategoryRepository";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { StandRepository } from "../repositories/StandRepository";
import { ActivityRepository } from "../src/repositories/ActivityRepository";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
    repositories: {
      activity: ActivityRepository;
      category: CategoryRepository;
      company: CompanyRepository;
      stand: StandRepository;
      admin: AdminRepository;
    };
     validateSchema: (
      schemas: ValidationSchemas
    ) => (request: any, reply: any) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      uuid: string;
      email: string;
      role: "admin" | "user" | "staff";
    };
    user: {
      uuid: string;
      email: string;
      role: "admin" | "user" | "staff";
    };
  }
}
