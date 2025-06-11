import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { hasZodFastifySchemaValidationErrors, isResponseSerializationError } from "fastify-type-provider-zod";
import { formatValidationError } from "../utils/error-messages";

export const errorHandler = (err: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
  if (err.code === 'FST_ERR_CTP_EMPTY_JSON_BODY') {
    return reply.code(400).send({
      error: "Bad Request",
      message: "Request body cannot be empty",
      statusCode: 400,
    });
  }

  if (hasZodFastifySchemaValidationErrors(err)) {
    return reply.code(400).send({
      error: "Validation Error",
      message: formatValidationError(err),
      statusCode: 400,
    });
  }

  if (isResponseSerializationError(err)) {
    return reply.code(500).send({
      error: "Internal Server Error",
      message: "Response doesn't match the schema",
      statusCode: 500,
    });
  }
}; 