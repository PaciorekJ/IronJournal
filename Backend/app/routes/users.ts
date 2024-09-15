// app/routes/users.ts

import { ActionFunctionArgs, json } from '@remix-run/node';
import { z } from 'zod';
import { ROLE } from '~/constants/role';
import { createUser, readUsers } from '~/services/user-service';
import { isLoginValid, requirePredicate } from '~/utils/auth.server';
import { createUserSchema } from '~/validation/user.server';

export const loader = async ({ request }: ActionFunctionArgs) => {
    await isLoginValid(request);
    const result = await readUsers(request);

    if (result.status !== 200) {
        return json({ error: result.error }, { status: result.status });
    }

    return json(result.data, { status: 200 });
};

export const action = async ({ request }: ActionFunctionArgs) => {
const { user } = await requirePredicate(request, {
user: true,
predicate: (user) => user.role === ROLE.ADMIN,
});

    if (!user) {
        return json({ error: 'User not found' }, { status: 404 });
    }

    const method = request.method.toUpperCase();

    if (method === 'POST') {
        try {
            const requestData = await request.json();

            const validatedData = createUserSchema.parse(requestData);

            const result = await createUser(user, validatedData);

            return json(result, { status: result.status });
        } catch (error) {
            if (error instanceof z.ZodError) {
            return json({ error: 'Validation failed', details: error.errors }, { status: 400 });
            }
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            return json({ error: errorMessage }, { status: 500 });
        }
    }
    return json({ error: 'Method not allowed' }, { status: 405 });
};
