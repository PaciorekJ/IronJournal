
import { json, LoaderFunction } from '@remix-run/node';
import { isLoginValid } from '~/utils/auth.server';
import { SET_CONSTANTS_MAP, SetConstantId } from './constants';

export const loader: LoaderFunction = async ({ request, params }) => {
  await isLoginValid(request);

  const { constantId } = params;

  if (!constantId) {
      return json({ error: 'Constant not found' }, { status: 404 });
    }

    if (!SET_CONSTANTS_MAP[constantId as SetConstantId]) {
      return json({ error: 'Constant not found' }, { status: 404 });
    }

  return json({ data: SET_CONSTANTS_MAP[constantId as SetConstantId]}, { status: 200 });
  };