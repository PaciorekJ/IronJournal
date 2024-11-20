import { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";
import { readExercises } from "~/services/exercise-service";
import { requirePredicate } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { user } = await requirePredicate(request, { user: true });

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);

    const result = await readExercises(user, searchParams);

    return json(result, { status: 200 });
};
