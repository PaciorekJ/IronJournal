import { ActionFunctionArgs, data, json } from "@remix-run/node";
import { markNotificationsAsReadBulk } from "~/services/notification";
import { requirePredicate } from "~/utils/auth.server";
import {
    handleError,
    validateDatabaseId,
    validateRequestBody,
} from "~/utils/util.server";
import { markAsReadSchema } from "~/validation/notifications";

export const action = async ({ request }: ActionFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });
    const method = request.method.toUpperCase();

    try {
        switch (method) {
            case "POST": {
                const body = await validateRequestBody(request);
                const { ids } = markAsReadSchema.parse(body);

                ids.forEach((raw) => validateDatabaseId(raw));

                const result = await markNotificationsAsReadBulk(user, ids);
                return data(result, { status: 200 });
            }

            default:
                return json({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (err) {
        return handleError(err);
    }
};
