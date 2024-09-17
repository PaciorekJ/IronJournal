// app/services/program-service.ts

import mongoose from 'mongoose';
import { ServiceResult } from '~/interfaces/service-result';
import { IProgram, Program } from '~/models/program';
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

    const workoutIds: string[] = (workoutSchedule || [])
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

  try {
    const program = await Program.findOne({ _id: programId, userId: user._id }).lean();

    if (!program) {
      return { status: 404, error: 'Program not found' };
    }

    await program.deleteOne({ _id: programId });

    return { status: 200, message: 'Program deleted successfully', programId: program._id };
  } catch (error) {
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
      userId: {
        isArray: false,
        constructor: String,
      }
    };

    // Build the initial query from search parameters
    const { query, limit, offset, sortBy, sortOrder } = buildQueryFromSearchParams(searchParams, queryConfig) as any;

    // Check if the `mine` parameter is set to "true"
    const mine = searchParams.get('mine') === 'true';
    const userId = searchParams.get('userId');

    if (mine) {
      query.userId = user._id;
    } else if (userId) {
      query.userId = userId;
      query.isPublic = true;
    } else {
      query.isPublic = true;
    }

    const sortOption: Record<string, 1 | -1> | null = sortBy ? { [sortBy]: sortOrder as 1 | -1 } : null;

    let queryObj = Program.find(query).sort(sortOption).skip(offset).limit(limit);

    const populateOptions = buildPopulateOptions(searchParams, 'populate');
    populateOptions.forEach((option: string | string[]) => {
      queryObj = queryObj.populate(option);
    });

    // Fetch the programs with the specified limit and offset
    const programs = await queryObj.lean();
    const totalCount = await Program.countDocuments(query).exec();

    // Determine if there are more records available
    const hasMore = offset + programs.length < totalCount;

    return { status: 200, data: programs, hasMore };
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
