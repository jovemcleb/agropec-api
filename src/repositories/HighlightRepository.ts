import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { Collection, WithId } from "mongodb";
import {
  IHighlight,
  IHighlightResponse,
  ICreateHighlight,
  IUpdateHighlight,
} from "../interfaces/highlight";

export interface IHighlightRepository {
  getAll(): Promise<IHighlightResponse[]>;
  getByUuid(uuid: string): Promise<WithId<IHighlight> | null>;
  getByType(type: "activity" | "stand"): Promise<IHighlightResponse[]>;
  getByReferenceId(referenceId: string): Promise<IHighlightResponse[]>;
  create(highlight: ICreateHighlight, uuid?: string): Promise<IHighlightResponse>;
  update(
    uuid: string,
    highlight: Partial<IUpdateHighlight>
  ): Promise<WithId<IHighlight> | null>;
  delete(uuid: string): Promise<boolean>;
}

export class HighlightRepository implements IHighlightRepository {
  private collection: Collection<IHighlight>;

  constructor(fastify: FastifyInstance) {
    if (!fastify.mongo.db) {
      throw new Error("Database connection not available");
    }
    this.collection = fastify.mongo.db?.collection<IHighlight>("highlights");
  }

  async getAll(): Promise<IHighlightResponse[]> {
    const results = await this.collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return results.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as IHighlightResponse[];
  }

  async getByUuid(uuid: string): Promise<WithId<IHighlight> | null> {
    return await this.collection.findOne({ uuid });
  }

  async getByType(type: "activity" | "stand"): Promise<IHighlightResponse[]> {
    const results = await this.collection
      .find({ type })
      .sort({ createdAt: -1 })
      .toArray();

    return results.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as IHighlightResponse[];
  }

  async getByReferenceId(referenceId: string): Promise<IHighlightResponse[]> {
    const results = await this.collection
      .find({ referenceId })
      .sort({ createdAt: -1 })
      .toArray();

    return results.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as IHighlightResponse[];
  }

  async create(
    highlight: ICreateHighlight,
    uuid?: string
  ): Promise<IHighlightResponse> {
    const highlightData = {
      uuid: uuid || randomUUID(),
      ...highlight,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection?.insertOne(highlightData);

    if (!result || !result.acknowledged) {
      throw new Error("Failed to create highlight");
    }

    return {
      _id: result.insertedId.toString(),
      ...highlightData,
    };
  }

  async update(
    uuid: string,
    highlight: Partial<IUpdateHighlight>
  ): Promise<WithId<IHighlight> | null> {
    const result = await this.collection?.findOneAndUpdate(
      { uuid },
      {
        $set: {
          ...highlight,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result || null;
  }

  async delete(uuid: string): Promise<boolean> {
    const result = await this.collection?.deleteOne({ uuid });
    return result ? result.deletedCount > 0 : false;
  }
} 