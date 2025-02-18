import { data, LoaderFunctionArgs } from "@remix-run/node";
import { readUserById } from "~/services/user";
import { requirePredicate } from "~/utils/auth.server";
import { validateDatabaseId } from "~/utils/util.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const userId = validateDatabaseId(params.id || "");
    const result = await readUserById(user, userId);

    return data(result, { status: 200 });
};
