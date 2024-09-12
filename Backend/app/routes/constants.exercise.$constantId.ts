
import { json, LoaderFunction } from '@remix-run/node';
import { EXERCISE_CONSTANTS_MAP, ExerciseConstantId } from './constants';

export const loader: LoaderFunction = async ({ params }) => {
  const { constantId } = params;

  if (!constantId) {
    return json({ error: 'Constant not found' }, { status: 404 });
  }

  if (!EXERCISE_CONSTANTS_MAP[constantId as ExerciseConstantId]) {
    return json({ error: 'Constant not found' }, { status: 404 });
  }

  return json(EXERCISE_CONSTANTS_MAP[constantId as ExerciseConstantId]);
};
