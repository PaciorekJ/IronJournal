import { SET_TYPES, SetTypeValue } from '~/constants/set-types';
import { ISetPrototype, ISetPrototypeDrop, ISetPrototypeSuperset, SetPrototype, SetPrototypeDropSchema, SetPrototypeSupersetSchema } from '~/models/set-prototype';

type SetInstance = ISetPrototype | ISetPrototypeDrop | ISetPrototypeSuperset;

class SetFactory {
  public static async create(setType: SetTypeValue, data: Partial<SetInstance>): Promise<SetInstance> {
    switch (setType) {
      case SET_TYPES.BASE:
        return await SetPrototype.create(data) as ISetPrototype;

      case SET_TYPES.DROP:
        return await SetPrototypeDropSchema.create(data) as ISetPrototypeDrop;

      case SET_TYPES.SUPERSET:
        return await SetPrototypeSupersetSchema.create(data) as ISetPrototypeSuperset;

      default:
        throw new Error(`Invalid set type: ${setType}`);
    }
  }
}

export default SetFactory;
