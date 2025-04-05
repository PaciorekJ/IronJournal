import { ActionFunction, LoaderFunction, data, json } from "@remix-run/node";
import {
    deleteNotification,
    readNotificationById,
    updateNotification,
} from "~/services/notification";
import { requirePredicate } from "~/utils/auth.server";
import {
    handleError,
    validateDatabaseId,
    validateRequestBody,
} from "~/utils/util.server";
import { updateNotificationSchema } from "~/validation/notifications";

export const loader: LoaderFunction = async ({ request, params }) => {
    const { user } = await requirePredicate(request, {
        user: true,
    });

    const { notificationId: rawNotificationId } = params;
    const notificationId = validateDatabaseId(rawNotificationId);

    try {
        const result = await readNotificationById(user, notificationId);

        return data(result, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
};

export const action: ActionFunction = async ({ request, params }) => {
    const { user } = await requirePredicate(request, {
        user: true,
    });
    const method = request.method.toUpperCase();

    const { notificationId: rawNotificationId } = params;
    const notificationId = validateDatabaseId(rawNotificationId);

    try {
        switch (method) {
            case "PUT": {
                const body = await validateRequestBody(request);
                const validatedData = updateNotificationSchema.parse(body);

                const result = await updateNotification(
                    user,
                    notificationId,
                    validatedData,
                );
                return data(result, { status: 200 });
            }

            case "DELETE": {
                const result = await deleteNotification(user, notificationId);
                return data(result, { status: 200 });
            }

            default:
                return json({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (err) {
        return handleError(err);
    }
};
