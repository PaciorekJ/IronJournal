import { ActionFunction, data, LoaderFunctionArgs } from "@remix-run/node";
import { createWorkout, readWorkouts } from "~/services/workout-service";
import { requirePredicate } from "~/utils/auth.server";
import { handleError, validateRequestBody } from "~/utils/util.server";
import { createWorkoutPrototypeSchema } from "~/validation/workout-prototype";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);

    const result = await readWorkouts(user, searchParams);
    return data(result, { status: 200 });
};

export const action: ActionFunction = async ({ request }) => {
    const { user } = await requirePredicate(request, { user: true });
    const method = request.method.toUpperCase();

    if (method !== "POST") {
        return data({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const requestData = await validateRequestBody(request);

        const validatedData = createWorkoutPrototypeSchema.parse(requestData);

        const result = await createWorkout(user, validatedData);

        return data(result, { status: 201 });
    } catch (error) {
        return handleError(error);
    }
};
