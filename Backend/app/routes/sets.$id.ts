// app/routes/sets/$id.ts

import { json, LoaderFunctionArgs } from '@remix-run/node';
import mongoose from 'mongoose';
import { z } from 'zod';
import { deleteSet, readSetById, updateSet } from '~/services/set-service';
import { requirePredicate } from '~/utils/auth.server';
import { updateSetPrototypeSchema } from '~/validation/set-prototype.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { user } = await requirePredicate(request, { user: true });

  if (!user) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  const id = params.id;

  if (!id || !mongoose.isValidObjectId(id)) {
    return json({ error: 'Invalid or missing set ID' }, { status: 400 });
  }

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const result = await readSetById(user, id, searchParams);

  if (result.status !== 200) {
    return json({ error: result.error }, { status: result.status });
  }

  return json(result.data, { status: 200 });
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const { user } = await requirePredicate(request, { user: true });

    if (!user) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  const id = params.id;
  const method = request.method.toUpperCase();

  if (!id || !mongoose.isValidObjectId(id)) {
    return json({ error: 'Invalid or missing set ID' }, { status: 400 });
  }

  if (method === 'PATCH') {
    try {
      const requestData = await request.json();

      // Validate the request data
      const validatedData = updateSetPrototypeSchema.parse(requestData);

      const result = await updateSet(user, id, validatedData);

      return json(result, { status: result.status });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return json({ error: 'Validation failed', details: error.errors }, { status: 400 });
      }
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      return json({ error: errorMessage }, { status: 500 });
    }
  }

  if (method === 'DELETE') {
    try {
      const result = await deleteSet(user, id);

      return json(result, { status: result.status });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      return json({ error: errorMessage }, { status: 500 });
    }
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
};
