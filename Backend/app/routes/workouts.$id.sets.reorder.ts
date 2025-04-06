// routes/workouts/$workoutId/sets.reorder.tsx

import { ActionFunction, json } from "@remix-run/node";
import { reorderSetsInWorkout } from "~/services/workout";
import { requirePredicate } from "~/utils/auth.server";
import { handleError, validateRequestBody } from "~/utils/util.server";
import { reorderSetsSchema } from "~/validation/workout";

export const action: ActionFunction = async ({ request, params }) => {
    const { user } = await requirePredicate(request, { user: true });
    const workoutId = params.workoutId!;
    try {
        const body = await validateRequestBody(request);
        const validatedBody = reorderSetsSchema.parse(body);

        if (validatedBody.fromIndex === validatedBody.toIndex) {
            return json({ message: "No changes" }, { status: 200 });
        }

        const result = await reorderSetsInWorkout(
            user,
            workoutId,
            validatedBody,
        );
        return json(result, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
};
