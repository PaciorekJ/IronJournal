import { ActionFunctionArgs, data, LoaderFunctionArgs } from "@remix-run/node";
import {
    deleteSetData,
    readSetDataById,
    updateSetData,
} from "~/services/setData";
import { requirePredicate } from "~/utils/auth.server";
import {
    handleError,
    validateDatabaseId,
    validateRequestBody,
} from "~/utils/util.server";
import { updateSetDataSchema } from "~/validation/setData";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const setId = validateDatabaseId(params.setId || "");

    if (!setId) {
        return data({ error: "Invalid setId" }, { status: 400 });
    }

    const result = await readSetDataById(user, setId);

    return data(result, { status: 200 });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });
    const method = request.method.toUpperCase();

    const setId = validateDatabaseId(params.setId || "");
    const workoutId = validateDatabaseId(params.workoutId || "");

    if (!setId || !workoutId) {
        return data(
            { error: "Invalid workoutDataId or setDataId" },
            { status: 400 },
        );
    }

    let result = null;

    try {
        switch (method) {
            case "DELETE":
                result = await deleteSetData(user, workoutId, setId);
                return result;

            case "PATCH":
                const requestData = await validateRequestBody(request);
                const validatedData = updateSetDataSchema.parse(requestData);

                result = await updateSetData(
                    user,
                    workoutId,
                    setId,
                    validatedData,
                );

                return result;

            default:
                return data({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (error) {
        return handleError(error);
    }
};
