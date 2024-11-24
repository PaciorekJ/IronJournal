import {
    ILocalizedWorkoutPrototype,
    IUser,
    IWorkoutPrototype,
    LanguageKey,
    resolveLocalizedWorkout,
    TranslationTask,
    WorkoutPrototype,
} from "@paciorekj/iron-journal-shared";
import { json } from "@remix-run/node";
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
    IWorkoutPrototypeUpdateDTO,
} from "~/validation/workout-prototype";

export const createWorkoutPrototype = async (
    user: IUser,
    data: IWorkoutPrototypeCreateDTO,
): Promise<ServiceResult<IWorkoutPrototype>> => {
    try {
        const { data: localizedCreateData, queueTranslationTask } =
            localizeDataInput(
                data,
                user.languagePreference as LanguageKey,
                ["name", "description"],
                "WORKOUT-PROTOTYPE" as any,
            );

        const newWorkout = await WorkoutPrototype.create({
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
    updateData: IWorkoutPrototypeUpdateDTO,
): Promise<ServiceResult<IWorkoutPrototype>> => {
    try {
        const workout = await WorkoutPrototype.findOne({
            _id: workoutId,
            userId: user._id,
        });

        if (!workout) {
            throw json({ error: "Workout not found" }, { status: 404 });
        }

        const { data: localizedUpdateData, queueTranslationTask } =
            localizeDataInput(
                updateData,
                user.languagePreference as LanguageKey,
                ["name", "description"],
                "WORKOUT-PROTOTYPE" as any,
            );

        // Use findByIdAndUpdate for atomic update
        const updatedWorkout = await WorkoutPrototype.findByIdAndUpdate(
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
            throw json({ error: "Failed to update workout" }, { status: 500 });
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
        const workout = await WorkoutPrototype.findOne({
            _id: workoutId,
            userId: user._id,
        });

        if (!workout) {
            throw json({ error: "Workout not found" }, { status: 404 });
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

export const readWorkoutPrototypes = async (
    user: IUser,
    searchParams: URLSearchParams,
): Promise<ServiceResult<ILocalizedWorkoutPrototype[]>> => {
    try {
        const { query, limit, offset, sortBy, sortOrder } =
            buildQueryFromSearchParams<IWorkoutPrototype>(
                searchParams,
                workoutPrototypeQueryConfig,
                user.languagePreference as LanguageKey,
            ) as any;

        query.userId = user._id;

        const sortOption: Record<string, 1 | -1> | null = sortBy
            ? { [sortBy]: sortOrder as 1 | -1 }
            : null;

        const language = user.languagePreference as LanguageKey;

        let queryObj = WorkoutPrototype.find(query)
            .sort(sortOption)
            .skip(offset)
            .limit(limit);

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option) => {
            queryObj = queryObj.populate(option);
        });

        const workouts = (await queryObj.lean().exec()) as IWorkoutPrototype[];

        const localizedWorkouts: ILocalizedWorkoutPrototype[] = workouts.map(
            (workout) => resolveLocalizedWorkout(workout, language),
        );

        const totalCount = await WorkoutPrototype.countDocuments(query).exec();
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
): Promise<ServiceResult<ILocalizedWorkoutPrototype>> => {
    try {
        const language = user.languagePreference as LanguageKey;

        let queryObj = WorkoutPrototype.findById(workoutId);

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option) => {
            queryObj = queryObj.populate(option);
        });

        const workout = (await queryObj.lean().exec()) as IWorkoutPrototype;

        if (!workout) {
            throw json({ error: "Workout not found" }, { status: 404 });
        }

        if (workout.userId.toString() !== user._id.toString()) {
            throw json(
                {
                    error: "Forbidden: You do not have access to this workout",
                },
                { status: 403 },
            );
        }

        const localizedWorkout = resolveLocalizedWorkout(workout, language);

        return { data: localizedWorkout };
    } catch (error) {
        throw handleError(error);
    }
};
