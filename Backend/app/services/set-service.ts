// app/services/set-service.ts

import mongoose from 'mongoose';
import { SET_TYPES } from '~/constants/set-types';
import SetFactory from '~/factories/set-factory';
import { ServiceResult } from '~/interfaces/service-result';
import {
  ISetPrototype,
  SetPrototype,
} from '~/models/set-prototype';
import { IUser } from '~/models/user';
import {
  buildPopulateOptions,
  buildQueryFromSearchParams,
  IBuildQueryConfig,
} from '~/utils/util.server';
import { CreateSetPrototypeInput, createSetPrototypeSchema, UpdateSetPrototypeInput } from '~/validation/set-prototype.server';

export const createSet = async (
  user: IUser,
  data: CreateSetPrototypeInput
): Promise<ServiceResult<{ setId: string }>> => {
  try {
    const { type, ...restData } = data;

    // Ensure valid set type
    if (!Object.values(SET_TYPES).includes(type)) {
      return { status: 400, error: 'Invalid set type' };
    }

    // Assign userId to the data
    const newData = { ...restData, userId: user._id };

    const validatedData = createSetPrototypeSchema.parse(newData);

    // Create the set using the factory
    const newSet = await SetFactory.create(type, validatedData);

    return { status: 201, message: 'Set created successfully', setId: newSet._id};
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

export const updateSet = async (
  user: IUser,
  setId: string,
  updateData: UpdateSetPrototypeInput
): Promise<ServiceResult<{ setId: string }>> => {
  if (!mongoose.isValidObjectId(setId)) {
    return { status: 400, error: 'Set ID is invalid' };
  }

  try {
    // Find the set and ensure it belongs to the user
    const set = await SetPrototype.findOne({ _id: setId, userId: user._id });

    if (!set) {
      return { status: 404, error: 'Set not found' };
    }

    // Update the set
    Object.assign(set, updateData);
    await set.save();

    return { status: 200, message: 'Set updated successfully', setId: set._id };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

export const deleteSet = async (
  user: IUser,
  setId: string
): Promise<ServiceResult<{ setId: string }>> => {
  if (!mongoose.isValidObjectId(setId)) {
    return { status: 400, error: 'Set ID is invalid' };
  }

  try {
    // Find the set and ensure it belongs to the user
    const set = await SetPrototype.findOne({ _id: setId, userId: user._id });

    if (!set) {
      return { status: 404, error: 'Set not found' };
    }

    // Delete the set
    await set.deleteOne();

    return { status: 200, message: 'Set deleted successfully', setId: set._id};
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

export const readSets = async (
  user: IUser,
  searchParams: URLSearchParams
): Promise<ServiceResult<ISetPrototype[]>> => {
  try {
    const queryConfig: IBuildQueryConfig = {
      exercise: {
        isArray: false,
        constructor: mongoose.Types.ObjectId,
      },
      type: {
        isArray: false,
        constructor: String,
      },
      restDurationInSeconds: {
        isArray: false,
        constructor: Number,
      },
    };

    const { query, limit, offset, sortBy, sortOrder } = buildQueryFromSearchParams(
      searchParams,
      queryConfig
    ) as any;

    // Ensure the user can only see their own sets
    query.userId = user._id;

    const sortOption: Record<string, 1 | -1> | null = sortBy
      ? { [sortBy]: sortOrder as 1 | -1 }
      : null;

    let queryObj = SetPrototype.find(query).sort(sortOption).skip(offset).limit(limit);

    const populateOptions = buildPopulateOptions(searchParams, 'populate');
    populateOptions.forEach((option: string | string[]) => {
      queryObj = queryObj.populate(option);
    });

    const sets = await queryObj.lean();

    return { status: 200, data: sets };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

export const readSetById = async (
  user: IUser,
  id: string,
  searchParams: URLSearchParams
): Promise<ServiceResult<ISetPrototype>> => {
  if (!id || !mongoose.isValidObjectId(id)) {
    return { status: 400, error: 'Invalid or missing set ID' };
  }

  try {
    let query = SetPrototype.findById(id);

    const populateOptions = buildPopulateOptions(searchParams, 'populate');
    populateOptions.forEach((option) => {
      query = query.populate(option);
    });

    const set = await query.lean();

    if (!set) {
      return { status: 404, error: 'Set not found' };
    }

    // Check if the user has access to the set
    if (set.userId.toString() !== user._id) {
      return { status: 403, error: 'Forbidden: You do not have access to this set' };
    }

    return { status: 200, data: set };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};
