import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { ZodSchema } from 'zod';

interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export const validationPlugin: FastifyPluginAsync = async (fastify) => {
  const validateSchema = (schemas: ValidationSchemas) => {
    return async (request: any, reply: any) => {
      try {
        if (schemas.body && request.body) {
          request.body = schemas.body.parse(request.body);
        }
        
        if (schemas.params && request.params) {
          request.params = schemas.params.parse(request.params);
        }
        
        if (schemas.query && request.query) {
          request.query = schemas.query.parse(request.query);
        }
      } catch (error) {
        return reply.status(400).send({ 
          error: "Dados inválidos", 
          details: error 
        });
      }
    };
  };

  fastify.decorate('validateSchema', validateSchema);
};

export default fp(validationPlugin);

