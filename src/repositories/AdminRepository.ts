import bcrypt from "bcrypt";
import { FastifyInstance } from "fastify";
import { Collection } from "mongodb";
import { IAdmin } from "../interfaces/admin";

export class AdminRepository {
  private collection: Collection<IAdmin>;

  private _omitPassword(admin: IAdmin): Omit<IAdmin, "password"> {
    const { password, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }

  constructor(fastify: FastifyInstance) {
    const collection = fastify.mongo.db?.collection<IAdmin>("admins");
    if (!collection) {
      throw new Error("MongoDB collection 'admins' not found.");
    }
    this.collection = collection;
  }

  async create(admin: IAdmin): Promise<Omit<IAdmin, "password">> {
    const hashedPassword = await bcrypt.hash(admin.password, 10);

    const newAdmin = {
      ...admin,
      password: hashedPassword,
    };

    const result = await this.collection.insertOne(newAdmin);
    if (!result || !result.acknowledged) {
      throw new Error("Failed to create admin");
    }

    return this._omitPassword(newAdmin);
  }

  async findAll(): Promise<Omit<IAdmin, "password">[]> {
    const admins = await this.collection.find().toArray();
    return admins.map(this._omitPassword);
  }

  async findByEmail(email: string): Promise<IAdmin | null> {
    return this.collection.findOne({ email });
  }

  async findByUuid(uuid: string): Promise<Omit<IAdmin, "password"> | null> {
    const admin = await this.collection.findOne({ uuid });
    if (!admin) {
      return null;
    }
    return this._omitPassword(admin);
  }

  async findByUuidWithPassword(uuid: string): Promise<IAdmin | null> {
    return this.collection.findOne({ uuid });
  }

  async update(
    uuid: string,
    admin: Partial<IAdmin>
  ): Promise<Omit<IAdmin, "password">> {
    const updatePayload: Partial<IAdmin> = { ...admin };

    if (updatePayload.password) {
      updatePayload.password = await bcrypt.hash(updatePayload.password, 10);
    }

    const result = await this.collection.findOneAndUpdate(
      { uuid },
      { $set: updatePayload },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Admin not found for update");
    }

    return this._omitPassword(result);
  }

  async delete(uuid: string) {
    const result = await this.collection.deleteOne({ uuid });

    if (!result || result.deletedCount === 0) {
      throw new Error("Admin not found for deletion");
    }

    return {
      success: true,
      message: "Admin deleted successfully",
      deletedCount: result.deletedCount,
    };
  }
}
