import mongodb from "@fastify/mongodb";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export const mongo = fp(async (fastify: FastifyInstance) => {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const mongoDb = process.env.MONGODB_DB || "agropec";

  fastify.register(mongodb, {
    url: mongoUri,
    database: mongoDb,
    forceClose: true,
  });
});
