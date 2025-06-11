import { z } from "zod";

export const CompanySchema = z.object({
  uuid: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  updatedBy: z.string().uuid().optional(),
  createdBy: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateCompanySchema = CompanySchema.omit({
  uuid: true,
  updatedBy: true,
  updatedAt: true,
});
export const UpdateCompanySchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    updatedBy: z.string().uuid().optional(),
  })
  .refine((data) => data.name || data.description, {
    message: "Pelo menos um campo deve ser fornecido",
  });

export type ICompany = z.infer<typeof CompanySchema>;
export type ICreateCompany = z.infer<typeof CreateCompanySchema>;
export type IUpdateCompany = z.infer<typeof UpdateCompanySchema>;

export interface ICompanyResponse extends ICompany {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}
