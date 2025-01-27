import { ActionFunction, data, LoaderFunction } from "@remix-run/node";
import { deleteDailyData, readDailyDataById } from "~/services/daily-data";
import { requirePredicate } from "~/utils/auth.server";
import { handleError, validateDatabaseId } from "~/utils/util.server";

export const loader: LoaderFunction = async ({ request, params }) => {
    const { user } = await requirePredicate(request, { user: true });

    const id = validateDatabaseId(params.id || "");

    const result = await readDailyDataById(user, id);
    return data(result, { status: 200 });
};

export const action: ActionFunction = async ({ request, params }) => {
    const { user } = await requirePredicate(request, { user: true });
    const method = request.method.toUpperCase();

    const id = validateDatabaseId(params.id || "");

    let result = null;

    try {
        switch (method) {
            case "DELETE":
                result = await deleteDailyData(user, id);
                return data(result, { status: 201 });

            default:
                return data({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (error) {
        return handleError(error);
    }
};
