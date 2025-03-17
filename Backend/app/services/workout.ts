import {
    ILocalizedWorkout,
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
import { localizeDataInput } from "~/utils/localization.server";
import {
    batchDeleteCachedCensoredText,
    censorText,
    setCensorTiers,
} from "~/utils/profanityFilter.server";
import {
    buildPopulateOptions,
    buildQueryFromSearchParams,
    workoutPrototypeQueryConfig,
} from "~/utils/query.server";
import { handleError } from "~/utils/util.server";
import {
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
                workoutPrototypeQueryConfig,
                user.languagePreference as LanguageKey,
            ) as any;

        query.userId = user._id;

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

        const workouts = (await queryObj.lean().exec()) as IWorkout[];

        const censoredWorkouts = await Promise.all(
            workouts.map((workout) => censorWorkout(user, workout)),
        );

        const localizedWorkouts: ILocalizedWorkout[] = censoredWorkouts.map(
            (workout) => resolveLocalizedWorkout(workout, user),
        );

        const totalCount = await Workout.countDocuments(query).exec();
        const hasMore = offset + workouts.length < totalCount;

        return { data: localizedWorkouts, hasMore };
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
        let queryObj = Workout.findById(workoutId);

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option) => {
            queryObj = queryObj.populate(option);
        });

        const workout = (await queryObj.lean().exec()) as IWorkout;

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

        return { data: localizedWorkout };
    } catch (error) {
        throw handleError(error);
    }
};
