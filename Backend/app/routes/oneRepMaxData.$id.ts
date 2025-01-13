import { ActionFunctionArgs, data, LoaderFunctionArgs } from "@remix-run/node";
import {
    deleteOneRepMaxData,
    readOneRepMaxDataById,
} from "~/services/one-rep-max-data-service";
import { requirePredicate } from "~/utils/auth.server";
import { handleError, validateDatabaseId } from "~/utils/util.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });
    const id = validateDatabaseId(params.id || "");

    try {
        const url = new URL(request.url);
        const searchParams = url.searchParams;

        const result = await readOneRepMaxDataById(user, id, searchParams);

        return data(result, { status: 200 });
    } catch (error) {
        return handleError(error);
    }
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });
    const method = request.method.toUpperCase();

    try {
        switch (method) {
            case "DELETE": {
                const id = validateDatabaseId(params.id || "");
                const result = await deleteOneRepMaxData(user, id);

                return data(result, { status: 200 });
            }

            default:
                return data({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (error) {
        return handleError(error);
    }
};
