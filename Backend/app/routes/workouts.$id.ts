import { json, LoaderFunctionArgs } from "@remix-run/node";
import {
    deleteWorkoutPrototype,
    readWorkoutPrototypeById,
    updateWorkoutPrototype,
} from "~/services/workout-prototype-service";
import { requirePredicate } from "~/utils/auth.server";
import {
    handleError,
    validateDatabaseId,
    validateRequestBody,
} from "~/utils/util.server";
import { updateWorkoutPrototypeSchema } from "~/validation/workout-prototype";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);

    const id = validateDatabaseId(params.id || "");

    const result = await readWorkoutPrototypeById(user, id, searchParams);
    return json(result, { status: 200 });
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const method = request.method.toUpperCase();
    const id = validateDatabaseId(params.id || "");

    let result = null;

    try {
        switch (method) {
            case "PATCH":
                const requestData = await validateRequestBody(request);

                const validatedData =
                    updateWorkoutPrototypeSchema.parse(requestData);

                result = await updateWorkoutPrototype(user, id, validatedData);
                return json(result, { status: 200 });

            case "DELETE":
                result = await deleteWorkoutPrototype(user, id);
                return json(result, { status: 200 });

            default:
                return json({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (error) {
        return handleError(error);
    }
};
