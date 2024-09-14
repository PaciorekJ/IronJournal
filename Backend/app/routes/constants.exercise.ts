import { json, LoaderFunctionArgs } from "@remix-run/node";
import { requireAuth } from "~/utils/auth.server";
import { convertKeysToCamelCase } from "~/utils/util.server";
import { EXERCISE_CONSTANTS_MAP } from "./constants";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAuth(request);
  
  return json(convertKeysToCamelCase(EXERCISE_CONSTANTS_MAP));
}