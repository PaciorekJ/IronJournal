import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import {
    deleteAnnouncement,
    readAnnouncementById,
    updateAnnouncement,
} from "~/services/announcement";
import { authenticateDiscordBot, requirePredicate } from "~/utils/auth.server";
import {
    handleError,
    validateDatabaseId,
    validateRequestBody,
} from "~/utils/util.server";
import { updateAnnouncementSchema } from "~/validation/announcement";

export const loader: LoaderFunction = async ({ request, params }) => {
    try {
        await authenticateDiscordBot(request);
    } catch (err) {
        await requirePredicate(request); // Check if its an authenticated user
    }
    try {
        const id = validateDatabaseId(params.id);
        const result = await readAnnouncementById(id);
        return json(result, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
};

export const action: ActionFunction = async ({ request, params }) => {
    await authenticateDiscordBot(request);

    const id = validateDatabaseId(params.id);
    const method = request.method.toUpperCase();

    try {
        switch (method) {
            case "PUT": {
                const body = await validateRequestBody(request);
                const data = updateAnnouncementSchema.parse(body);
                const result = await updateAnnouncement(id, data);
                return json(result, { status: 200 });
            }
            case "DELETE": {
                const result = await deleteAnnouncement(id);
                return json(result, { status: 200 });
            }
            default:
                return json({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (err) {
        return handleError(err);
    }
};
