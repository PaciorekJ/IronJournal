import { json, LoaderFunctionArgs } from '@remix-run/node';
import mongoose from 'mongoose';
import { z } from 'zod';
import { IUser } from '~/models/user';
import { deleteProgram, readProgramById, updateProgram } from '~/services/program-service';
import { requirePredicate } from '~/utils/auth.server';
import { validationRequestBody } from '~/utils/util.server';
import { updateProgramSchema } from '~/validation/program.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const { user } = await requirePredicate(request, {
		user: true,
	})
	
	const id = params.id;

	if (!id || !mongoose.isValidObjectId(id)) {
	return json({ error: 'No id provided' }, { status: 400 });
	}

	const url = new URL(request.url);
	const searchParams = new URLSearchParams(url.search);

	const result = await readProgramById(user as IUser, id, searchParams);

	if (result.status !== 200) {
	return json({ error: result.error }, { status: result.status });
	}

	return json(result, { status: 200 });
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
	const { user } = await requirePredicate(request, {
		user: true,
	})

	if (!user) {
	return json({ error: 'User not found' }, { status: 404 });
	}
	
	const id = params.id;
	const method = request.method.toUpperCase();

	if (!id || !mongoose.isValidObjectId(id)) {
	return json({ error: 'No id provided' }, { status: 400 });
	}

	if (method === 'PATCH') {
		try {

			const requestData = validationRequestBody(request);

			const validatedData = updateProgramSchema.parse(requestData);

			const result = await updateProgram(user, id, validatedData);

			return json(result, { status: result.status });
			
		} catch (error) {
		  if (error instanceof z.ZodError) {
			return json({ error: 'Validation failed', details: error.errors }, { status: 400 });
		  }
		  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
		  return json({ error: errorMessage }, { status: 500 });
		}
	}

	if (method === 'DELETE') {
		try {
			const result = await deleteProgram(user, id);

			return json(result, { status: result.status });
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
			return json({ error: errorMessage }, { status: 500 });
		}
	}

	return json({ error: 'Method not allowed' }, { status: 405 });
};
