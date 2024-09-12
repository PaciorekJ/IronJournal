import { json, LoaderFunctionArgs } from "@remix-run/node";
import { readExerciseById } from "~/services/exercise-service";

export const loader = async ({ params }: LoaderFunctionArgs) => {
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
