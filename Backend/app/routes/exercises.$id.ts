import { json, LoaderFunctionArgs } from "@remix-run/node";
import { readExerciseById } from "~/services/exercise-service";
import { requirePredicate } from "~/utils/auth.server";
import { validateDatabaseId } from "~/utils/util.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const id = validateDatabaseId(params.id || "");

    const result = await readExerciseById(user, id);

    return json(result, { status: 200 });
};
