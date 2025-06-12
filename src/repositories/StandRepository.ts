import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { Collection } from "mongodb";
import {
  ICreateStand,
  IStand,
  IStandResponse,
  IUpdateStand,
} from "../interfaces/stand";

export interface IStandRepository {
  getAll(): Promise<IStandResponse[]>;
  create(stand: ICreateStand): Promise<IStandResponse>;
  getByCategory(category: string): Promise<IStandResponse[]>;
  getByName(name: string): Promise<IStandResponse | null>;
  getByUuid(uuid: string): Promise<IStandResponse | null>;
  getByDate(date: Date): Promise<IStandResponse[]>;
  getByInterest(interest: string): Promise<IStandResponse[]>;
  update(uuid: string, standData: IUpdateStand): Promise<IStandResponse | null>;
  delete(uuid: string): Promise<boolean>;
}
export class StandRepository {
  private collection: Collection<IStand>;

  constructor(fastify: FastifyInstance) {
    if (!fastify.mongo.db) {
      throw new Error("Database connection not available");
    }
    this.collection = fastify.mongo.db?.collection<IStand>("stands");
  }

  async getAll(): Promise<IStandResponse[]> {
    const results = await this.collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return results.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as IStandResponse[];
  }
  async getByCategory(category: string): Promise<IStandResponse[]> {
    const results = await this.collection
      .find({ category: { $regex: category, $options: "i" } })
      .sort({ createdAt: -1 })
      .toArray();
    return results.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as IStandResponse[];
  }
  async getByName(name: string): Promise<IStandResponse | null> {
    const result = await this.collection.findOne({
      name: { $regex: name, $options: "i" },
    });

    if (!result) return null;

    return {
      ...result,
      _id: result._id.toString(),
    } as IStandResponse;
  }
  async getByUuid(uuid: string): Promise<IStandResponse | null> {
    const result = await this.collection.findOne({ uuid });

    if (!result) return null;

    return {
      ...result,
      _id: result._id.toString(),
    } as IStandResponse;
  }
  async getByDate(date: string): Promise<IStandResponse[]> {
    const results = await this.collection
      .find({ date })
      .sort({ createdAt: -1 })
      .toArray();

    return results.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as IStandResponse[];
  }
  async getByInterest(interest: string): Promise<IStandResponse[]> {
    const results = await this.collection
      .find({
        $or: [
          { interests: { $in: [new RegExp(interest, "i")] } },
          { tags: { $in: [new RegExp(interest, "i")] } },
          { description: { $regex: interest, $options: "i" } },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    return results.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as IStandResponse[];
  }
  async create(stand: ICreateStand): Promise<IStandResponse> {
    const standData = {
      ...stand,
      uuid: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection?.insertOne(standData);

    if (!result || !result.acknowledged) {
      throw new Error("Failed to create stand");
    }

    return {
      _id: result.insertedId.toString(),
      ...standData,
    };
  }
  async update(uuid: string, standData: IUpdateStand): Promise<IStand | null> {
    const updateData = {
      ...standData,
      updatedAt: new Date(),
    };

    const result = await this.collection.findOneAndUpdate(
      { uuid },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return null;
    }

    return result;
  }
  async delete(uuid: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ uuid });
    return result.deletedCount > 0;
  }
}
