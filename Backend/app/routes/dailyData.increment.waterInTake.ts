import { ActionFunction, data } from "@remix-run/node";
import { incrementWaterIntake } from "~/services/daily-data";
import { requirePredicate } from "~/utils/auth.server";
import { handleError, validateRequestBody } from "~/utils/util.server";
import { createDailyDataSchema } from "~/validation/daily-data.server";

export const action: ActionFunction = async ({ request }) => {
    const { user } = await requirePredicate(request, { user: true });
    const method = request.method.toUpperCase();

    let result = null;

    try {
        switch (method) {
            case "PATCH":
                const requestData = await validateRequestBody(request);
                const validatedData = createDailyDataSchema.parse(requestData);
                result = await incrementWaterIntake(user, validatedData);
                return data(result, { status: 200 });

            default:
                return data({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (error) {
        return handleError(error);
    }
};
