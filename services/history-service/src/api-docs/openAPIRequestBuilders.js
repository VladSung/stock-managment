export function createApiRequest(schema, description) {
  const body = schema.shape.body ? {
      description,
      content: {
        "application/json": {
          schema: schema.shape.body,
        },
      },
    } : undefined;

  return {
    params: schema.shape?.params,
    query: schema.shape?.query,
    body,
  };
}
