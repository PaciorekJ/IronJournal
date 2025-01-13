import { ActionFunctionArgs, data, LoaderFunctionArgs } from "@remix-run/node";
import {
    createOneRepMaxData,
    readOneRepMaxData,
} from "~/services/one-rep-max-data-service";
import { requirePredicate } from "~/utils/auth.server";
import { handleError, validateRequestBody } from "~/utils/util.server";
import { createOneRepMaxDataSchema } from "~/validation/one-rep-max-data.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    try {
        const url = new URL(request.url);
        const searchParams = url.searchParams;

        const result = await readOneRepMaxData(user, searchParams);

        return data(result, { status: 200 });
    } catch (error) {
        return handleError(error);
    }
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });
    const method = request.method.toUpperCase();

    try {
        switch (method) {
            case "POST": {
                const requestData = await validateRequestBody(request);
                const validatedData =
                    createOneRepMaxDataSchema.parse(requestData);

                const result = await createOneRepMaxData(
                    user,
                    validatedData.exercise,
                    validatedData.weight,
                );

                return data(result, { status: 201 });
            }

            default:
                return data({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (error) {
        return handleError(error);
    }
};
