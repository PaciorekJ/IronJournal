import { ActionFunctionArgs, json } from "@remix-run/node";
import { createUser, readUsers } from "~/services/user-service";
import { requireAuth } from "~/utils/auth.server";

export const loader = async ({ request }: ActionFunctionArgs) => {
    await requireAuth(request);

    const result = await readUsers(request);

    return json(result.data, { status: result.status });
}

export const action = async ({ request }: ActionFunctionArgs) => {
    await requireAuth(request);
    
    const method = request.method.toUpperCase();
    const body = await request.json();
    
    switch (method) {
        case "POST": {
            const result = await createUser(body, request);

            return json(result, { status: result.status });
        }

        default: {
            return json({ error: "Method not allowed" }, { status: 405 });
        }
    }
}