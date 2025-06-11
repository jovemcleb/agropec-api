import bcrypt from "bcrypt";
import { FastifyInstance } from "fastify";
import { IAdmin } from "../interfaces/admin";

export class AdminRepository {
  private collection;

  constructor(fastify: FastifyInstance) {
    this.collection = fastify.mongo.db?.collection<IAdmin>("admins");
  }

  async create(admin: IAdmin) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);

    const newAdmin = {
      ...admin,
      password: hashedPassword,
    };

    const result = await this.collection?.insertOne(newAdmin);
    if (!result || !result.acknowledged) {
      throw new Error("Failed to create admin");
    }

    return {
      _id: result.insertedId.toString(),
      ...newAdmin,
    };
  }

  async findAll(): Promise<IAdmin[]> {
    const admins = await this.collection?.find().toArray();

    if (!admins) {
      throw new Error("No admins found");
    }

    return admins;
  }

  async findByEmail(email: string): Promise<IAdmin | null | undefined> {
    const admin = await this.collection?.findOne({ email });

    return admin;
  }

  async findByUuid(uuid: string): Promise<IAdmin | null | undefined> {
    const admin = await this.collection?.findOne({ uuid });

    return admin;
  }

  async update(uuid: string, admin: Partial<IAdmin>) {
    if (admin.password) {
      admin.password = await bcrypt.hash(admin.password, 10);
    }

    const updatedAdmin = await this.collection?.findOneAndUpdate(
      { uuid },
      { $set: admin },
      { returnDocument: "after" }
    );

    return updatedAdmin;
  }

  async delete(uuid: string) {
    const result = await this.collection?.deleteOne({ uuid });

    if (!result || result.deletedCount === 0) {
      throw new Error("Failed to delete admin");
    }

    return {
      success: true,
      message: "Admin deleted successfully",
      deletedCount: result.deletedCount,
    };
  }
}
