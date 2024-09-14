// app/services/set-service.ts
import mongoose from 'mongoose';
import { SET_TYPES, SetTypeValue } from '~/constants/set-types';
import SetFactory from '~/factories/set-factory';
import {
    ISetPrototype,
    ISetPrototypeDropSet,
    ISetPrototypeStraightSet,
    ISetPrototypeSuperset,
    SetPrototype,
    SetPrototypeDropSet,
    SetPrototypeStraightSet,
    SetPrototypeSuperset,
} from '~/models/set-prototype';
import { ServiceResult } from '~/types/service-result';
import { buildPopulateOptions, buildQueryFromRequest, IBuildQueryConfig } from '~/utils/util.server';

interface ICreateSetBody {
  setType: SetTypeValue;
  data: Partial<ISetPrototypeStraightSet | ISetPrototypeDropSet | ISetPrototypeSuperset>;
}

interface IUpdateSetBody {
  setId: string;
  setType: SetTypeValue;
  updateData: Partial<ISetPrototypeStraightSet | ISetPrototypeDropSet | ISetPrototypeSuperset>;
}

interface IDeleteSetBody {
  setId: string;
}

// Query configuration for building queries
const queryConfig: IBuildQueryConfig = {
  exercise: {
    isArray: false,
    constructor: mongoose.Types.ObjectId,
    regex: (value: string) => new RegExp(value, 'i'),
  },
  type: {
    isArray: false,
    constructor: String,
    regex: (value: string) => new RegExp(value, 'i'),
  },
  restDuration: {
    isArray: false,
    constructor: String,
    regex: (value: string) => new RegExp(value, 'i'),
  },
};

export const createSet = async (body: ICreateSetBody): Promise<ServiceResult<{ setId: string }>> => {
  try {
    const { setType, data } = body;

    if (!Object.values(SET_TYPES).includes(setType)) {
      return { status: 400, error: 'Invalid set type' };
    }

    if (!data.exercise || !mongoose.isValidObjectId(data.exercise)) {
      return { status: 400, error: 'Exercise ID is required and must be valid' };
    }

    const newSet = await SetFactory.create(setType, data);
    return { status: 200, message: 'Set created successfully', setId: newSet._id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

export const updateSet = async (body: IUpdateSetBody): Promise<ServiceResult<{ setId: string }>> => {
  const { setId, setType, updateData } = body;

  if (!setId || !mongoose.isValidObjectId(setId)) {
    return { status: 400, error: 'Set ID is required and must be a valid ID' };
  }

  try {
    let updatedSet;
    switch (setType) {
      case SET_TYPES.STRAIGHT_SET:
        updatedSet = await SetPrototypeStraightSet.findByIdAndUpdate(setId, updateData, { new: true });
        break;
      case SET_TYPES.DROP_SET:
        updatedSet = await SetPrototypeDropSet.findByIdAndUpdate(setId, updateData, { new: true });
        break;
      case SET_TYPES.SUPER_SET:
        updatedSet = await SetPrototypeSuperset.findByIdAndUpdate(setId, updateData, { new: true });
        break;
      default:
        return { status: 400, error: 'Invalid set type' };
    }

    if (!updatedSet) {
      return { status: 404, error: 'Set not found' };
    }

    return { status: 200, message: 'Set updated successfully', setId: updatedSet._id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

export const deleteSet = async (body: IDeleteSetBody): Promise<ServiceResult<{ setId: string }>> => {
  const { setId } = body;

  if (!setId || !mongoose.isValidObjectId(setId)) {
    return { status: 400, error: 'Set ID is required and must be a valid ID' };
  }

  try {
    const deletedSet = await SetPrototype.findByIdAndDelete(setId);
    if (!deletedSet) {
      return { status: 404, error: 'Set not found' };
    }

    return { status: 200, message: 'Set deleted successfully', setId: deletedSet._id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

export const readSets = async (request: Request): Promise<ServiceResult<ISetPrototype[]>> => {
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);

    const { query, limit, offset, sortBy, sortOrder } = buildQueryFromRequest(request, queryConfig);

    const sortOption: Record<string, 1 | -1> | null = sortBy ? { [sortBy]: sortOrder as 1 | -1 } : null;

    let queryObj = SetPrototype.find(query).sort(sortOption).skip(offset).limit(limit);

    const populateOptions = buildPopulateOptions(searchParams, 'populate');
    populateOptions.forEach((option: string | string[]) => {
      queryObj = queryObj.populate(option);
    });

    const sets = await queryObj.lean();

    return { status: 200, data: sets };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

export const readSetById = async (id: string, searchParams: URLSearchParams): Promise<ServiceResult<ISetPrototype>> => {
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

    return { status: 200, data: set };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};
