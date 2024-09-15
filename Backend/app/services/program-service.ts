// app/services/program-service.ts

import mongoose from 'mongoose';
import { ServiceResult } from '~/interfaces/service-result';
import { IProgram, Program } from '~/models/program';
import { SetPrototype } from '~/models/set-prototype';
import { IUser } from '~/models/user';
import { WorkoutPrototype } from '~/models/workout-prototype';
import { IBuildQueryConfig, buildPopulateOptions, buildQueryFromSearchParams } from '~/utils/util.server';
import { CreateProgramInput, UpdateProgramInput } from '~/validation/program.server';

export const createProgram = async (
  user: IUser,
  data: CreateProgramInput
): Promise<ServiceResult<{ programId: string }>> => {
  try {

    const { workoutSchedule } = data;

    const workoutIds: string[] = workoutSchedule
      .map((item) => item.workoutId?.toString())
      .filter((id): id is string => !!id);

    const validWorkouts = await WorkoutPrototype.find({
      _id: { $in: workoutIds },
      userId: user._id,
    })
      .select('_id')
      .lean();

    const validWorkoutIds = validWorkouts.map((workout) => workout._id.toString());

    const invalidWorkouts = workoutIds.filter((id) => !validWorkoutIds.includes(id));
    if (invalidWorkouts.length > 0) {
      return { status: 400, error: 'Invalid workout IDs provided', invalidWorkouts };
    }

    const newProgram: IProgram = await Program.create({
      ...data,
      userId: user._id,
    });

    return { status: 201, message: 'Program created successfully', programId: newProgram._id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

export const updateProgram = async (
  user: IUser,
  programId: string,
  updateData: UpdateProgramInput
): Promise<ServiceResult<{ programId: string }>> => {
  if (!mongoose.isValidObjectId(programId)) {
    return { status: 400, error: 'Program ID is invalid' };
  }

  try {
    // Find the program and ensure it belongs to the user
    const program = await Program.findOne({ _id: programId, userId: user._id });

    if (!program) {
      return { status: 404, error: 'Program not found' };
    }

    // Update the program
    Object.assign(program, updateData);
    await program.save();

    return { status: 200, message: 'Program updated successfully', programId: program._id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

export const deleteProgram = async (
  user: IUser,
  programId: string
): Promise<ServiceResult<{ programId: string }>> => {
  if (!mongoose.isValidObjectId(programId)) {
    return { status: 400, error: 'Program ID is invalid' };
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the program and ensure it belongs to the user
    const program = await Program.findOne({ _id: programId, userId: user._id }).session(session);

    if (!program) {
      await session.abortTransaction();
      session.endSession();
      return { status: 404, error: 'Program not found' };
    }

    // Delete associated workouts
    const workoutsToDelete = await WorkoutPrototype.find({ programId: program._id, userId: user._id })
      .select('_id')
      .session(session);

    const workoutIds = workoutsToDelete.map((workout) => workout._id);

    await WorkoutPrototype.deleteMany({ _id: { $in: workoutIds } }).session(session);

    // Delete associated sets
    await SetPrototype.deleteMany({ workoutId: { $in: workoutIds } }).session(session);

    // Delete the program
    await program.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    return { status: 200, message: 'Program deleted successfully', programId: program._id };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

export const readPrograms = async (
  user: IUser,
  searchParams: URLSearchParams
): Promise<ServiceResult<IProgram[]>> => {
  try {
    const queryConfig: IBuildQueryConfig = {
      name: {
        isArray: false,
        constructor: String,
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

    const { query, limit, offset, sortBy, sortOrder } = buildQueryFromSearchParams(searchParams, queryConfig) as any;

    // Ensure the user can only see their own programs or public programs
    query.$or = [{ userId: user._id }, { isPublic: true }];

    const sortOption: Record<string, 1 | -1> | null = sortBy ? { [sortBy]: sortOrder as 1 | -1 } : null;

    let queryObj = Program.find(query).sort(sortOption).skip(offset).limit(limit);

    const populateOptions = buildPopulateOptions(searchParams, 'populate');
    populateOptions.forEach((option: string | string[]) => {
      queryObj = queryObj.populate(option);
    });

    const programs = await queryObj.lean();

    return { status: 200, data: programs };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

export const readProgramById = async (
  user: IUser,
  id: string,
  searchParams: URLSearchParams
): Promise<ServiceResult<IProgram>> => {
  if (!id || !mongoose.isValidObjectId(id)) {
    return { status: 400, error: 'Invalid or missing program ID' };
  }

  try {
    let query = Program.findById(id);

    const populateOptions = buildPopulateOptions(searchParams, 'populate');
    populateOptions.forEach((option) => {
      query = query.populate(option);
    });

    const program = await query.lean();

    if (!program) {
      return { status: 404, error: 'Program not found' };
    }

    // Check if the user has access to the program
    if (!program.isPublic && program.userId.toString() !== user._id) {
      return { status: 403, error: 'Forbidden: You do not have access to this program' };
    }

    return { status: 200, data: program };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};
