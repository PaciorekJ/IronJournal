import { ActionFunction, json } from "@remix-run/node";
import { createNotification } from "~/services/notification";
import { authenticateDiscordBot } from "~/utils/auth.server";
import { handleError, validateRequestBody } from "~/utils/util.server";
import { createNotificationSchema } from "~/validation/notifications";

export const action: ActionFunction = async ({ request }) => {
    try {
        await authenticateDiscordBot(request); // Only the bot can create notifications

        const body = await validateRequestBody(request);
        const validatedData = createNotificationSchema.parse(body);

        const result = await createNotification(validatedData);

        return json(result, { status: 201 });
    } catch (err) {
        return handleError(err);
    }
};
