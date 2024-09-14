import { json, LoaderFunctionArgs } from "@remix-run/node";
import { requireAuth } from "~/utils/auth.server";
import { convertKeysToCamelCase } from "~/utils/util.server";
import { PROGRAM_CONSTANTS_MAP } from "./constants";

export const loader = async ({request}: LoaderFunctionArgs) => {
	await requireAuth(request);
	return json(convertKeysToCamelCase(PROGRAM_CONSTANTS_MAP));
};
