import { json, LoaderFunctionArgs } from "@remix-run/node";
import { readExerciseById } from "~/services/exercise-service";
import { isLoginValid } from "~/utils/auth.server";
import { validateDatabaseId } from "~/utils/util.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    await isLoginValid(request);

    const id = validateDatabaseId(params.id || "");

    const result = await readExerciseById(id);

    if (result.status !== 200) {
        return json({ error: result.error }, { status: result.status });
    }

    return json(result, { status: 200 });
};
