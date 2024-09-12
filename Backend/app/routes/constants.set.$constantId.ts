
import { json, LoaderFunction } from '@remix-run/node';
import { SET_CONSTANTS_MAP, SetConstantId } from './constants';

export const loader: LoaderFunction = async ({ params }) => {
    const { constantId } = params;
  
    if (!constantId) {
        return json({ error: 'Constant not found' }, { status: 404 });
      }
    
      if (!SET_CONSTANTS_MAP[constantId as SetConstantId]) {
        return json({ error: 'Constant not found' }, { status: 404 });
      }
  
    return json(SET_CONSTANTS_MAP[constantId as SetConstantId], { status: 200 });
  };