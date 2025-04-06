// routes/workouts/$workoutId/sets.tsx

import { ActionFunction, json } from "@remix-run/node";
import { addSetToWorkout, removeSetFromWorkout } from "~/services/workout";
import { requirePredicate } from "~/utils/auth.server";
import {
    handleError,
    validateDatabaseId,
    validateRequestBody,
} from "~/utils/util.server";
import {
    addSetToWorkoutSchema,
    removeSetFromWorkoutSchema,
} from "~/validation/workout";

export const action: ActionFunction = async ({ request, params }) => {
    const { user } = await requirePredicate(request, { user: true });
    const method = request.method.toUpperCase();
    const workoutId = validateDatabaseId(params.id);

    try {
        if (method === "POST") {
            const body = await validateRequestBody(request);
            const validatedBody = addSetToWorkoutSchema.parse(body);
            const result = await addSetToWorkout(
                user,
                workoutId,
                validatedBody,
            );
            return json(result, { status: 200 });
        }

        if (method === "DELETE") {
            const body = await validateRequestBody(request);
            const validatedBody = removeSetFromWorkoutSchema.parse(body);
            const result = await removeSetFromWorkout(
                user,
                workoutId,
                validatedBody,
            );
            return json(result, { status: 200 });
        }

        return json({ error: "Method not allowed" }, { status: 405 });
    } catch (err) {
        return handleError(err);
    }
};
