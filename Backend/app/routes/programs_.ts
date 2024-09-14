import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/react";
import {
	createProgram,
	readPrograms
} from "~/services/program-service";
import { requireAuth } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request }) => {
	await requireAuth(request);

	const method = request.method.toUpperCase();
	const body = await request.json();

	switch (method) {
		case "POST": {
			const createResult = await createProgram(body);
			return json(createResult, { status: createResult.status });
		}

		default: {
			return json({ error: "Method not allowed" }, { status: 405 });
		}
	}
};

export const loader: LoaderFunction = async ({ request }) => {
	await requireAuth(request);
	
	const result = await readPrograms(request);
	return json(result, { status: result.status });
};