import { FastifyInstance } from "fastify";
import {
  ICompany,
  ICompanyResponse,
  IUpdateCompany,
} from "../interfaces/company";

export interface ICompanyRepository {
 update(
  uuid: string,
  company: Partial<IUpdateCompany>
 ) : Promise<ICompany | null>;
}
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

  async findByName(name: string): Promise<ICompanyResponse | null> {
    const company = await this.collection?.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (!company) {
      return null;
    }

    return {
      _id: company._id.toString(),
      uuid: company.uuid,
      name: company.name,
      description: company.description,
    };
  }

  async findByUuid(uuid: string) {
    const company = await this.collection?.findOne({ uuid });

    return company;
  }

  async update(uuid: string, company: Partial<IUpdateCompany>) {
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
