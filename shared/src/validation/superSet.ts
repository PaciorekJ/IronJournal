import { z } from "zod";
import { SetSchema } from "./sets";

export const SupersetSchema = z.object({
    sets: z.array(z.lazy(() => SetSchema)),
});

export type Superset = z.infer<typeof SupersetSchema>;
