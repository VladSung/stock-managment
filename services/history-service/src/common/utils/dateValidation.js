import { z } from "zod";

export const dateValidation = z
    .string()
    .min(1, { message: 'mandatory' })
    // changes DD-MM-YYYY to YYYY-MM-DD
    // changes YYYY-MM-DD to YYYY-MM-DDT00:00:00.000Z
    .describe('Date in YYYY-MM-DD format')
    .transform((v) => `${v}T00:00:00.000Z`)
    .pipe(
        z
            .string()
            .datetime({ message: 'incorrect format' }),
);
