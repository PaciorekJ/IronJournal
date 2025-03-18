import { ActionFunctionArgs, data, LoaderFunctionArgs } from "@remix-run/node";
import {
    createUser,
    deleteUser,
    readUserById,
    updateUser,
} from "~/services/user";
import { requirePredicate } from "~/utils/auth.server";
import { handleError, validateRequestBody } from "~/utils/util.server";
import { createUserSchema, updateUserSchema } from "~/validation/user.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });
    const result = await readUserById(user, user._id.toString());
    return data(result, { status: 200 });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const method = request.method.toUpperCase();
    let result = null;

    try {
        switch (method) {
            case "POST":
                const { firebaseToken } = await requirePredicate(request, {
                    firebaseToken: true,
                });

                const requestData = await validateRequestBody(request);
                const validatedData = createUserSchema.parse({
                    ...requestData,
                    firebaseId: firebaseToken.uid,
                });

                result = await createUser(validatedData);
                return data(result, { status: 201 });

            case "PATCH":
                const { user: patchUser } = await requirePredicate(request, {
                    user: true,
                });
                const patchRequestData = await validateRequestBody(request);
                const validatedPatchData =
                    updateUserSchema.parse(patchRequestData);
                result = await updateUser(patchUser, validatedPatchData);

                return data(result, { status: 200 });

            case "DELETE":
                const { user: deleteUserAccount } = await requirePredicate(
                    request,
                    { user: true },
                );
                result = await deleteUser(deleteUserAccount._id.toString());
                return data(result, { status: 200 });

            default:
                return data({ error: "Method not allowed" }, { status: 405 });
        }
    } catch (error) {
        return handleError(error);
    }
};
