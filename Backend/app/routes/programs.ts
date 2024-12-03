import { ActionFunction, data, LoaderFunction } from "@remix-run/node";
import { createProgram, readPrograms } from "~/services/program-service";
import { requirePredicate } from "~/utils/auth.server";
import { handleError, validateRequestBody } from "~/utils/util.server";
import { createProgramSchema } from "~/validation/program.server";

export const loader: LoaderFunction = async ({ request }) => {
    const { user } = await requirePredicate(request, { user: true });

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);

    const result = await readPrograms(user, searchParams);
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
                const validatedData = createProgramSchema.parse(requestData);
                result = await createProgram(user, validatedData);
                return data(result, { status: 201 });

            default:
                return data({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (error) {
        return handleError(error);
    }
};
