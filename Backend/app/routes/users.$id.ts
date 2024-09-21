import { json, LoaderFunctionArgs } from "@remix-run/node";
import { readUserById } from "~/services/user-service";
import { isLoginValid } from "~/utils/auth.server";
import { validateDatabaseId } from "~/utils/util.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    await isLoginValid(request);

    const userId = validateDatabaseId(params.id || "");
    const result = await readUserById(userId);

    return json(result, { status: 200 });
};
