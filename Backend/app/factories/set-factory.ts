import { SET_TYPES, SetTypeValue } from '~/constants/set-types';
import { ISetPrototypeDropSet, ISetPrototypeStraightSet, ISetPrototypeSuperset, SetPrototypeDropSet, SetPrototypeStraightSet, SetPrototypeSuperset } from '~/models/set-prototype';

type SetInstance = ISetPrototypeStraightSet | ISetPrototypeDropSet | ISetPrototypeSuperset;

class SetFactory {
  public static async create(setType: SetTypeValue, data: Partial<SetInstance>): Promise<SetInstance> {
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
