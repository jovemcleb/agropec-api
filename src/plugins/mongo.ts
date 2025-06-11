import mongodb from "@fastify/mongodb";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export const mongo = fp(async (fastify: FastifyInstance) => {
  fastify.register(mongodb, {
    url: "mongodb://localhost:27017",
    database: "agropec",
    forceClose: true,
  });
});
