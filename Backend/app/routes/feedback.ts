import { ActionFunction, json } from "@remix-run/node";
import { createFeedback } from "~/services/feedback";
import { requirePredicate } from "~/utils/auth.server";
import { handleError, validateRequestBody } from "~/utils/util.server";
import { createFeedbackSchema } from "~/validation/feedback";

export const action: ActionFunction = async ({ request }) => {
    // ensure we have a logged‑in user
    const { user } = await requirePredicate(request, { user: true });

    try {
        // parse & validate request body
        const body = await validateRequestBody(request);
        const feedbackData = createFeedbackSchema.parse(body);

        // create feedback (notifications + Discord)
        const result = await createFeedback(user, feedbackData);

        return json(result, { status: 201 });
    } catch (err) {
        return handleError(err);
    }
};
