import { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";
import { readExercises } from "~/services/exercise-service";
import { isLoginValid } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await isLoginValid(request);

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);

    const result = await readExercises(searchParams);

    return json(result, { status: 200 });
};
