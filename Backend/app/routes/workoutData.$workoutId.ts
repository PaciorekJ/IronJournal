import { ActionFunctionArgs, data, LoaderFunctionArgs } from "@remix-run/node";
import {
    deleteWorkoutData,
    getWorkoutDataById,
    updateWorkoutData,
} from "~/services/workoutData";
import { requirePredicate } from "~/utils/auth.server";
import {
    handleError,
    validateDatabaseId,
    validateRequestBody,
} from "~/utils/util.server";
import { updateWorkoutDataSchema } from "~/validation/workoutData";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const workoutId = validateDatabaseId(params.workoutId || "");
    if (!workoutId) {
        return data({ error: "Invalid workoutId" }, { status: 400 });
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const result = await getWorkoutDataById(user, workoutId, searchParams);
    return data(result, { status: 200 });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const workoutId = validateDatabaseId(params.workoutId || "");
    if (!workoutId) {
        return data({ error: "Invalid workoutId" }, { status: 400 });
    }

    const method = request.method.toUpperCase();
    let result = null;

    try {
        switch (method) {
            case "PATCH":
                const requestData = await validateRequestBody(request);
                const validatedData =
                    updateWorkoutDataSchema.parse(requestData);
                result = await updateWorkoutData(
                    user,
                    workoutId,
                    validatedData,
                );
                return data(result, { status: 200 });

            case "DELETE":
                result = await deleteWorkoutData(user, workoutId);
                return data(result, { status: 200 });

            default:
                return data({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (error) {
        return handleError(error);
    }
};
