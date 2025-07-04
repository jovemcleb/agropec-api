import { FastifyReply, FastifyRequest } from "fastify";
import { ICreateUser, ILoginInput, IUpdateUser } from "../interfaces/user";
import { UserRepository } from "../repositories/UserRepository";
import { addUserActivities } from "../useCases/users/addUserActivities";
import { addUserStands } from "../useCases/users/addUserStands";
import { createUser } from "../useCases/users/createUser";
import { deleteUser } from "../useCases/users/deleteUser";
import { findAllUsers } from "../useCases/users/findAllUsers";
import { loginCase } from "../useCases/users/loginCase";
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

  async login(
    request: FastifyRequest<{ Body: ILoginInput }>,
    reply: FastifyReply
  ) {
    try {
      const { email, password } = request.body;

      const result = await loginCase({ email, password }, this.userRepository);

      if (!result) {
        return reply.status(401).send({ error: "Invalid email or password" });
      }

      const token = request.server.jwt.sign({
        uuid: result.uuid,
        email: result.email,
        role: result.role,
      });

      reply.status(200).send({
        user: {
          uuid: result.uuid,
          email: result.email,
          firstName: result.firstName,
          lastName: result.lastName,
          role: result.role,
          activitiesId: result.activitiesId || [],
          standsId: result.standsId || [],
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
    request: FastifyRequest<{ Body: ICreateUser }>,
    reply: FastifyReply
  ) {
    try {
      const { firstName, lastName, email, password } = request.body;

      const newUser = await createUser(
        { firstName, lastName, email, password },
        this.userRepository
      );

      const token = request.server.jwt.sign({
        uuid: newUser.uuid,
        email: newUser.email,
        role: newUser.role,
      });

      reply.status(201).send({
        user: {
          uuid: newUser.uuid,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          activitiesId: newUser.activitiesId || [],
          standsId: newUser.standsId || [],
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

  async addActivity(
    request: FastifyRequest<{
      Params: { uuid: string };
      Body: { activitiesId: string[] };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid: uuidParam } = request.params;

      const { activitiesId } = request.body;

      const userActivities = await addUserActivities(
        uuidParam,
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
      const { uuid: uuidParam } = request.params;

      const { activitiesId } = request.body;

      const userActivities = await removeUserActivities(
        uuidParam,
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
      const { uuid: uuidParam } = request.params;

      const { standsId } = request.body;

      const userStands = await addUserStands(
        uuidParam,
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
      const { uuid: uuidParam } = request.params;

      const { standsId } = request.body;

      const userStands = await removeUserStands(
        uuidParam,
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

      const { uuid, firstName, lastName, email, password } = request.body;

      const user = await updateUser(
        uuidParam,
        { uuid, firstName, lastName, email, password },
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
    }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid: uuidParam } = request.params;

      const user = await deleteUser(uuidParam, this.userRepository);

      reply.status(200).send(user);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async validateToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      // O token já foi validado pelo middleware de autenticação
      // Recuperamos os dados do usuário decodificados do token
      const { uuid, email, role } = request.user;

      // Busca os dados completos do usuário no banco
      const user = await this.userRepository.findByUuid(uuid);

      if (!user) {
        return reply.status(404).send({ error: "Usuário não encontrado" });
      }

      reply.status(200).send({
        user: {
          uuid: user.uuid,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          activitiesId: user.activitiesId || [],
          standsId: user.standsId || [],
        },
        token: request.headers.authorization?.replace("Bearer ", "") || "",
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(401).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
}
