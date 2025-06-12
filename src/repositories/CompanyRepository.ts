import { FastifyInstance } from "fastify";
import { ICompany, IUpdateCompany } from "../interfaces/company";

export class CompanyRepository {
  private collection;

  constructor(fastify: FastifyInstance) {
    this.collection = fastify.mongo.db?.collection<ICompany>("companies");
  }

  async create(company: ICompany) {
    const result = await this.collection?.insertOne(company);

    if (!result || !result.acknowledged) {
      throw new Error("Failed to create company");
    }

    return {
      id: result.insertedId.toString(),
      ...company,
    };
  }

  async findAll(): Promise<ICompany[]> {
    const companies = await this.collection?.find().toArray();

    if (!companies) {
      throw new Error("No companies found");
    }

    return companies;
  }

  async findByName(name: string): Promise<ICompany | null> {
    const company = await this.collection?.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (!company) {
      return null;
    }

    return company;
  }

  async findByUuid(uuid: string) {
    const company = await this.collection?.findOne({ uuid });

    return company;
  }

  async update(uuid: string, company: IUpdateCompany) {
    const updatedCompany = await this.collection?.findOneAndUpdate(
      { uuid },
      { $set: { ...company, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!updatedCompany) {
      throw new Error("Failed to update company");
    }

    return updatedCompany;
  }

  async delete(uuid: string) {
    const result = await this.collection?.deleteOne({ uuid });

    if (!result || result.deletedCount === 0) {
      throw new Error("Failed to delete company");
    }

    return { success: true };
  }
}
