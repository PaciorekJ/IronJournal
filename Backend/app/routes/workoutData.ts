import { ActionFunctionArgs, data, LoaderFunctionArgs } from "@remix-run/node";
import { createWorkoutData, getAllWorkoutData } from "~/services/workoutData";
import { requirePredicate } from "~/utils/auth.server";
import { handleError, validateRequestBody } from "~/utils/util.server";
import { createWorkoutDataSchema } from "~/validation/workoutData";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const result = await getAllWorkoutData(user, searchParams);
    return data(result, { status: 200 });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const method = request.method.toUpperCase();
    let result = null;

    try {
        switch (method) {
            case "POST":
                const requestData = await validateRequestBody(request);
                const validatedData =
                    createWorkoutDataSchema.parse(requestData);
                result = await createWorkoutData(user, validatedData);
                return data(result, { status: 201 });

            default:
                return data({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (error) {
        return handleError(error);
    }
};
