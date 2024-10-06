import { json } from "@remix-run/node";
import { LanguageKey } from "~/constants/language";
import { ServiceResult } from "~/interfaces/service-result";
import {
    ILocalizedUser,
    localizeUserConstants,
} from "~/localization/users.server";
import { IUser, User } from "~/models/user";
import {
    buildQueryFromSearchParams,
    userQueryConfig,
} from "~/utils/query.server";
import { IUserCreateDTO, IUserUpdateDTO } from "~/validation/user.server";

export const createUser = async (
    createData: IUserCreateDTO,
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
    updateData: IUserUpdateDTO,
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
            runValidators: true,
        }).select("-firebaseId");
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
    user: IUser,
    searchParams: URLSearchParams,
): Promise<ServiceResult<ILocalizedUser[]>> => {
    try {
        const { query, limit, offset } = buildQueryFromSearchParams(
            searchParams,
            userQueryConfig,
            user.languagePreference as LanguageKey,
        );

        const users = await User.find(query)
            .skip(offset)
            .limit(limit)
            .select("-firebaseId")
            .lean()
            .exec();

        const language = user.languagePreference as LanguageKey;

        const localizedUsers: ILocalizedUser[] = users.map((userData) => {
            const localizedUser = localizeUserConstants(
                userData as IUser,
                language,
            );
            return localizedUser;
        });

        const totalCount = await User.countDocuments(query).exec();
        const hasMore = offset + users.length < totalCount;

        return { data: localizedUsers, hasMore };
    } catch (error) {
        throw json({ error: "An unexpected error occurred" }, { status: 500 });
    }
};

export const readUserById = async (
    currentUser: IUser,
    userId: string,
): Promise<ServiceResult<ILocalizedUser>> => {
    try {
        const userData = await User.findById(userId)
            .select("-firebaseId")
            .lean()
            .exec();

        if (!userData) {
            throw json({ error: "User not found" }, { status: 404 });
        }

        const language = currentUser.languagePreference as LanguageKey;

        const localizedUser = localizeUserConstants(
            userData as IUser,
            language,
        );

        return { data: localizedUser };
    } catch (error) {
        throw json({ error: "An unexpected error occurred" }, { status: 500 });
    }
};
