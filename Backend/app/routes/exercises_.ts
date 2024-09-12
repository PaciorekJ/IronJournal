import { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";
import { readExercises } from "~/services/exercise-service";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const result = await readExercises(request);

	if (result.status !== 200) {
		return json({ error: result.error }, { status: result.status });
	}

	return json(result.data, { status: 200 });
};