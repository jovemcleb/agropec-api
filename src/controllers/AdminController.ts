import { FastifyReply, FastifyRequest } from "fastify";
import { AdminDTO, IAdmin, ILoginInput } from "../interfaces/admin";
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
    request: FastifyRequest<{ Body: AdminDTO }>,
    reply: FastifyReply
  ) {
    try {
      const { email, firstName, lastName, password, role } = request.body;

      const newAdmin = await createAdmin(
        { email, firstName, lastName, password, role },
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
    request: FastifyRequest<{ Body: IAdmin; Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;
      const { firstName, lastName, email, password, role } = request.body;

      const updatedAdmin = await updateAdmin(
        { uuid, firstName, lastName, email, password, role },
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
      const { uuid } = request.params;

      const deletedAdmin = await deleteAdmin(uuid, this.adminRepository);

      if (!deletedAdmin) {
        return reply.status(404).send({ error: "Admin not found" });
      }

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
