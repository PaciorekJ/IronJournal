import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, json, useFetcher } from "@remix-run/react";
import {
	createProgram,
	deleteProgram,
	readPrograms,
	updateProgram,
} from "~/services/program-service";

export const action: ActionFunction = async ({ request }) => {
	const method = request.method.toUpperCase();

	try {
		const body = await request.json();

		switch (method) {
			case "POST": {
				const createResult = await createProgram(body);
				return json(createResult, { status: createResult.status });
			}

			case "PATCH": {
				const updateResult = await updateProgram(body);
				return json(updateResult, { status: updateResult.status });
			}

			case "DELETE": {
				const deleteResult = await deleteProgram(body);
				return json(deleteResult, { status: deleteResult.status });
			}

			default: {
				return json({ error: "Method not allowed" }, { status: 405 });
			}
		}
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "An unexpected error occurred";
		return json({ error: errorMessage }, { status: 500 });
	}
};

export const loader: LoaderFunction = async ({ request }) => {
	try {
		const programs = await readPrograms(request);
		return json(programs);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "An unexpected error occurred";
		return json({ error: errorMessage }, { status: 500 });
	}
};