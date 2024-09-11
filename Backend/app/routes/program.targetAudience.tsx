import { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/react";
import { TargetAudience } from "~/models/Program"; // Import the ScheduleType enum object

export const loader: LoaderFunction = async () => {
	const targetAudience = Object.values(TargetAudience);

	return json(targetAudience);
};
