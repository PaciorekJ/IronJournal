import { ActionFunction, json } from "@remix-run/node";
import { createReport } from "~/services/report";
import { requirePredicate } from "~/utils/auth.server";
import { handleError, validateRequestBody } from "~/utils/util.server";
import { createReportSchema } from "~/validation/report";

export const action: ActionFunction = async ({ request }) => {
    // only authenticated users can file reports
    const { user } = await requirePredicate(request, { user: true });

    try {
        // parse & validate the incoming JSON
        const body = await validateRequestBody(request);
        const reportData = createReportSchema.parse(body);

        // create the report (DB + notification + Discord)
        const result = await createReport(user, reportData);

        return json(result, { status: 201 });
    } catch (err) {
        return handleError(err);
    }
};
