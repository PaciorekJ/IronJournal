import { json, LoaderFunctionArgs } from "@remix-run/node";
import { deleteProgram, readProgramById, updateProgram } from "~/services/program-service";
import { requireAuth } from "~/utils/auth.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	await requireAuth(request);
	
	const url = new URL(request.url);
	const searchParams = new URLSearchParams(url.search);
	const id = params.id;

	if (!id) {
		return json({ error: "No id provided" }, { status: 400 });
	}

	const result = await readProgramById(id, searchParams);

	if (result.status !== 200) {
		return json({ error: result.error }, { status: result.status });
	}

	return json(result.data, { status: 200 });
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
	await requireAuth(request);

	const id = params.id;
	const method = request.method.toUpperCase();

	if (!id) {
		return json({ error: "No id provided" }, { status: 400 });
	}

	try {
		const body = await request.json();

		switch (method) {
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
}