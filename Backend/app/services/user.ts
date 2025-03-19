import {
    ILocalizedUser,
    IUser,
    LanguageKey,
    resolveLocalizedUser,
    User,
} from "@paciorekj/iron-journal-shared";
import { data, json } from "@remix-run/node";
import { ServiceResult } from "~/interfaces/service-result";
import { censorText } from "~/utils/profanityFilter.server";
import {
    buildQueryFromSearchParams,
    userQueryConfig,
} from "~/utils/query.server";
import { handleError } from "~/utils/util.server";
import { IUserCreateDTO, IUserUpdateDTO } from "~/validation/user.server";

export const createUser = async (
    createData: IUserCreateDTO,
): Promise<ServiceResult<IUser>> => {
    try {
        const { username, firebaseId } = createData;

        if (!username || !firebaseId) {
            throw data(
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
            throw data({ error: "User already exists" }, { status: 409 });
        }

        if (existingUser?.username === username) {
            throw data({ error: "Username is already taken" }, { status: 409 });
        }

        const censoredUsername = await censorText(
            username,
            "username",
            createData.languagePreference,
        );

        const isProfane = username !== censoredUsername;

        if (isProfane) {
            throw data(
                { error: "Username contains profanity" },
                { status: 400 },
            );
        }

        const newUser = await User.create(createData);
        const { firebaseId: _, ...user } = newUser.toJSON();

        return {
            message: "User created successfully",
            data: user as unknown as IUser,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const updateUser = async (
    user: IUser,
    updateData: IUserUpdateDTO,
): Promise<ServiceResult<IUser>> => {
    try {
        const { _id: userId, username, languagePreference } = user;
        const { username: updateUsername } = updateData;

        if (updateUsername && updateUsername !== username) {
            const existingUser =
                updateUsername &&
                (await User.findOne({ username: updateUsername })
                    .select("_id")
                    .lean());

            if (
                existingUser &&
                (existingUser as IUser)._id.toString() !== userId.toString()
            ) {
                throw data(
                    { error: "Username is already taken" },
                    { status: 409 },
                );
            }

            const censoredUsername = await censorText(
                updateUsername,
                "username",
                languagePreference,
            );

            const isProfane = updateUsername !== censoredUsername;

            if (isProfane) {
                throw data(
                    { error: "Username contains profanity" },
                    { status: 400 },
                );
            }
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        }).select("-firebaseId");
        if (!updatedUser) {
            throw data({ error: "User not found" }, { status: 404 });
        }

        return {
            message: "User updated successfully",
            data: updatedUser,
        };
    } catch (error) {
        throw handleError(error);
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
            throw data({ error: "User not found" }, { status: 404 });
        }

        return { message: "User deleted successfully" };
    } catch (error) {
        throw handleError(error);
    }
};

export const readUsers = async (
    user: IUser,
    searchParams: URLSearchParams,
): Promise<ServiceResult<ILocalizedUser[]>> => {
    try {
        const { query, limit, offset, sortBy, sortOrder } =
            buildQueryFromSearchParams(
                searchParams,
                userQueryConfig,
                user.languagePreference as LanguageKey,
            );

        const sortOption: Record<string, 1 | -1> | undefined = sortBy
            ? { [sortBy]: sortOrder as 1 | -1 }
            : undefined;

        const users = await User.find(query)
            .skip(offset)
            .limit(limit)
            .sort(sortOption)
            .select("-firebaseId")
            .lean()
            .exec();

        const language = user.languagePreference as LanguageKey;

        const localizedUsers: ILocalizedUser[] = users.map((userData) => {
            const localizedUser = resolveLocalizedUser(
                userData as IUser,
                language,
            );
            return localizedUser;
        });

        const totalCount = await User.countDocuments(query).exec();
        const hasMore = offset + users.length < totalCount;

        return { data: localizedUsers, hasMore };
    } catch (error) {
        throw handleError(error);
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

        const localizedUser = resolveLocalizedUser(userData as IUser, language);

        return { data: localizedUser };
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteFavorite = async (
    userId: string,
    favoriteId: string,
    favoriteType: "program" | "workout",
) => {
    try {
        if (!userId || !favoriteId || !favoriteType) {
            throw data(
                { error: "Missing userId, favoriteId, or favoriteType" },
                { status: 400 },
            );
        }
        if (!["program", "workout"].includes(favoriteType)) {
            throw data(
                {
                    error: "Invalid favoriteType: Must be 'program' or 'workout'",
                },
                { status: 400 },
            );
        }

        const field =
            favoriteType === "program"
                ? "favoritePrograms"
                : "favoriteWorkouts";

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { [field]: favoriteId } },
            { new: true, runValidators: true },
        ).select("-firebaseId");

        if (!updatedUser) {
            throw data({ error: "User not found" }, { status: 404 });
        }

        return {
            message: `${favoriteType.charAt(0).toUpperCase() + favoriteType.slice(1)} removed from favorites`,
            data: updatedUser,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const addFavorite = async (
    userId: string,
    favoriteId: string,
    favoriteType: "program" | "workout",
) => {
    try {
        if (!userId || !favoriteId || !favoriteType) {
            throw data(
                { error: "Missing userId, favoriteId, or favoriteType" },
                { status: 400 },
            );
        }
        if (!["program", "workout"].includes(favoriteType)) {
            throw data(
                {
                    error: "Invalid favoriteType: Must be 'program' or 'workout'",
                },
                { status: 400 },
            );
        }

        const field =
            favoriteType === "program"
                ? "favoritePrograms"
                : "favoriteWorkouts";

        const user = await User.findById(userId).select(`${field} _id`);
        if (!user) {
            throw data({ error: "User not found" }, { status: 404 });
        }

        if (user[field].length >= 100) {
            throw data(
                { error: `You can only have 100 favorite ${favoriteType}s.` },
                { status: 400 },
            );
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { [field]: favoriteId } },
            { new: true, runValidators: true },
        ).select("-firebaseId");

        return {
            message: `${favoriteType.charAt(0).toUpperCase() + favoriteType.slice(1)} added to favorites`,
            data: updatedUser,
        };
    } catch (error) {
        throw handleError(error);
    }
};
