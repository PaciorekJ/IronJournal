import { z } from "zod";
import { SetDataSchema } from "../setData";

export const SupersetDataSchema = z.object({
    setData: z.array(z.lazy(() => SetDataSchema)),
});
