
import { json, LoaderFunction } from '@remix-run/node';
import { PROGRAM_CONSTANTS_MAP, ProgramConstantId } from './constants';
import { requireAuth } from '~/utils/auth.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAuth(request);
  const { constantId } = params;

  if (!constantId) {
      return json({ error: 'Constant not found' }, { status: 404 });
    }

    if (!PROGRAM_CONSTANTS_MAP[constantId as ProgramConstantId]) {
      return json({ error: 'Constant not found' }, { status: 404 });
    }

  return json(PROGRAM_CONSTANTS_MAP[constantId as ProgramConstantId], { status: 200 });
  };