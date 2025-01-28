import { ActionFunctionArgs, data } from "@remix-run/node";
import { deleteSetData } from "~/services/set-data-service";
import { requirePredicate } from "~/utils/auth.server";
import { handleError, validateDatabaseId } from "~/utils/util.server";

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });
    const method = request.method.toUpperCase();

    try {
        switch (method) {
            case "DELETE": {
                const setId = validateDatabaseId(params.setId || "");
                const workoutId = validateDatabaseId(params.workoutId || "");

                const result = await deleteSetData(user, workoutId, setId);

                return data(result, { status: 200 });
            }

            default:
                return data({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (error) {
        return handleError(error);
    }
};
