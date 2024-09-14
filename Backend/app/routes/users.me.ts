import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { ROLE } from "~/constants/role";
import { deleteUser, readUserByFirebaseId, updateUser } from "~/services/user-service";
import { requireAuth, requireRole } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { uid: firebaseId } = await requireAuth(request);
    const result = await readUserByFirebaseId(firebaseId);

    return json(result.data, { status: result.status });
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const user = await requireRole(request, ROLE.USER);
    const method = request.method.toUpperCase()

    if (!user) {
        return json({ error: "User not found" }, { status: 404 });
    }

    switch (method) {
        case "PATCH": {
            const body = await request.json();
            const result = await updateUser({...body, userId: user._id as string});
            
            return json(result, { status: result.status });
        }

        case "DELETE": {
            const result = await deleteUser({
                userId: user._id as string
            });
            return json(result, { status: result.status });
        }

        default: {
            return json({ error: "Method not allowed" }, { status: 405 });
        }
    }
}