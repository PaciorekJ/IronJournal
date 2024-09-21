import { json, LoaderFunctionArgs } from "@remix-run/node";
import {
    deleteSetPrototype,
    updateSetPrototype,
} from "~/services/set-prototype-service";
import { requirePredicate } from "~/utils/auth.server";
import {
    handleError,
    validateDatabaseId,
    validateRequestBody,
} from "~/utils/util.server";
import { updateSetPrototypeSchema } from "~/validation/set-prototype.server";

export const action = async ({ request, params }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });
    const method = request.method.toUpperCase();
    const id = validateDatabaseId(params.id || "");

    let result = null;

    try {
        switch (method) {
            case "PATCH":
                const requestData = await validateRequestBody(request);
                const validatedData =
                    updateSetPrototypeSchema.parse(requestData);
                result = await updateSetPrototype(user, id, validatedData);
                return json(result, { status: 200 });

            case "DELETE":
                result = await deleteSetPrototype(user, id);
                return json(result, { status: 200 });

            default:
                return json({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (error) {
        return handleError(error);
    }
};
