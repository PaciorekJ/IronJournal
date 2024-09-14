import { json, LoaderFunctionArgs } from "@remix-run/node";
import { readExerciseById } from "~/services/exercise-service";
import { requireAuth } from "~/utils/auth.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	await requireAuth(request);
	
	const id = params.id;

	if (!id) {
		return json({ error: "No id provided" }, { status: 400 });
	}

	const result = await readExerciseById(id);

	if (result.status !== 200) {
		return json({ error: result.error }, { status: result.status });
	}

	return json(result.data, { status: 200 });
};
