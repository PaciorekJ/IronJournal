import { ActionFunction, json, LoaderFunction } from '@remix-run/node';
import { z } from 'zod';
import { createProgram, readPrograms } from '~/services/program-service';
import { requirePredicate } from '~/utils/auth.server';
import { validateRequestBody } from '~/utils/util.server';
import { createProgramSchema } from '~/validation/program.server';

export const loader: LoaderFunction = async ({ request }) => {
  const { user } = await requirePredicate(request, {
    user: true,
  })

  if (!user) {
    return json({ error: 'User doesn\'t have an account yet' }, { status: 404 });
  }

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const result = await readPrograms(user, searchParams);

  if (result.status !== 200) {
    return json({ error: result.error }, { status: result.status });
  }

  return json(result.data, { status: 200 });
};

export const action: ActionFunction = async ({ request }) => {
  const { user } = await requirePredicate(request, {
    user: true,
  })

  if (!user) {
    return json({ error: 'User doesn\'t have an account yet' }, { status: 404 });
  }

  const method = request.method.toUpperCase();

  if (method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    
    const requestData = validateRequestBody(request);

    const validatedData = createProgramSchema.parse(requestData);

    const result = await createProgram(user, validatedData);

    return json(result, { status: result.status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return json({ error: errorMessage }, { status: 500 });
  }
};

