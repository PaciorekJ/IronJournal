import { json, LoaderFunctionArgs } from "@remix-run/node";
import { isLoginValid } from "~/utils/auth.server";
import { convertKeysToCamelCase } from "~/utils/util.server";
import { EXERCISE_CONSTANTS_MAP } from "./constants";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await isLoginValid(request);

    return json({ data: convertKeysToCamelCase(EXERCISE_CONSTANTS_MAP) });
};
