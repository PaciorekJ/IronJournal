import {
    ILocalizedWorkout,
    ISet,
    IUser,
    IWorkout,
    LANGUAGE,
    LanguageKey,
    resolveLocalizedWorkout,
    TranslationTask,
    Workout,
} from "@paciorekj/iron-journal-shared";
import { data } from "@remix-run/node";
import { ServiceResult } from "~/interfaces/service-result";
import {
    buildPopulateOptions,
    buildQueryFromSearchParams,
    IQueryField,
} from "~/queryConfig/utils";
import { workoutQueryConfig } from "~/queryConfig/workout";
import { localizeDataInput } from "~/utils/localization.server";
import {
    batchDeleteCachedCensoredText,
    censorText,
    setCensorTiers,
} from "~/utils/profanityFilter.server";
import { handleError } from "~/utils/util.server";
import {
    IAddSetToWorkoutDTO,
    IRemoveSetFromWorkoutDTO,
    IReorderSetsDTO,
    IWorkoutPrototypeCreateDTO,
    IWorkoutPrototypeUpdateDTO as IWorkoutUpdateDTO,
} from "~/validation/workout";
import { awardXp } from "./awardXp";

export const censorWorkout = async (
    user: IUser,
    workout: IWorkout,
): Promise<IWorkout> => {
    setCensorTiers(user.acceptedProfanityTiers);
    const locales = [user.languagePreference, workout.originalLanguage];

    for (const locale of locales) {
        const key = locale as LanguageKey;

        workout.name[key] = await censorText(
            workout.name[key],
            `workout-${workout._id}-name-${key}`,
            key,
        );

        if (workout.description?.[key]) {
            workout.description[key] = await censorText(
                workout.description[key],
                `workout-${workout._id}-description-${key}`,
                key,
            );
        }
    }

    return workout;
};

const deleteCachedCensoredWorkouts = async (workout: IWorkout) => {
    const locales = Object.keys(LANGUAGE);

    await batchDeleteCachedCensoredText(
        locales.map((locale) => `workout-${workout._id}-name-${locale}`),
    );

    const description = workout.description as Record<string, string>;
    const descriptionKeys = Object.keys(description);

    if (description) {
        await batchDeleteCachedCensoredText(
            descriptionKeys.map(
                (locale) => `workout-${workout._id}-description-${locale}`,
            ),
        );
    }

    return workout;
};

export const createWorkout = async (
    user: IUser,
    data: IWorkoutPrototypeCreateDTO,
): Promise<ServiceResult<IWorkout>> => {
    try {
        const { data: localizedCreateData, queueTranslationTask } =
            localizeDataInput(
                data,
                user.languagePreference as LanguageKey,
                ["name", "description"],
                "WORKOUT-PROTOTYPE" as any,
            );

        const newWorkout = await Workout.create({
            ...localizedCreateData,
            originalLanguage: user.languagePreference as LanguageKey,
            userId: user._id,
        });

        // Await the queueTranslationTask
        await queueTranslationTask(newWorkout._id);

        const leveling = await awardXp(
            user._id.toString(),
            "createWorkoutSchedule",
        );

        return {
            message: "Workout created successfully",
            data: newWorkout,
            leveling,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const updateWorkout = async (
    user: IUser,
    workoutId: string,
    updateData: IWorkoutUpdateDTO,
): Promise<ServiceResult<IWorkout>> => {
    try {
        const workout = await Workout.findOne({
            _id: workoutId,
            userId: user._id,
        });

        if (!workout) {
            throw data({ error: "Workout not found" }, { status: 404 });
        }

        const { data: localizedUpdateData, queueTranslationTask } =
            localizeDataInput(
                updateData,
                user.languagePreference as LanguageKey,
                ["name", "description"],
                "WORKOUT-PROTOTYPE" as any,
            );

        // Use findByIdAndUpdate for atomic update
        const updatedWorkout = await Workout.findByIdAndUpdate(
            workoutId,
            {
                $set: {
                    ...localizedUpdateData,
                    originalLanguage: user.languagePreference as LanguageKey,
                },
            },
            { new: true },
        );

        if (!updatedWorkout) {
            throw data({ error: "Failed to update workout" }, { status: 500 });
        }

        await deleteCachedCensoredWorkouts(updatedWorkout);

        // Cancel any pending translation tasks before queuing a new one
        await TranslationTask.updateMany(
            {
                documentId: updatedWorkout._id,
                documentType: "WORKOUT-PROTOTYPE",
                status: { $in: ["PENDING", "IN_PROGRESS"] },
            },
            { $set: { status: "CANCELED" } },
        );

        // Await the queueTranslationTask
        await queueTranslationTask(updatedWorkout._id);

        return {
            message: "Workout updated successfully",
            data: updatedWorkout,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteWorkout = async (
    user: IUser,
    workoutId: string,
): Promise<ServiceResult<undefined>> => {
    try {
        const workout = await Workout.findOne({
            _id: workoutId,
            userId: user._id,
        });

        if (!workout) {
            throw data({ error: "Workout not found" }, { status: 404 });
        }

        await workout.deleteOne();

        await deleteCachedCensoredWorkouts(workout);

        await TranslationTask.updateMany(
            {
                documentId: workout._id,
                documentType: "WORKOUT-PROTOTYPE",
                status: { $in: ["PENDING", "IN_PROGRESS"] },
            },
            { $set: { status: "CANCELED" } },
        );

        return {
            message: "Workout deleted successfully",
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const readWorkouts = async (
    user: IUser,
    searchParams: URLSearchParams,
): Promise<ServiceResult<ILocalizedWorkout[]>> => {
    try {
        const { query, limit, offset, sortBy, sortOrder } =
            buildQueryFromSearchParams<IWorkout>(
                searchParams,
                workoutQueryConfig,
                user.languagePreference as LanguageKey,
            ) as any;

        const mine = searchParams.get("mine") === "true";
        const userId = searchParams.get("userId");
        const setOffset = parseInt(searchParams.get("setOffset") || "0", 10);
        const setLimit = parseInt(searchParams.get("setLimit") || "10", 10); // Default to 10

        if (mine) {
            query.userId = user._id;
        } else if (userId) {
            query.userId = userId as IQueryField<string>;
            query.isPublic = true;
        } else {
            query.isPublic = true;
        }

        const sortOption: Record<string, 1 | -1> | null = sortBy
            ? { [sortBy]: sortOrder as 1 | -1 }
            : null;

        let queryObj = Workout.find(query)
            .sort(sortOption)
            .skip(offset)
            .limit(limit);

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option) => {
            queryObj = queryObj.populate(option);
        });

        const raw = await queryObj.lean().exec();

        const workouts = raw as IWorkout[];

        let hasMoreSets = false;
        workouts.forEach((workout) => {
            if (workout.sets.length > setOffset + setLimit) {
                hasMoreSets = true;
            }
            workout.sets = workout.sets.slice(setOffset, setOffset + setLimit);
        });

        const censoredWorkouts = await Promise.all(
            workouts.map((workout) => censorWorkout(user, workout)),
        );

        const localizedWorkouts: ILocalizedWorkout[] = censoredWorkouts.map(
            (workout) => resolveLocalizedWorkout(workout, user),
        );

        const totalCount = await Workout.countDocuments(query).exec();
        const hasMore = offset + workouts.length < totalCount;

        return { data: localizedWorkouts, hasMore, hasMoreSets };
    } catch (error) {
        throw handleError(error);
    }
};

export const readWorkoutById = async (
    user: IUser,
    workoutId: string,
    searchParams: URLSearchParams,
): Promise<ServiceResult<ILocalizedWorkout>> => {
    try {
        const setOffset = parseInt(searchParams.get("setOffset") || "0", 10);
        const setLimit = parseInt(searchParams.get("setLimit") || "10", 10); // Default to 10

        let queryObj = Workout.findById(workoutId);

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option) => {
            queryObj = queryObj.populate(option);
        });

        const workout = (await queryObj.lean().exec()) as IWorkout;

        let hasMoreSets = false;
        if (workout.sets.length > setOffset + setLimit) {
            hasMoreSets = true;
        }
        workout.sets = workout.sets.slice(setOffset, setOffset + setLimit);

        if (!workout) {
            throw data({ error: "Workout not found" }, { status: 404 });
        }

        if (workout.userId.toString() !== user._id.toString()) {
            throw data(
                {
                    error: "Forbidden: You do not have access to this workout",
                },
                { status: 403 },
            );
        }

        const censoredWorkout = await censorWorkout(user, workout);

        const localizedWorkout = resolveLocalizedWorkout(censoredWorkout, user);

        return { data: localizedWorkout, hasMoreSets };
    } catch (error) {
        throw handleError(error);
    }
};

export const addSetToWorkout = async (
    user: IUser,
    workoutId: string,
    { set, index }: IAddSetToWorkoutDTO,
): Promise<ServiceResult<{ index: number; set: ISet }>> => {
    try {
        const workout = await Workout.findById(workoutId);
        if (!workout) {
            throw data({ error: "Workout not found" }, { status: 404 });
        }
        if (workout.userId.toString() !== user._id.toString()) {
            throw data({ error: "Forbidden" }, { status: 403 });
        }

        // Determine the actual insert position
        const insertAt =
            typeof index === "number" &&
            index >= 0 &&
            index <= workout.sets.length
                ? index
                : workout.sets.length;

        workout.sets.splice(insertAt, 0, set);
        await workout.save();

        return {
            message: "Set added",
            data: { index: insertAt, set },
        };
    } catch (err) {
        throw handleError(err);
    }
};

export const removeSetFromWorkout = async (
    user: IUser,
    workoutId: string,
    { index }: IRemoveSetFromWorkoutDTO,
): Promise<ServiceResult<{ index: number }>> => {
    try {
        const workout = await Workout.findById(workoutId);
        if (!workout) {
            throw data({ error: "Workout not found" }, { status: 404 });
        }
        if (workout.userId.toString() !== user._id.toString()) {
            throw data({ error: "Forbidden" }, { status: 403 });
        }

        if (index < 0 || index >= workout.sets.length) {
            throw data({ error: "Invalid set index" }, { status: 400 });
        }

        workout.sets.splice(index, 1);
        await workout.save();

        return { message: "Set removed", data: { index } };
    } catch (err) {
        throw handleError(err);
    }
};

export const reorderSetsInWorkout = async (
    user: IUser,
    workoutId: string,
    { fromIndex, toIndex }: IReorderSetsDTO,
): Promise<ServiceResult<{ fromIndex: number; toIndex: number }>> => {
    try {
        const workout = await Workout.findById(workoutId);
        if (!workout) {
            throw data({ error: "Workout not found" }, { status: 404 });
        }
        if (workout.userId.toString() !== user._id.toString()) {
            throw data({ error: "Forbidden" }, { status: 403 });
        }

        const len = workout.sets.length;
        if (
            fromIndex < 0 ||
            fromIndex >= len ||
            toIndex < 0 ||
            toIndex >= len
        ) {
            throw data(
                { error: "Invalid fromIndex or toIndex" },
                { status: 400 },
            );
        }

        // No-op if positions are the same
        if (fromIndex === toIndex) {
            return { message: "No change", data: { fromIndex, toIndex } };
        }

        const [moved] = workout.sets.splice(fromIndex, 1);
        workout.sets.splice(toIndex, 0, moved);

        await workout.save();
        return {
            message: "Sets reordered",
            data: { fromIndex, toIndex },
        };
    } catch (err) {
        throw handleError(err);
    }
};
