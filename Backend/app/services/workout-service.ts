import mongoose from 'mongoose';
import { ROLE } from '~/constants/role';
import { SetPrototype } from '~/models/set-prototype';
import { IWorkoutPrototype, WorkoutPrototype } from '~/models/workout-prototype';
import { ServiceResult } from '~/types/service-result';
import { requireRole } from '~/utils/auth.server';
import { buildPopulateOptions, buildQueryFromRequest, IBuildQueryConfig } from '~/utils/util.server';

interface IUpdateWorkoutBody {
  workoutId: string;
  updateData: Partial<IWorkoutPrototype>;
}

interface IDeleteWorkoutBody {
  workoutId: string;
}

// Query configuration for building queries
const queryConfig: IBuildQueryConfig = {
  name: {
    isArray: false,
    constructor: String,
    regex: (value: string) => new RegExp(value, 'i'),
  },
  userId: {
    isArray: false,
    constructor: mongoose.Types.ObjectId,
    regex: (value: string) => new RegExp(value, 'i'),
  },
  intensityLevel: {
    isArray: false,
    constructor: String,
    regex: (value: string) => new RegExp(value, 'i'),
  },
};

export const createWorkout = async (request : Request & {body: Partial<IWorkoutPrototype>}): Promise<ServiceResult<{ workoutId: string }>> => {
  try {
    const { name, sets, ...body } = request.body;

    const { _id: userId } = await requireRole(request, ROLE.USER);

    if (!name || !sets || sets.length === 0) {
      return { status: 400, error: 'Name and at least one set are required' };
    }

    // Check if all sets exist
    const setIds: string[] = sets.map((setId) => setId.toString());
    const validSets = await SetPrototype.find({ _id: { $in: setIds } }).select('_id').lean();
    const validSetIds = validSets.map((set) => set._id.toString());

    const invalidSets = setIds.filter((id) => !validSetIds.includes(id));
    if (invalidSets.length > 0) {
      return { status: 400, error: 'Invalid set IDs provided', invalidSets };
    }

    const newWorkout = await WorkoutPrototype.create({
      name,
      warmup: body.warmup,
      coolDown: body.coolDown,
      sets,
      userId,
      description: body.description,
      durationInMinutes: body.durationInMinutes,
      intensityLevel: body.intensityLevel,
      notes: body.notes,
    });

    return { status: 200, message: 'Workout created successfully', workoutId: newWorkout._id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

export const updateWorkout = async (body: IUpdateWorkoutBody): Promise<ServiceResult<{ workoutId: string }>> => {
  const { workoutId, updateData } = body;

  if (!workoutId || !mongoose.isValidObjectId(workoutId)) {
    return { status: 400, error: 'Workout ID is required and must be a valid ID' };
  }

  try {
    const updatedWorkout = await WorkoutPrototype.findByIdAndUpdate(workoutId, updateData, { new: true });
    if (!updatedWorkout) {
      return { status: 404, error: 'Workout not found' };
    }

    return { status: 200, message: 'Workout updated successfully', workoutId: updatedWorkout._id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

export const deleteWorkout = async (body: IDeleteWorkoutBody): Promise<ServiceResult<{ workoutId: string }>> => {
  const { workoutId } = body;

  if (!workoutId || !mongoose.isValidObjectId(workoutId)) {
    return { status: 400, error: 'Workout ID is required and must be a valid ID' };
  }

  try {
    const deletedWorkout = await WorkoutPrototype.findByIdAndDelete(workoutId);
    if (!deletedWorkout) {
      return { status: 404, error: 'Workout not found' };
    }

    return { status: 200, message: 'Workout deleted successfully', workoutId: deletedWorkout._id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

export const readWorkouts = async (request: Request): Promise<ServiceResult<IWorkoutPrototype[]>> => {
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);

    const { query, limit, offset, sortBy, sortOrder } = buildQueryFromRequest(request, queryConfig);

    const sortOption: Record<string, 1 | -1> | null = sortBy ? { [sortBy]: sortOrder as 1 | -1 } : null;

    let queryObj = WorkoutPrototype.find(query).sort(sortOption).skip(offset).limit(limit);

    const populateOptions = buildPopulateOptions(searchParams, 'populate');
    populateOptions.forEach((option: string | string[]) => {
      queryObj = queryObj.populate(option);
    });

    const workouts = await queryObj.lean();

    return { status: 200, data: workouts };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

export const readWorkoutById = async (id: string, searchParams: URLSearchParams): Promise<ServiceResult<IWorkoutPrototype>> => {
  if (!id || !mongoose.isValidObjectId(id)) {
    return { status: 400, error: 'Invalid or missing workout ID' };
  }

  try {
    let query = WorkoutPrototype.findById(id);
    const populateOptions = buildPopulateOptions(searchParams, 'populate');
    populateOptions.forEach((option) => {
      query = query.populate(option);
    });

    const workout = await query.lean();

    if (!workout) {
      return { status: 404, error: 'Workout not found' };
    }

    return { status: 200, data: workout };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};
