import { json, LoaderFunctionArgs } from "@remix-run/node";
import { readProgramById } from "~/services/program-service";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
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
