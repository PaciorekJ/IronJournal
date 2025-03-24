import { ActionFunctionArgs, data } from "@remix-run/node";
import { addFavorite } from "~/services/user";
import { requirePredicate } from "~/utils/auth.server";
import { handleError, validateRequestBody } from "~/utils/util.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        if (request.method.toUpperCase() !== "POST") {
            return data({ error: "Method not allowed" }, { status: 405 });
        }

        const { user } = await requirePredicate(request, { user: true });
        const requestData = await validateRequestBody(request);
        const { favoriteId, favoriteType } = requestData;

        const result = await addFavorite(
            user._id.toString(),
            favoriteId,
            favoriteType,
        );
        return data(result, { status: 201 });
    } catch (error) {
        return handleError(error);
    }
};
