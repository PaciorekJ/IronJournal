import { ActionFunction, json, LoaderFunctionArgs } from "@remix-run/node";
import {
    createWorkoutPrototype,
    readWorkoutPrototypes,
} from "~/services/workout-prototype-service";
import { requirePredicate } from "~/utils/auth.server";
import { handleError, validateRequestBody } from "~/utils/util.server";
import { createWorkoutPrototypeSchema } from "~/validation/workout-prototype";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);

    const result = await readWorkoutPrototypes(user, searchParams);
    return json(result, { status: 200 });
};

export const action: ActionFunction = async ({ request }) => {
    const { user } = await requirePredicate(request, { user: true });
    const method = request.method.toUpperCase();

    if (method !== "POST") {
        return json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const requestData = await validateRequestBody(request);

        const validatedData = createWorkoutPrototypeSchema.parse(requestData);

        const result = await createWorkoutPrototype(user, validatedData);

        return json(result, { status: 201 });
    } catch (error) {
        return handleError(error);
    }
};
