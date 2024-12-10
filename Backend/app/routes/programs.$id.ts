import { data, LoaderFunctionArgs } from "@remix-run/node";
import {
    deleteProgram,
    readProgramById,
    updateProgram,
} from "~/services/program-service";
import { requirePredicate } from "~/utils/auth.server";
import {
    handleError,
    validateDatabaseId,
    validateRequestBody,
} from "~/utils/util.server";
import { updateProgramSchema } from "~/validation/program.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const id = validateDatabaseId(params.id || "");

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);

    const result = await readProgramById(user, id, searchParams);
    return data(result, { status: 200 });
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });
    const method = request.method.toUpperCase();
    const id = validateDatabaseId(params.id || "");

    let result = null;

    try {
        switch (method) {
            case "PATCH":
                const requestData = await validateRequestBody(request);
                const validatedData = updateProgramSchema.parse(requestData);
                result = await updateProgram(user, id, validatedData);
                return data(result, { status: 200 });

            case "DELETE":
                result = await deleteProgram(user, id);
                return data(result, { status: 200 });

            default:
                return data({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (error) {
        return handleError(error);
    }
};
