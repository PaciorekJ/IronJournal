import { json } from "@remix-run/node";
import { convertKeysToCamelCase } from "~/utils/util.server";
import { PROGRAM_CONSTANTS_MAP } from "./constants";

export const loader = () => {
	return json(convertKeysToCamelCase(PROGRAM_CONSTANTS_MAP));
};
