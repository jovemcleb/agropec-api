import { FastifyInstance } from "fastify";
import { IUser } from "../interfaces/user";
import bcrypt from "bcrypt";
import { Collection } from "mongodb";

export class UserRepository {
  private collection: Collection<IUser>;

  private _omitPassword(user: IUser): Omit<IUser, "password"> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  constructor(fastify: FastifyInstance) {
    const collection = fastify.mongo.db?.collection<IUser>("users");

    if (!collection) {
      throw new Error("MongoDB collection 'users' not found.");
    }
    this.collection = collection;
  }

  async create(user: IUser): Promise<Omit<IUser, "password">> {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = {
      ...user,
      password: hashedPassword,
    };
    const result = await this.collection.insertOne(newUser);

    if (!result || !result.acknowledged) {
      throw new Error("Failed to create user");
    }

    return this._omitPassword(newUser);
  }

  async addActivities(
    uuid: string,
    activitiesId: string[]
  ): Promise<Omit<IUser, "password">> {
    const result = await this.collection.findOneAndUpdate(
      { uuid },
      { $addToSet: { activitiesId: { $each: activitiesId } } },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Failed to add activity to user");
    }

    return this._omitPassword(result);
  }

  async removeActivities(
    uuid: string,
    activitiesId: string[]
  ): Promise<Omit<IUser, "password">> {
    const result = await this.collection.findOneAndUpdate(
      { uuid },
      { $pull: { activitiesId: { $in: activitiesId } } },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Failed to remove activity from user");
    }

    return this._omitPassword(result);
  }

  async addStands(
    uuid: string,
    standsId: string[]
  ): Promise<Omit<IUser, "password">> {
    const result = await this.collection.findOneAndUpdate(
      { uuid },
      { $addToSet: { standsId: { $each: standsId } } },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Failed to add stand to user");
    }

    return this._omitPassword(result);
  }

  async removeStands(
    uuid: string,
    standsId: string[]
  ): Promise<Omit<IUser, "password">> {
    const result = await this.collection.findOneAndUpdate(
      { uuid },
      { $pull: { standsId: { $in: standsId } } },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Failed to remove stand from user");
    }

    return this._omitPassword(result);
  }

  async findAll(): Promise<Omit<IUser, "password">[]> {
    const users = await this.collection.find().toArray();

    return users.map(this._omitPassword);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const user = await this.collection.findOne({ email });

    return user;
  }
  async findByUuid(uuid: string): Promise<Omit<IUser, "password"> | null> {
    const user = await this.collection.findOne({ uuid });

    if (!user) {
      return null;
    }

    return this._omitPassword(user);
  }

  async findByUuidWithPassword(uuid: string): Promise<IUser | null> {
    const user = await this.collection.findOne({ uuid });
    return user;
  }

  async update(
    uuid: string,
    user: Partial<IUser>
  ): Promise<Omit<IUser, "password">> {
    const updatePayload: Partial<IUser> = { ...user };

    const result = await this.collection.findOneAndUpdate(
      { uuid },
      { $set: updatePayload },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Failed to update user");
    }

    return this._omitPassword(result);
  }

  async delete(uuid: string) {
    const result = await this.collection.deleteOne({ uuid });
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
