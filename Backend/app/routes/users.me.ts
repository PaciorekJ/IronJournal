import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node';
import { z } from 'zod';
import { createUser, deleteUser, readUserByFirebaseId, updateUser } from '~/services/user-service';
import { isLoginValid, requirePredicate } from '~/utils/auth.server';
import { validateRequestBody } from '~/utils/util.server';
import { createUserSchema, updateUserSchema } from '~/validation/user.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {

  const { firebaseToken } = await requirePredicate(request, { firebaseToken: true });

  if (!firebaseToken) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  const result = await readUserByFirebaseId(firebaseToken.uid);

  return json(result, { status: result.status });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const method = request.method.toUpperCase();
  if (method === 'POST') {
    try {
      const firebaseToken = await isLoginValid(request);
    
      if (!firebaseToken) {
        return json({ error: 'Firebase token not found' }, { status: 404 });
      }

      const requestData = validateRequestBody(request);

      const validatedData = createUserSchema.parse({...requestData, firebaseId: firebaseToken.uid});

      const result = await createUser(validatedData);

      return json(result, { status: result.status });
    } catch (error) {
      if (error instanceof z.ZodError) {
      return json({ error: 'Validation failed', details: error.errors }, { status: 400 });
      }
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return json({ error: errorMessage }, { status: 500 });
    }
  }


  const { user } = await requirePredicate(request, {
    user: true,
  });

  if (!user) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  if (method === 'PATCH') {
    try {

      const requestData = validateRequestBody(request);

      const validatedData = updateUserSchema.parse(requestData);

      const result = await updateUser({ userId: user._id as string, updateData: validatedData });

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
    const result = await deleteUser({ userId: user._id as string });
    return json(result, { status: result.status });
  }

  return json({ error: 'Method not allowed', status: 405 }, { status: 405 });
};
