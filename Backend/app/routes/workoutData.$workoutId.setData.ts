import { ActionFunctionArgs, data } from "@remix-run/node";
import { createSetData } from "~/services/setData";
import { requirePredicate } from "~/utils/auth.server";
import {
    handleError,
    validateDatabaseId,
    validateRequestBody,
} from "~/utils/util.server";
import { createSetDataSchema } from "~/validation/setData";

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const method = request.method.toUpperCase();

    const workoutId = validateDatabaseId(params.workoutId || "");

    if (!workoutId) {
        return data({ error: "Invalid workoutId" }, { status: 400 });
    }

    let result = null;

    try {
        switch (method) {
            case "POST":
                const requestData = await validateRequestBody(request);
                const validatedData = createSetDataSchema.parse(requestData);
                result = await createSetData(user, workoutId, validatedData);
                return data(result, { status: 201 });

            default:
                return data({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (error) {
        return handleError(error);
    }
};
