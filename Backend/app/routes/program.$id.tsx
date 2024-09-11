import { json, LoaderFunctionArgs } from "@remix-run/node";
import mongoose from "mongoose";
import { Program } from "~/models/Program";
import { buildPopulateOptions } from "~/utils/util.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const searchParams = new URLSearchParams(url.search);
	const id = params.id;

	if (!id) {
		return json({ error: "No id provided" }, { status: 400 });
	}

	if (!mongoose.isValidObjectId(id)) {
		return json({ error: "Invalid id" }, { status: 400 });
	}

	let query = Program.findById(id);

	const populateOptions = buildPopulateOptions(searchParams, "populate");

	populateOptions.forEach((option) => {
		query = query.populate(option);
	});

	const program = await query.lean();

	if (!program) {
		return json({ error: "Program not found" }, { status: 404 });
	}

	return json(program, { status: 200 });
};
