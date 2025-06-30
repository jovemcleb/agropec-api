import { FastifyInstance } from "fastify";
import { ICategory } from "../interfaces/category";

export class CategoryRepository {
  private collection;

  constructor(fastify: FastifyInstance) {
    this.collection = fastify.mongo.db?.collection<ICategory>("categories");
  }

  async create(category: ICategory) {
    const now = new Date();
    const categoryWithDates = {
      ...category,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection?.insertOne(categoryWithDates);

    if (!result || !result.acknowledged) {
      throw new Error("Failed to create category");
    }

    return {
      id: result.insertedId.toString(),
      ...categoryWithDates,
    };
  }

  async findAll(): Promise<ICategory[]> {
    const categories = await this.collection?.find().toArray();
    if (!categories) {
      throw new Error("No categories found");
    }

    return categories;
  }

  async findByName(name: string): Promise<ICategory | null> {
    const category = await this.collection?.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (!category) {
      return null;
    }

    return category;
  }

  async findByUuid(uuid: string) {
    const category = await this.collection?.findOne({ uuid });

    return category;
  }

  async update(uuid: string, category: Partial<ICategory>) {
    const newCategory = await this.collection?.findOneAndUpdate(
      { uuid },
      {
        $set: {
          ...category,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );
    if (!newCategory) {
      throw new Error("Failed to update category");
    }

    return newCategory;
  }

  async delete(uuid: string) {
    const result = await this.collection?.deleteOne({ uuid });

    if (!result || result.deletedCount === 0) {
      throw new Error("Failed to delete category");
    }

    return { success: true };
  }
}
