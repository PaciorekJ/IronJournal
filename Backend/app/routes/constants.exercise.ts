import { json } from "@remix-run/node";
import { convertKeysToCamelCase } from "~/utils/util.server";
import { EXERCISE_CONSTANTS_MAP } from "./constants";

export const loader = () => {
  return json(convertKeysToCamelCase(EXERCISE_CONSTANTS_MAP));
}