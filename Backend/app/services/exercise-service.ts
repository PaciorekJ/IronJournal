import mongoose, { RootFilterQuery } from 'mongoose';
import { Exercise, IExercise } from '~/models/exercise';
import { ServiceResult } from '~/types/service-result';
import { buildQueryFromRequest, IBuildQueryConfig } from '~/utils/util.server';

const queryConfig: IBuildQueryConfig = {
  id: {},
  name: {
    regex: (value: string) => new RegExp(value, 'i'),
  },
  level: { isArray: false, constructor: String },
  category: { isArray: false, constructor: String },
  force: {
    isArray: false,
    constructor: String,
    regex: (value: string) => new RegExp(value, 'i'),
  },
  equipment: { isArray: true, constructor: String },
  primaryMuscles: { isArray: true, constructor: String },
  secondaryMuscles: { isArray: true, constructor: String },
  limit: { isArray: false, constructor: Number },
  offset: { isArray: false, constructor: Number },
  sortBy: { isArray: false, constructor: String },
  sortOrder: { isArray: false, constructor: String },
};

export const readExercises = async (request: Request): Promise<ServiceResult<IExercise[]>> => {
  try {
    const { query, limit, offset, sortBy, sortOrder } = buildQueryFromRequest<IExercise>(request, queryConfig);

    const sortOption: Record<string, 1 | -1> | undefined = sortBy
      ? { [sortBy]: sortOrder as 1 | -1 }
      : undefined;

    const exercises = await Exercise.find(query as RootFilterQuery<IExercise>)
      .sort(sortOption)
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();

    return { status: 200, data: exercises };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

export const readExerciseById = async (id: string): Promise<ServiceResult<IExercise>> => {
  if (!id || !mongoose.isValidObjectId(id)) {
    return { status: 400, error: 'Invalid or missing exercise ID' };
  }

  try {
    const exercise = await Exercise.findById(id).lean().exec();

    if (!exercise) {
      return { status: 404, error: 'Exercise not found' };
    }

    return { status: 200, data: exercise };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};
