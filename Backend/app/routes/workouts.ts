import { ActionFunction, json, LoaderFunctionArgs } from '@remix-run/node';
import { z } from 'zod';
import { createWorkout, readWorkouts } from '~/services/workout-service';
import { requirePredicate } from '~/utils/auth.server';
import { validationRequestBody } from '~/utils/util.server';
import { createWorkoutPrototypeSchema } from '~/validation/workout-prototype';

export const action: ActionFunction = async ({ request }) => {
  const { user } = await requirePredicate(request, { user: true });
  const method = request.method.toUpperCase();

  if (method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  if (!user) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  try {
    
    const requestData = validationRequestBody(request);

    // Validate the request data
    const validatedData = createWorkoutPrototypeSchema.parse(requestData);

    // Call the service function, passing the user and validated data
    const result = await createWorkout(user, validatedData);

    return json(result, { status: result.status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return json({ error: errorMessage }, { status: 500 });
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await requirePredicate(request, { user: true });

  if (!user) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const result = await readWorkouts(user, searchParams);

  if (result.status !== 200) {
    return json({ error: result.error }, { status: result.status });
  }

  return json(result.data, { status: 200 });
};
