import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { Collection } from "mongodb";
import {
  ICreateNotification,
  INotification,
  INotificationResponse,
  IUpdateNotification,
} from "../interfaces/notification";

export interface INotificationRepository {
  getAll(): Promise<INotificationResponse[]>;
  getByUuid(uuid: string): Promise<INotificationResponse | null>;
  getActive(): Promise<INotificationResponse[]>;
  getByType(type: INotification["type"]): Promise<INotificationResponse[]>;
  getByAudience(
    audience: INotification["targetAudience"]
  ): Promise<INotificationResponse[]>;
  create(notification: ICreateNotification): Promise<INotificationResponse>;
  update(
    uuid: string,
    notification: Partial<IUpdateNotification>
  ): Promise<INotification | null>;
  delete(uuid: string): Promise<boolean>;
}

export class NotificationRepository implements INotificationRepository {
  private collection: Collection<INotification>;

  constructor(fastify: FastifyInstance) {
    if (!fastify.mongo.db) {
      throw new Error("Database connection not available");
    }
    this.collection =
      fastify.mongo.db?.collection<INotification>("notifications");
  }

  async create(
    notification: ICreateNotification
  ): Promise<INotificationResponse> {
    const now = new Date();
    const notificationData = {
      ...notification,
      uuid: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection?.insertOne(notificationData);

    if (!result || !result.acknowledged) {
      throw new Error("Failed to create notification");
    }

    return {
      _id: result.insertedId.toString(),
      ...notificationData,
    };
  }

  async getAll(): Promise<INotificationResponse[]> {
    const results = await this.collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return results.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as INotificationResponse[];
  }

  async getActive(): Promise<INotificationResponse[]> {
    const now = new Date();
    const results = await this.collection
      .find({
        $or: [{ expiresAt: { $gt: now } }, { expiresAt: { $exists: false } }],
        $and: [
          {
            $or: [
              { scheduledFor: { $lte: now } },
              { scheduledFor: { $exists: false } },
            ],
          },
        ],
      })
      .sort({ priority: -1, createdAt: -1 })
      .toArray();

    return results.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as INotificationResponse[];
  }

  async getByUuid(uuid: string): Promise<INotificationResponse | null> {
    const result = await this.collection.findOne({ uuid });

    if (!result) return null;

    return {
      ...result,
      _id: result._id.toString(),
    } as INotificationResponse;
  }

  async getByType(
    type: INotification["type"]
  ): Promise<INotificationResponse[]> {
    const results = await this.collection
      .find({ type })
      .sort({ createdAt: -1 })
      .toArray();

    return results.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as INotificationResponse[];
  }

  async getByAudience(
    audience: INotification["targetAudience"]
  ): Promise<INotificationResponse[]> {
    const results = await this.collection
      .find({
        targetAudience: { $in: [audience] },
      })
      .sort({ createdAt: -1 })
      .toArray();

    return results.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as INotificationResponse[];
  }

  async update(
    uuid: string,
    updateData: Partial<IUpdateNotification>
  ): Promise<INotification | null> {
    const { _id, ...updateDataWithoutId } = updateData;

    const result = await this.collection?.findOneAndUpdate(
      { uuid },
      {
        $set: {
          ...updateDataWithoutId,
          updatedAt: new Date(),
        },
      },
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
