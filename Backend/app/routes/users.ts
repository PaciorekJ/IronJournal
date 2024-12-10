import { ActionFunctionArgs, data, json } from "@remix-run/node";
import { readUsers } from "~/services/user-service";
import { requirePredicate } from "~/utils/auth.server";

export const loader = async ({ request }: ActionFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);

    const result = await readUsers(user, searchParams);

    return data(result, { status: 200 });
};
