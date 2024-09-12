import mongoose from 'mongoose';
import { FocusAreasValue } from '~/constants/focus-area';
import { ScheduleTypeValue } from '~/constants/schedule-types';
import { TargetAudienceValue } from '~/constants/target-audiences';
import { IProgram, Program } from '~/models/program';
import { User } from '~/models/user';
import { WorkoutPrototype } from '~/models/workout-prototype';
import { ServiceResult } from '~/types/service-result';
import { buildPopulateOptions, buildQueryFromRequest, IBuildQueryConfig } from '~/utils/util.server';

interface ICreateProgramBody extends Omit<IProgram, 'userId'> {
  userId: string; // Override userId to ensure it's a string
}

interface IUpdateProgramBody {
  programId: string;
  updateData: Partial<IProgram>;
}

interface IDeleteProgramBody {
  programId: string;
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
  scheduleType: {
    isArray: false,
    constructor: String,
    regex: (value: string) => new RegExp(value, 'i'),
  },
  focusAreas: {
    isArray: true,
    constructor: String,
    regex: (value: string) => new RegExp(value, 'i'),
  },
  targetAudience: {
    isArray: false,
    constructor: String,
    regex: (value: string) => new RegExp(value, 'i'),
  },
  isPublic: {
    isArray: false,
    constructor: (value: string) => value === 'true',
  },
};

export const createProgram = async (body: ICreateProgramBody): Promise<ServiceResult<{ programId: string }>> => {
  const { userId, name, scheduleType } = body;

  if (!userId || !mongoose.isValidObjectId(userId)) {
    return { status: 400, error: 'User ID is required and must be a valid ID' };
  }

  const user = await User.findById(userId).select('_id').lean();
  if (!user) {
    return { status: 404, error: 'User not found' };
  }

  if (!name || !scheduleType) {
    return { status: 400, error: 'Name and schedule type are required' };
  }

  const { workouts } = body;

  // Ensure all workout Ids are valid
  const workoutIds: string[] = workouts.map((workout) => workout.workoutId?.toString()).filter((id): id is string => !!id);
  const validWorkouts = await WorkoutPrototype.find({ _id: { $in: workoutIds } }).select('_id').lean();
  const validWorkoutIds = validWorkouts.map((workout) => workout._id.toString());

  const invalidWorkouts = workoutIds.filter((id) => !validWorkoutIds.includes(id));
  if (invalidWorkouts.length > 0) {
    return { status: 400, error: 'Invalid workout IDs provided', invalidWorkouts };
  }

  const newProgram = await Program.create({
    name,
    description: body.description,
    workouts,
    userId: user._id,
    duration: body.duration,
    notes: body.notes,
    isPublic: body.isPublic,
    scheduleType: scheduleType as ScheduleTypeValue,
    focusAreas: body.focusAreas as FocusAreasValue[],
    targetAudience: body.targetAudience as TargetAudienceValue,
    cardioRecommendations: body.cardioRecommendations,
    progressionStrategy: body.progressionStrategy,
  });

  return { status: 200, message: 'Program created successfully', programId: newProgram._id };
};

// Function to update a program with explicit typing
export const updateProgram = async (body: IUpdateProgramBody): Promise<ServiceResult<{ programId: string }>> => {
  const { programId, updateData } = body;

  if (!programId || !mongoose.isValidObjectId(programId)) {
    return { status: 400, error: 'Program ID is required and must be a valid ID' };
  }

  const updatedProgram = await Program.findByIdAndUpdate(programId, updateData, { new: true });
  if (!updatedProgram) {
    return { status: 404, error: 'Program not found' };
  }

  return { status: 200, message: 'Program updated successfully', programId: updatedProgram._id };
};

export const deleteProgram = async (body: IDeleteProgramBody): Promise<ServiceResult<{ programId: string }>> => {
  const { programId } = body;

  if (!programId || !mongoose.isValidObjectId(programId)) {
    return { status: 400, error: 'Program ID is required and must be a valid ID' };
  }

  const deletedProgram = await Program.findByIdAndDelete(programId);
  if (!deletedProgram) {
    return { status: 404, error: 'Program not found' };
  }

  return { status: 200, message: 'Program deleted successfully', programId: deletedProgram._id };
};

export const readPrograms = async (request: Request): Promise<ServiceResult<IProgram[]>> => {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const { query, limit, offset, sortBy, sortOrder } = buildQueryFromRequest(request, queryConfig);

  const sortOption: Record<string, 1 | -1> | null = sortBy ? { [sortBy]: sortOrder as 1 | -1 } : null;

  let queryObj = Program.find(query).sort(sortOption).skip(offset).limit(limit);

  const populateOptions = buildPopulateOptions(searchParams, 'populate');
  populateOptions.forEach((option: string | string[]) => {
    queryObj = queryObj.populate(option);
  });

  const programs = await queryObj.lean();

  return { status: 200, data: programs };
};

export const readProgramById = async (id: string, searchParams: URLSearchParams): Promise<ServiceResult<IProgram>> => {
  if (!id || !mongoose.isValidObjectId(id)) {
    return { status: 400, error: 'Invalid or missing program ID' };
  }

  let query = Program.findById(id);
  const populateOptions = buildPopulateOptions(searchParams, 'populate');
  populateOptions.forEach((option) => {
    query = query.populate(option);
  });

  const program = await query.lean();

  if (!program) {
    return { status: 404, error: 'Program not found' };
  }

  return { status: 200, data: program };
};
