// app/services/user-service.ts
import mongoose from 'mongoose';
import { IUser, User } from '~/models/user';
import { ServiceResult } from '~/types/service-result';
import { requireAuth } from '~/utils/auth.server';
import { buildQueryFromRequest, IBuildQueryConfig } from '~/utils/util.server';

interface ICreateUserBody {
  username: string;
}

interface IUpdateUserBody {
  userId: string;
  updateData: Partial<IUser>;
}

interface IDeleteUserBody {
  userId: string;
}

// Query configuration for building queries
const queryConfig: IBuildQueryConfig = {
  username: {
    isArray: false,
    constructor: String,
    regex: (value: string) => new RegExp(value, 'i'),
  },
};

export const createUser = async (
  body: ICreateUserBody,
  request: Request
): Promise<ServiceResult<IUser>> => {
  try {
    const { username } = body;
    const { uid: firebaseId } = await requireAuth(request);

    if (!username || !firebaseId) {
      return { status: 400, error: 'Username and Firebase ID are required' };
    }

    // Check if a user with the same Firebase ID already exists
    const existingUser = await User.findOne({ firebaseId }).select('_id').lean();
    if (existingUser) {
      return { status: 409, error: 'User already exists' };
    }

    // Create a new user in MongoDB
    const newUser = await User.create({ username, firebaseId });

    return { status: 200, message: 'User created successfully', data: newUser };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

export const updateUser = async (
  body: IUpdateUserBody
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

export const deleteUser = async (
  body: IDeleteUserBody
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

export const readUsers = async (request: Request): Promise<ServiceResult<IUser[]>> => {
  try {
    const { query, limit, offset } = buildQueryFromRequest(request, queryConfig);

    const users = await User.find(query).skip(offset).limit(limit).lean();

    return { status: 200, data: users };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { status: 500, error: errorMessage };
  }
};

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
  