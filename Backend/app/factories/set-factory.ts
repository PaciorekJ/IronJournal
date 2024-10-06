// app/factories/SetFactory.ts

import { SET_TYPE, SetTypeValue } from "~/constants/set-type";
import {
    SetPrototypeDropSet,
    SetPrototypeStraightSet,
    SetPrototypeSuperset,
} from "~/models/set-prototype";
import { ISetPrototypeCreateDTO } from "~/validation/set-prototype.server";

class SetFactory {
    public static async create(
        setType: SetTypeValue,
        data: ISetPrototypeCreateDTO,
    ) {
        switch (setType) {
            case SET_TYPE.SET_PROTOTYPE_STRAIGHT_SET:
                return await SetPrototypeStraightSet.create(data);

            case SET_TYPE.SET_PROTOTYPE_DROP_SET:
                return await SetPrototypeDropSet.create(data);

            case SET_TYPE.SET_PROTOTYPE_SUPER_SET:
                return await SetPrototypeSuperset.create(data);

            default:
                throw new Error(`Invalid set type: ${setType}`);
        }
    }
}

export default SetFactory;
