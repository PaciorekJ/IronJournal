import { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";
import { readExercises } from "~/services/exercise-service";
import { requireAuth } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await requireAuth(request);
	
	const result = await readExercises(request);

	if (result.status !== 200) {
		return json({ error: result.error }, { status: result.status });
	}

	return json(result.data, { status: 200 });
};