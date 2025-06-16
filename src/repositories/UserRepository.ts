import { FastifyInstance } from "fastify";
import { IUser } from "../interfaces/user";

export class UserRepository {
  private collection;

  constructor(fastify: FastifyInstance) {
    this.collection = fastify.mongo.db?.collection<IUser>("users");
  }

  async create(user: IUser) {
    const result = await this.collection?.insertOne(user);

    if (!result || !result.acknowledged) {
      throw new Error("Failed to create user");
    }

    return {
      id: result.insertedId.toString(),
      ...user,
    };
  }

  async addActivities(
    uuid: string,
    activitiesId: string[]
  ): Promise<IUser | null> {
    const result = await this.collection?.findOneAndUpdate(
      { uuid },
      { $addToSet: { activitiesId: { $each: activitiesId } } },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Failed to add activity to user");
    }

    return result;
  }

  async removeActivities(
    uuid: string,
    activitiesId: string[]
  ): Promise<IUser | null> {
    const result = await this.collection?.findOneAndUpdate(
      { uuid },
      { $pull: { activitiesId: { $in: activitiesId } } },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Failed to remove activity from user");
    }

    return result;
  }

  async addStands(uuid: string, standsId: string[]): Promise<IUser | null> {
    const result = await this.collection?.findOneAndUpdate(
      { uuid },
      { $addToSet: { standsId: { $each: standsId } } },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Failed to add stand to user");
    }

    return result;
  }

  async removeStands(uuid: string, standsId: string[]): Promise<IUser | null> {
    const result = await this.collection?.findOneAndUpdate(
      { uuid },
      { $pull: { standsId: { $in: standsId } } },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Failed to remove stand from user");
    }

    return result;
  }

  async findAll(): Promise<IUser[]> {
    const users = await this.collection?.find().toArray();

    if (!users) {
      throw new Error("No users found");
    }

    return users;
  }

  async findByUuid(uuid: string): Promise<IUser | null> {
    const user = await this.collection?.findOne({ uuid });

    if (!user) {
      return null;
    }

    return user;
  }

  async update(uuid: string, user: IUser): Promise<IUser | null> {
    const result = await this.collection?.findOneAndUpdate(
      { uuid },
      { $set: user },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Failed to update user");
    }

    return result;
  }

  async delete(uuid: string) {
    const result = await this.collection?.deleteOne({ uuid });
    if (!result || result.deletedCount === 0) {
      throw new Error("Failed to delete user");
    }

    return {
      success: true,
      message: "User deleted successfully",
      deletedCount: result.deletedCount,
    };
  }
}
