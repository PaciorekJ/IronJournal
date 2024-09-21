import { ActionFunction, json, LoaderFunctionArgs } from "@remix-run/node";
import {
    createSetPrototype,
} from "~/services/set-prototype-service";
import { requirePredicate } from "~/utils/auth.server";
import { handleError, validateRequestBody } from "~/utils/util.server";
import { createSetPrototypeSchema } from "~/validation/set-prototype.server";

export const action: ActionFunction = async ({ request }) => {
    const { user } = await requirePredicate(request, { user: true });
    const method = request.method.toUpperCase();

    let result = null;

    try {
        switch (method) {
            case "POST":
                const requestData = await validateRequestBody(request);
                const validatedData =
                    createSetPrototypeSchema.parse(requestData);
                result = await createSetPrototype(user, validatedData);
                return json(result, { status: 201 });

            default:
                return json({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (error) {
        return handleError(error);
    }
};
