import { json, LoaderFunctionArgs } from "@remix-run/node";
import { LANGUAGE } from "~/constants/language";
import { isLoginValid } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await isLoginValid(request);
    
    return json({ data: Object.values(LANGUAGE) });
};