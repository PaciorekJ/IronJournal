import { ActionFunctionArgs, data } from "@remix-run/node";
import { deleteFavorite } from "~/services/user";
import { requirePredicate } from "~/utils/auth.server";
import { handleError, validateRequestBody } from "~/utils/util.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        if (request.method.toUpperCase() !== "DELETE") {
            return data({ error: "Method not allowed" }, { status: 405 });
        }

        const { user } = await requirePredicate(request, { user: true });
        const requestData = await validateRequestBody(request);
        const { favoriteId, favoriteType } = requestData;

        if (!favoriteId || !favoriteType) {
            return data(
                { error: "Missing favoriteId or favoriteType" },
                { status: 400 },
            );
        }

        if (favoriteType !== "program" && favoriteType !== "workout") {
            return data(
                {
                    error: "Invalid favoriteType: Must be 'program' or 'workout'",
                },
                { status: 400 },
            );
        }

        const result = await deleteFavorite(
            user._id.toString(),
            favoriteId,
            favoriteType,
        );
        return data(result, { status: 200 });
    } catch (error) {
        return handleError(error);
    }
};
