import { z } from "zod";

export const CompanySchema = z.object({
  uuid: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateCompanySchema = CompanySchema.omit({
  uuid: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateCompanySchema = CompanySchema.partial().required({
  uuid: true,
});

export type ICompany = z.infer<typeof CompanySchema>;
export type ICreateCompany = z.infer<typeof CreateCompanySchema>;
export type IUpdateCompany = z.infer<typeof UpdateCompanySchema>;

export interface ICompanyResponse extends ICompany {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
