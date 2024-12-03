import {
    ILocalizedWorkout,
    IUser,
    IWorkout,
    LanguageKey,
    resolveLocalizedWorkout,
    TranslationTask,
    Workout,
} from "@paciorekj/iron-journal-shared";
import { data } from "@remix-run/node";
import { ServiceResult } from "~/interfaces/service-result";
import { localizeDataInput } from "~/utils/localization.server";
import {
    buildPopulateOptions,
    buildQueryFromSearchParams,
    workoutPrototypeQueryConfig,
} from "~/utils/query.server";
import { handleError } from "~/utils/util.server";
import {
    IWorkoutPrototypeCreateDTO,
    IWorkoutPrototypeUpdateDTO as IWorkoutUpdateDTO,
} from "~/validation/workout-prototype";

export const createWorkoutPrototype = async (
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

        return {
            message: "Workout created successfully",
            data: newWorkout,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const updateWorkoutPrototype = async (
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

export const deleteWorkoutPrototype = async (
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

        const localizedWorkouts: ILocalizedWorkout[] = workouts.map((workout) =>
            resolveLocalizedWorkout(workout, user),
        );

        const totalCount = await Workout.countDocuments(query).exec();
        const hasMore = offset + workouts.length < totalCount;

        return { data: localizedWorkouts, hasMore };
    } catch (error) {
        throw handleError(error);
    }
};

export const readWorkoutPrototypeById = async (
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

        const localizedWorkout = resolveLocalizedWorkout(workout, user);

        return { data: localizedWorkout };
    } catch (error) {
        throw handleError(error);
    }
};
