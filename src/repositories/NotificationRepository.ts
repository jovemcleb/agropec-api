import { FastifyInstance } from "fastify";
import {
  ICreateNotification,
  INotification,
  INotificationResponse,
  IUpdateNotification,
} from "../interfaces/notification";
import { Collection, UUID } from "mongodb";
import { randomUUID } from "crypto";

export interface INotificationRepository {
  getAll(): Promise<INotificationResponse[]>;
  getByUuid(uuid: string): Promise<INotificationResponse | null>;
  getByUserId(userId: string): Promise<INotificationResponse[]>;
  create(activity: ICreateNotification): Promise<INotificationResponse>;
  update(
    uuid: string,
    activity: Partial<IUpdateNotification>
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
    const notificationData = {
      ...notification,
      uuid: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
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


  async getByUuid(uuid: string): Promise<INotificationResponse | null> {
    const result = await this.collection.findOne({ uuid });

    if (!result) return null;

    return {
      ...result,
      _id: result._id.toString(),
    } as INotificationResponse;
  }

// a função userId vou precisar de ajuda da IA
  async getByUserId(userId: string): Promise<INotificationResponse[]> {
    const notifications = await this.collection?.find({ userId }).toArray();

    if (!notifications) {
      return [];
    }

    return notifications.map((notification) => ({
     ...notification,
    _id: notification._id.toString(),
    }))as INotificationResponse[];
  }
  async update(uuid: string, notificationData: Partial<IUpdateNotification>) : Promise<INotification | null> {
    const result = await this.collection?.findOneAndUpdate(
      { uuid },
      { $set: { ...notificationData, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) {
      return null;
    }

    return result;
  }

  async delete(uuid: string):  Promise<boolean> {
    const result = await this.collection.deleteOne({ uuid });

    return result.deletedCount > 0;
  }
}
