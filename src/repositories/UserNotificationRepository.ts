import { FastifyInstance } from "fastify";
import { IUserNotification } from "../interfaces/userNotification";

export class UserNotificationRepository {
  private collection;

  constructor(fastify: FastifyInstance) {
    this.collection =
      fastify.mongo.db?.collection<IUserNotification>("user_notifications");
  }

  async create(userNotification: IUserNotification) {
    const result = await this.collection?.insertOne(userNotification);

    if (!result) {
      throw new Error("Failed to create user notification");
    }

    return {
      id: result.insertedId.toString(),
      ...userNotification,
    };
  }

  async findByUserId(userId: string): Promise<IUserNotification[]> {
    const notifications = await this.collection
      ?.find({ userId })
      .sort({ date: -1, time: -1 })
      .toArray();

    if (!notifications) {
      throw new Error("Failed to find user notifications");
    }

    return notifications;
  }

  async findByNotificationId(
    notificationId: string
  ): Promise<IUserNotification | null> {
    const notification = await this.collection?.findOne({ notificationId });

    if (!notification) {
      throw new Error("Failed to find user notification");
    }

    return notification;
  }

  async updateStatus(
    uuid: string,
    status: "read" | "pending" | "delivered"
  ): Promise<boolean> {
    const result = await this.collection?.updateOne(
      { uuid },
      { $set: { status } }
    );

    if (!result) {
      throw new Error("Failed to update user notification status");
    }

    return result.modifiedCount > 0;
  }

  async deleteByEventId(userId: string, eventId: string): Promise<boolean> {
    // Deletar todas as notificações pendentes relacionadas ao evento
    const result = await this.collection?.deleteMany({
      userId,
      eventId,
      status: "pending", // Só deletar notificações pendentes, manter as já entregues/lidas
    });

    if (!result) {
      throw new Error("Failed to delete user notifications");
    }

    return result.deletedCount > 0;
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await this.collection?.deleteMany({ userId });

    if (!result) {
      throw new Error("Failed to delete user notifications");
    }

    return result.deletedCount > 0;
  }

  async deleteByNotificationId(uuid: string): Promise<boolean> {
    const result = await this.collection?.deleteOne({ uuid });

    if (!result) {
      throw new Error("Failed to delete user notification");
    }

    return result.deletedCount > 0;
  }

  async markAsDelivered(uuid: string): Promise<boolean> {
    return this.updateStatus(uuid, "delivered");
  }

  async markAsRead(uuid: string): Promise<boolean> {
    return this.updateStatus(uuid, "read");
  }

  async getUnreadNotifications(userId: string): Promise<IUserNotification[]> {
    const notifications = await this.collection
      ?.find({
        userId,
        status: { $in: ["pending", "delivered"] },
      })
      .sort({ date: -1, time: -1 })
      .toArray();

    if (!notifications) {
      throw new Error("Failed to get unread notifications");
    }

    return notifications;
  }
}
