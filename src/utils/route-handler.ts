import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

type SchemaInfer<T extends z.ZodType> = z.infer<T>;

export function createRouteHandler<
  T extends {
    response: z.ZodType;
    body?: z.ZodType;
    params?: z.ZodType;
    query?: z.ZodType;
  },
>(schema: T) {
  return function <
    F extends (
      request: FastifyRequest<{
        Body: T["body"] extends z.ZodType ? SchemaInfer<T["body"]> : never;
        Params: T["params"] extends z.ZodType
          ? SchemaInfer<T["params"]>
          : never;
        Querystring: T["query"] extends z.ZodType
          ? SchemaInfer<T["query"]>
          : never;
      }>,
      reply: FastifyReply
    ) => Promise<SchemaInfer<T["response"]>>,
  >(fn: F): F {
    return fn;
  };
}
