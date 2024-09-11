import { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/react";
import { IntensityLevel } from "~/models/Program"; // Import the ScheduleType enum object

export const loader: LoaderFunction = async () => {
	const intensityLevel = Object.values(IntensityLevel);

	return json(intensityLevel);
};
