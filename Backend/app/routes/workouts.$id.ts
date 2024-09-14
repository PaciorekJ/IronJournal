import { json, LoaderFunctionArgs } from "@remix-run/node";
import mongoose from 'mongoose';
import { deleteWorkout, readWorkoutById, updateWorkout } from "~/services/workout-service";
import { requireAuth } from "~/utils/auth.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    await requireAuth(request);
    
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const id = params.id;

    if (!id || !mongoose.isValidObjectId(id)) {
        return json({ error: "Invalid or missing workout ID" }, { status: 400 });
    }

    const result = await readWorkoutById(id, searchParams);

    return json(result.data, { status: result.status });
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
    await requireAuth(request);

    const id = params.id;
    const method = request.method.toUpperCase();

    if (!id || !mongoose.isValidObjectId(id)) {
        return json({ error: "Invalid or missing workout ID" }, { status: 400 });
    }

    const body = await request.json();

    switch (method) {
        case "PATCH": {
        const updateResult = await updateWorkout({ workoutId: id, updateData: body });
        return json(updateResult, { status: updateResult.status });
        }

        case "DELETE": {
        const deleteResult = await deleteWorkout({ workoutId: id });
        return json(deleteResult, { status: deleteResult.status });
        }

        default:
        return json({ error: "Method not allowed" }, { status: 405 });
  }
};
