import { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/react";
import { FocusAreas } from "~/models/Program"; // Import the ScheduleType enum object

export const loader: LoaderFunction = async () => {
	const focusAreas = Object.values(FocusAreas);

	return json(focusAreas);
};
