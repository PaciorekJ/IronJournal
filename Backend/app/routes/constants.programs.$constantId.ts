import { json, LoaderFunction } from "@remix-run/node";
import { isLoginValid } from "~/utils/auth.server";
import { PROGRAM_CONSTANTS_MAP, ProgramConstantId } from "./constants";

export const loader: LoaderFunction = async ({ request, params }) => {
    await isLoginValid(request);
    const { constantId } = params;

    if (!constantId) {
        return json({ error: "Constant not found" }, { status: 404 });
    }

    if (!PROGRAM_CONSTANTS_MAP[constantId as ProgramConstantId]) {
        return json({ error: "Constant not found" }, { status: 404 });
    }

    return json(
        { data: PROGRAM_CONSTANTS_MAP[constantId as ProgramConstantId] },
        { status: 200 },
    );
};
