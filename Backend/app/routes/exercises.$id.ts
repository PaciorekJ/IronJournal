import { json, LoaderFunctionArgs } from "@remix-run/node";
import {
    deleteExercise,
    readExerciseById,
    updateExercise,
} from "~/services/exercise-service";
import { requirePredicate } from "~/utils/auth.server";
import {
    handleError,
    validateDatabaseId,
    validateRequestBody,
} from "~/utils/util.server";
import { updateExerciseSchema } from "~/validation/exercise.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const id = validateDatabaseId(params.id || "");

    const result = await readExerciseById(user, id);

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
                const validatedData = updateExerciseSchema.parse(requestData);
                result = await updateExercise(user, id, validatedData);
                return json(result, { status: 200 });

            case "DELETE":
                result = await deleteExercise(user, id);
                return json(result, { status: 200 });

            default:
                return json({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (error) {
        return handleError(error);
    }
};
