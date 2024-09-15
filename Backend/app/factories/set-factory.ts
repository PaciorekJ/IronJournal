// app/factories/SetFactory.ts

import { SET_TYPES, SetTypeValue } from '~/constants/set-types';
import {
  SetPrototypeDropSet,
  SetPrototypeStraightSet,
  SetPrototypeSuperset,
} from '~/models/set-prototype';
import { CreateSetPrototypeInput } from '~/validation/set-prototype.server';

class SetFactory {
  public static async create(setType: SetTypeValue, data: CreateSetPrototypeInput) {
    switch (setType) {
      case SET_TYPES.STRAIGHT_SET:
        return await SetPrototypeStraightSet.create(data);

      case SET_TYPES.DROP_SET:
        return await SetPrototypeDropSet.create(data);

      case SET_TYPES.SUPER_SET:
        return await SetPrototypeSuperset.create(data);

      default:
        throw new Error(`Invalid set type: ${setType}`);
    }
  }
}

export default SetFactory;
