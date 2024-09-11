import { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/react";
import { ScheduleType } from "~/models/Program"; // Import the ScheduleType enum object

export const loader: LoaderFunction = async () => {
	const scheduleTypes = Object.values(ScheduleType);

	return json(scheduleTypes);
};
