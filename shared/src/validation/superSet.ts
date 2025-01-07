import { z } from "zod";
import { SetSchema } from "./sets";

export const SupersetSchema = z.object({
    sets: z.array(z.lazy(() => SetSchema)),
});

export type ISuperset = z.infer<typeof SupersetSchema>;
