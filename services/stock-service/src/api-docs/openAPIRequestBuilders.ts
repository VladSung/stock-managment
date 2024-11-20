import type { AnyZodObject, z } from "zod";

export function createApiRequest(
  schema: z.ZodObject<{ params?: AnyZodObject; query?: AnyZodObject; body: z.ZodTypeAny }>,
  description?: string,
) {
  return {
    params: schema.shape.params,
    query: schema.shape.query,
    body: {
      description,
      content: {
        "application/json": {
          schema: schema.shape.body,
        },
      },
    },
  };
}
