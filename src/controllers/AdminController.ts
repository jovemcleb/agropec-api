import { FastifyReply, FastifyRequest } from "fastify";
import { ICreateAdmin, ILoginInput, IUpdateAdmin } from "../interfaces/admin";
import { AdminRepository } from "../repositories/AdminRepository";
import { createAdmin } from "../useCases/admin/createAdmin";
import { deleteAdmin } from "../useCases/admin/deleteAdmin";
import { findAllAdmins } from "../useCases/admin/findAllAdmins";
import { loginCase } from "../useCases/admin/loginCase";
import { updateAdmin } from "../useCases/admin/updateAdmin";

export class AdminController {
  constructor(private adminRepository: AdminRepository) {}

  async login(
    request: FastifyRequest<{ Body: ILoginInput }>,
    reply: FastifyReply
  ) {
    try {
      const { email, password } = request.body;

      const result = await loginCase({ email, password }, this.adminRepository);

      if (!result) {
        return reply.status(401).send({ error: "Invalid email or password" });
      }

      const token = request.server.jwt.sign({
        uuid: result.uuid,
        email: result.email,
        role: result.role,
      });

      reply.status(200).send({
        admin: {
          uuid: result.uuid,
          email: result.email,
          firstName: result.firstName,
          lastName: result.lastName,
          role: result.role,
        },
        token,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async signup(
    request: FastifyRequest<{ Body: ICreateAdmin }>,
    reply: FastifyReply
  ) {
    try {
      const { email, firstName, lastName, password } = request.body;
      const requester = request.user as { uuid: string; role: string };

      // Apenas SUPER_ADMIN pode criar novos admins
      if (requester.role !== "SUPER_ADMIN") {
        return reply.status(403).send({
          error: "Apenas SUPER_ADMIN pode criar novos administradores",
        });
      }

      const newAdmin = await createAdmin(
        { email, firstName, lastName, password },
        this.adminRepository
      );

      const token = request.server.jwt.sign({
        uuid: newAdmin.uuid,
        email: newAdmin.email,
        role: newAdmin.role,
      });

      reply.status(201).send({
        admin: {
          uuid: newAdmin.uuid,
          email: newAdmin.email,
          firstName: newAdmin.firstName,
          lastName: newAdmin.lastName,
          role: newAdmin.role,
        },
        token,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const admins = await findAllAdmins(this.adminRepository);

      reply.status(200).send(admins);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async update(
    request: FastifyRequest<{ Params: { uuid: string }; Body: IUpdateAdmin }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid: uuidParam } = request.params;

      const { uuid, firstName, lastName, email, password } = request.body;
      const requester = request.user as { uuid: string; role: string };
      const updatedAdmin = await updateAdmin(
        requester,
        uuidParam,
        { uuid, firstName, lastName, email, password },
        this.adminRepository
      );

      reply.status(200).send(updatedAdmin);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
  async delete(
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid: uuidParam } = request.params;
      const requester = request.user as { uuid: string; role: string };
      const deletedAdmin = await deleteAdmin(
        requester,
        uuidParam,
        this.adminRepository
      );

      reply.status(200).send(deletedAdmin);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
}
