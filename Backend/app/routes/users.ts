import { ActionFunctionArgs, json } from '@remix-run/node';
import { readUsers } from '~/services/user-service';
import { isLoginValid } from '~/utils/auth.server';

export const loader = async ({ request }: ActionFunctionArgs) => {
    await isLoginValid(request);
    const result = await readUsers(request);

    if (result.status !== 200) {
        return json({ error: result.error }, { status: result.status });
    }

    return json(result, { status: 200 });
};