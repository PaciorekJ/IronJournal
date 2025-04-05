// routes/notifications/me.tsx
import { data, LoaderFunctionArgs } from "@remix-run/node";
import { readNotifications } from "~/services/notification";
import { requirePredicate } from "~/utils/auth.server";
import { handleError } from "~/utils/util.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    try {
        const result = await readNotifications(user, searchParams);
        return data(result, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
};
