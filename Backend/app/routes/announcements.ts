import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { createAnnouncement, readAnnouncements } from "~/services/announcement";
import { authenticateDiscordBot, requirePredicate } from "~/utils/auth.server";
import { handleError, validateRequestBody } from "~/utils/util.server";
import { createAnnouncementSchema } from "~/validation/announcement";

export const loader: LoaderFunction = async ({ request }) => {
    try {
        // allow either your bot or a logged‑in user to read
        try {
            await authenticateDiscordBot(request);
        } catch {
            await requirePredicate(request, { user: true });
        }

        const url = new URL(request.url);
        const searchParams = url.searchParams;
        const result = await readAnnouncements(searchParams);
        return json(result, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
};

export const action: ActionFunction = async ({ request }) => {
    // only your bot may create
    await authenticateDiscordBot(request);

    try {
        const body = await validateRequestBody(request);
        const data = createAnnouncementSchema.parse(body);
        const result = await createAnnouncement(data);
        return json(result, { status: 201 });
    } catch (err) {
        return handleError(err);
    }
};
