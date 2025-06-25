import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { Collection, WithId } from "mongodb";
import {
  IActivity,
  IActivityResponse,
  ICreateActivity,
  IUpdateActivity,
} from "../interfaces/activity";

export interface IActivityRepository {
  getAll(): Promise<IActivityResponse[]>;
  getByUuid(uuid: string): Promise<WithId<IActivity> | null>;
  getByCategory(categoryId: string): Promise<IActivityResponse[]>;
  getByName(name: string): Promise<IActivityResponse[]>;
  getByDate(date: string): Promise<IActivityResponse[]>;
  getByInterest(interest: string): Promise<IActivityResponse[]>;
  create(activity: ICreateActivity): Promise<IActivityResponse>;
  update(
    uuid: string,
    activity: Partial<IUpdateActivity>
  ): Promise<IActivity | null>;
  delete(uuid: string): Promise<boolean>;
}

export class ActivityRepository implements IActivityRepository {
  private collection: Collection<IActivity>;

  constructor(fastify: FastifyInstance) {
    if (!fastify.mongo.db) {
      throw new Error("Database connection not available");
    }
    this.collection = fastify.mongo.db?.collection<IActivity>("activities");
  }

  async getAll(): Promise<IActivityResponse[]> {
    const results = await this.collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return results.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as IActivityResponse[];
  }

  async getByUuid(uuid: string): Promise<WithId<IActivity> | null> {
    const result = await this.collection.findOne({ uuid });

    if (!result) return null;

    return result;
  }

  async getByCategory(categoryId: string): Promise<IActivityResponse[]> {
    const results = await this.collection
      .find({ categoryId: { $regex: categoryId, $options: "i" } })
      .sort({ createdAt: -1 })
      .toArray();

    return results.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as IActivityResponse[];
  }

  async getByName(name: string): Promise<IActivityResponse[]> {
    const results = await this.collection
      .find({
        $or: [
          { name: { $regex: name, $options: "i" } },
          { description: { $regex: name, $options: "i" } },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    return results.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as IActivityResponse[];
  }

  async getByDate(date: string): Promise<IActivityResponse[]> {
    const results = await this.collection
      .find({ date })
      .sort({ startTime: 1 })
      .toArray();

    return results.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as IActivityResponse[];
  }

  async getByInterest(interest: string): Promise<IActivityResponse[]> {
    const results = await this.collection
      .find({
        $or: [
          { name: { $regex: interest, $options: "i" } },
          { description: { $regex: interest, $options: "i" } },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    return results.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as IActivityResponse[];
  }

  async create(activity: ICreateActivity): Promise<IActivityResponse> {
    const activityData = {
      uuid: randomUUID(),
      ...activity,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection?.insertOne(activityData);

    if (!result || !result.acknowledged) {
      throw new Error("Failed to create activity");
    }

    return {
      _id: result.insertedId.toString(),
      ...activityData,
    };
  }

  async update(uuid: string, updateData: Partial<IUpdateActivity>) {
    const result = await this.collection?.findOneAndUpdate(
      { uuid },
      { $set: { ...updateData, updatedAt: new Date() } },
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
