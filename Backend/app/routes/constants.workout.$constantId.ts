
import { json, LoaderFunction } from '@remix-run/node';
import { WORKOUT_CONSTANTS_MAP, WorkoutConstantId } from './constants';

export const loader: LoaderFunction = async ({ params }) => {
    const { constantId } = params;
  
    if (!constantId) {
        return json({ error: 'Constant not found' }, { status: 404 });
      }
    
      if (!WORKOUT_CONSTANTS_MAP[constantId as WorkoutConstantId]) {
        return json({ error: 'Constant not found' }, { status: 404 });
      }
  
    return json(WORKOUT_CONSTANTS_MAP[constantId as WorkoutConstantId], { status: 200 });
  };