import { json } from "@remix-run/node";
import { convertKeysToCamelCase } from "~/utils/util.server";
import { SET_CONSTANTS_MAP } from "./constants";

export const loader = () => {
	return json(convertKeysToCamelCase(SET_CONSTANTS_MAP));
};
