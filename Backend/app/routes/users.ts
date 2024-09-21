import { ActionFunctionArgs, json } from "@remix-run/node";
import { readUsers } from "~/services/user-service";
import { isLoginValid } from "~/utils/auth.server";

export const loader = async ({ request }: ActionFunctionArgs) => {
    await isLoginValid(request);

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);

    const result = await readUsers(searchParams);

    return json(result, { status: 200 });
};
