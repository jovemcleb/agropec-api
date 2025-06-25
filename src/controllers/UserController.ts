import { FastifyReply, FastifyRequest } from "fastify";
import { ICreateUser, IUpdateUser } from "../interfaces/user";
import { UserRepository } from "../repositories/UserRepository";
import { addUserActivities } from "../useCases/users/addUserActivities";
import { addUserStands } from "../useCases/users/addUserStands";
import { createUser } from "../useCases/users/createUser";
import { deleteUser } from "../useCases/users/deleteUser";
import { findAllUsers } from "../useCases/users/findAllUsers";
import { removeUserActivities } from "../useCases/users/removeUserActivities";
import { removeUserStands } from "../useCases/users/removeUserStands";
import { updateUser } from "../useCases/users/updateUser";

export class UserController {
  constructor(private userRepository: UserRepository) {}

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await findAllUsers(this.userRepository);

      reply.status(200).send({
        success: true,
        message: "Usuários encontrados com sucesso",
        data: users,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async create(
    request: FastifyRequest<{ Body: ICreateUser }>,
    reply: FastifyReply
  ) {
    try {
      const { firstName, lastName } = request.body;

      const user = await createUser(
        { firstName, lastName },
        this.userRepository
      );

      reply.status(201).send(user);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async addActivity(
    request: FastifyRequest<{
      Params: { uuid: string };
      Body: { activitiesId: string[] };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;
      const { activitiesId } = request.body;

      const userActivities = await addUserActivities(
        uuid,
        activitiesId,
        this.userRepository
      );

      reply.status(200).send(userActivities);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async removeActivities(
    request: FastifyRequest<{
      Params: { uuid: string };
      Body: { activitiesId: string[] };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;
      const { activitiesId } = request.body;

      const userActivities = await removeUserActivities(
        uuid,
        activitiesId,
        this.userRepository
      );

      reply.status(200).send(userActivities);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async addStands(
    request: FastifyRequest<{
      Params: { uuid: string };
      Body: { standsId: string[] };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;
      const { standsId } = request.body;

      const userStands = await addUserStands(
        uuid,
        standsId,
        this.userRepository
      );

      reply.status(200).send(userStands);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
  async removeStands(
    request: FastifyRequest<{
      Params: { uuid: string };
      Body: { standsId: string[] };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;
      const { standsId } = request.body;

      const userStands = await removeUserStands(
        uuid,
        standsId,
        this.userRepository
      );

      reply.status(200).send(userStands);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { uuid: string };
      Body: IUpdateUser;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid: uuidParam } = request.params;
      const { uuid, firstName, lastName } = request.body;

      const user = await updateUser(
        uuidParam,
        { uuid, firstName, lastName },
        this.userRepository
      );

      reply.status(200).send(user);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async delete(
    request: FastifyRequest<{
      Params: { uuid: string };
      Body: { uuid: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid: uuidParam } = request.params;
      const { uuid: uuidPayload } = request.body;

      const user = await deleteUser(
        uuidParam,
        uuidPayload,
        this.userRepository
      );

      reply.status(200).send(user);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
}
