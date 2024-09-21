import { json } from "@remix-run/node";
import SetFactory from "~/factories/set-factory";
import { ServiceResult } from "~/interfaces/service-result";
import { ISetPrototype, SetPrototype } from "~/models/set-prototype";
import { IUser } from "~/models/user";
import {
    CreateSetPrototypeInput,
    UpdateSetPrototypeInput,
} from "~/validation/set-prototype.server";

export const createSetPrototype = async (
    user: IUser,
    data: CreateSetPrototypeInput,
): Promise<ServiceResult<ISetPrototype>> => {
    try {
        const newData = { ...data, userId: user._id };

        const newSet = await SetFactory.create(data.type, newData);

        return {
            message: "Set created successfully",
            data: newSet,
        };
    } catch (error) {
        throw json({ error: "An unexpected error occurred" }, { status: 500 });
    }
};

export const updateSetPrototype = async (
    user: IUser,
    setId: string,
    updateData: UpdateSetPrototypeInput,
): Promise<ServiceResult<ISetPrototype>> => {
    try {
        const set = await SetPrototype.findOne({
            _id: setId,
            userId: user._id,
        });

        if (!set) {
            throw json({ error: "Set not found" }, { status: 404 });
        }

        Object.assign(set, updateData);
        await set.save();

        return {
            message: "Set updated successfully",
            data: set,
        };
    } catch (error) {
        throw json({ error: "An unexpected error occurred" }, { status: 500 });
    }
};

export const deleteSetPrototype = async (
    user: IUser,
    setId: string,
): Promise<ServiceResult<undefined>> => {
    try {
        const set = await SetPrototype.findOne({
            _id: setId,
            userId: user._id,
        });

        if (!set) {
            throw json({ error: "Set not found" }, { status: 404 });
        }

        await set.deleteOne();

        return {
            message: "Set deleted successfully",
        };
    } catch (error) {
        throw json({ error: "An unexpected error occurred" }, { status: 500 });
    }
};
