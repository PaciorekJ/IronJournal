import { ActionFunction, data, LoaderFunctionArgs } from "@remix-run/node";
import { createExercise, readExercises } from "~/services/exercise-service";
import { requirePredicate } from "~/utils/auth.server";
import { handleError, validateRequestBody } from "~/utils/util.server";
import { createExerciseSchema } from "~/validation/exercise.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);

    const result = await readExercises(user, searchParams);

    return data(result, { status: 200 });
};

export const action: ActionFunction = async ({ request }) => {
    const { user } = await requirePredicate(request, { user: true });
    const method = request.method.toUpperCase();

    let result = null;

    try {
        switch (method) {
            case "POST":
                const requestData = await validateRequestBody(request);
                const validatedData = createExerciseSchema.parse(requestData);
                result = await createExercise(user, validatedData);
                return data(result, { status: 201 });

            default:
                return data({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (error) {
        console.error(error);
        return handleError(error);
    }
};
