import { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";
import { createSet, readSets } from "~/services/set-service";
import { requireAuth } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request }) => {
    await requireAuth(request);

    const method = request.method.toUpperCase();
    if (method !== "POST") {
        return json({ error: "Method not allowed" }, { status: 405 });
    }

    const body = await request.json();
    const createResult = await createSet(body);
    return json(createResult, { status: createResult.status });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await requireAuth(request);
    
    const result = await readSets(request);

    return json(result.data, { status: result.status });
};
