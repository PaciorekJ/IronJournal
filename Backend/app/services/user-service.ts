import mongoose from 'mongoose';
import { ROLE } from '~/constants/role';
import { ServiceResult } from '~/interfaces/service-result';
import { IUser, User } from '~/models/user';
import { IBuildQueryConfig, buildQueryFromSearchParams } from '~/utils/util.server';
import { CreateUserInput, UpdateUserInput } from '~/validation/user.server';

// Function to create a new user
export const createUser = async (
  currentUser: IUser,
  data: CreateUserInput
): Promise<ServiceResult<IUser>> => {
  try {
    const { username, firebaseId } = data;

    if (!username || !firebaseId) {
      return { status: 400, error: 'Username and Firebase ID are required' };
    }

    const existingUser = await User.findOne({ firebaseId }).select('_id').lean();
    if (existingUser) {
      return { status: 409, error: 'User already exists' };
    }

    const newUser = await User.create({ username, firebaseId, role: data.role ?? ROLE.USER });

    return { status: 200, message: 'User created successfully', data: newUser };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

// Function to update the authenticated user's information
export const updateUser = async (
  body: { userId: string; updateData: UpdateUserInput }
): Promise<ServiceResult<IUser>> => {
  const { userId, updateData } = body;

  if (!userId || !mongoose.isValidObjectId(userId)) {
    return { status: 400, error: 'User ID is required and must be a valid ID' };
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) {
      return { status: 404, error: 'User not found' };
    }

    return { status: 200, message: 'User updated successfully', data: updatedUser };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

// Function to delete the authenticated user's information
export const deleteUser = async (
  body: { userId: string }
): Promise<ServiceResult<IUser>> => {
  const { userId } = body;

  if (!userId || !mongoose.isValidObjectId(userId)) {
    return { status: 400, error: 'User ID is required and must be a valid ID' };
  }

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return { status: 404, error: 'User not found' };
    }

    return { status: 200, data: deletedUser };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

// Function to read user by Firebase ID
export const readUserByFirebaseId = async (firebaseId: string): Promise<ServiceResult<IUser>> => {
  try {
    const user = await User.findOne({ firebaseId }).lean();

    if (!user) {
      return { status: 404, error: 'User not found' };
    }

    return { status: 200, data: user };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

// Function to read all users based on search parameters
export const readUsers = async (request: Request): Promise<ServiceResult<IUser[]>> => {
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);

    const { query, limit, offset } = buildQueryFromSearchParams(searchParams, queryConfig);

    const users = await User.find(query).skip(offset).limit(limit).lean();

    return { status: 200, data: users };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

// Function to read user by ID
export const readUserById = async (id: string): Promise<ServiceResult<IUser>> => {
  if (!id || !mongoose.isValidObjectId(id)) {
    return { status: 400, error: 'Invalid or missing user ID' };
  }

  try {
    const user = await User.findById(id).lean();

    if (!user) {
      return { status: 404, error: 'User not found' };
    }

    return { status: 200, data: user };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

// Query configuration for building queries
const queryConfig: IBuildQueryConfig = {
  username: {
    isArray: false,
    constructor: String,
    regex: (value: string) => new RegExp(value, 'i'),
  },
};