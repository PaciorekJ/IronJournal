
import { json } from "@remix-run/node";
import { convertKeysToCamelCase } from "~/utils/util.server";
import { WORKOUT_CONSTANTS_MAP } from "./constants";

export const loader = () => {
	return json(convertKeysToCamelCase(WORKOUT_CONSTANTS_MAP));
};
