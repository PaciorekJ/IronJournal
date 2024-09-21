import { json } from "@remix-run/node";
import { z } from "zod";
import { ServiceResult } from "~/interfaces/service-result";
import { IUser, User } from "~/models/user";
import {
    IBuildQueryConfig,
    addPaginationAndSorting,
    buildQueryFromSearchParams,
} from "~/utils/util.server";
import { CreateUserInput, UpdateUserInput } from "~/validation/user.server";

// Defined search Params usable by User Services + Populate Options where applicable
const queryConfig: IBuildQueryConfig = addPaginationAndSorting({
    username: {
        isArray: false,
        constructor: String,
        regex: (value: string) => new RegExp(value),
        schema: z.string().min(1),
    },
});

export const createUser = async (
    createData: CreateUserInput,
): Promise<ServiceResult<IUser>> => {
    try {
        const { username, firebaseId } = createData;

        if (!username || !firebaseId) {
            throw json(
                { error: "Username and Firebase ID are required" },
                { status: 400 },
            );
        }

        const existingUser = await User.findOne({
            $or: [{ firebaseId }, { username }],
        })
            .select("_id username firebaseId")
            .lean();

        if (existingUser?.firebaseId === firebaseId) {
            throw json({ error: "User already exists" }, { status: 409 });
        }

        if (existingUser?.username === username) {
            throw json({ error: "Username is already taken" }, { status: 409 });
        }

        const newUser = await User.create(createData);
        const { firebaseId: _, ...user } = newUser.toJSON();

        return {
            message: "User created successfully",
            data: user as IUser,
        };
    } catch (error) {
        throw json({ error: "An unexpected error occurred" }, { status: 500 });
    }
};

export const updateUser = async (
    userId: string,
    updateData: UpdateUserInput,
): Promise<ServiceResult<IUser>> => {
    try {
        const updateUsername = updateData.username;
        const existingUser =
            updateUsername &&
            (await User.findOne({ username: updateUsername })
                .select("_id")
                .lean());

        if (existingUser && existingUser._id.toString() !== userId) {
            throw json({ error: "Username is already taken" }, { status: 409 });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
        })
            .select("-firebaseId")
            .lean();
        if (!updatedUser) {
            throw json({ error: "User not found" }, { status: 404 });
        }

        return {
            message: "User updated successfully",
            data: updatedUser,
        };
    } catch (error) {
        throw json({ error: "An unexpected error occurred" }, { status: 500 });
    }
};

export const deleteUser = async (
    userId: string,
): Promise<ServiceResult<undefined>> => {
    try {
        const deletedUser = await User.findByIdAndDelete(userId)
            .select("_id")
            .lean();
        if (!deletedUser) {
            throw json({ error: "User not found" }, { status: 404 });
        }

        return { message: "User deleted successfully" };
    } catch (error) {
        throw json({ error: "An unexpected error occurred" }, { status: 500 });
    }
};

export const readUsers = async (
    searchParams: URLSearchParams,
): Promise<ServiceResult<IUser[]>> => {
    try {
        const { query, limit, offset } = buildQueryFromSearchParams(
            searchParams,
            queryConfig,
        );

        const users = await User.find(query)
            .skip(offset)
            .limit(limit)
            .select("-firebaseId")
            .lean();

        const totalCount = await User.countDocuments(query).exec();
        const hasMore = offset + users.length < totalCount;

        return { data: users, hasMore };
    } catch (error) {
        throw json({ error: "An unexpected error occurred" }, { status: 500 });
    }
};

export const readUserById = async (
    userId: string,
): Promise<ServiceResult<IUser>> => {
    try {
        const user = await User.findById(userId).select("-firebaseId").lean();

        if (!user) {
            throw json({ error: "User not found" }, { status: 404 });
        }

        return { data: user };
    } catch (error) {
        throw json({ error: "An unexpected error occurred" }, { status: 500 });
    }
};
