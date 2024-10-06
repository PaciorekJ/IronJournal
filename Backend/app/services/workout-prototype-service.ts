import { json } from "@remix-run/node";
import { MongooseError } from "mongoose";
import { LanguageKey } from "~/constants/language";
import { ServiceResult } from "~/interfaces/service-result";
import {
    getLocalizedField,
    localizeDataInput,
} from "~/localization/utils.server";
import {
    ILocalizedWorkoutPrototype,
    localizeWorkoutPrototypeConstants,
} from "~/localization/workout-prototype.server";
import { IUser } from "~/models/user";
import {
    IWorkoutPrototype,
    WorkoutPrototype,
} from "~/models/workout-prototype";
import {
    buildPopulateOptions,
    buildQueryFromSearchParams,
    workoutPrototypeQueryConfig,
} from "~/utils/query.server";
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
            localizeDataInput(data, user.languagePreference, [
                "name",
                "description",
            ]);

        const newWorkout = await WorkoutPrototype.create({
            ...localizedCreateData,
            userId: user._id,
        });

        return {
            message: "Workout created successfully",
            data: newWorkout,
        };
    } catch (error) {
        throw json({ error: "An unexpected error occurred" }, { status: 500 });
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
            localizeDataInput(updateData, user.languagePreference, [
                "name",
                "description",
            ]);

        Object.assign(workout, localizedUpdateData);
        await workout.save();

        return {
            message: "Workout updated successfully",
            data: workout,
        };
    } catch (error) {
        throw json({ error: "An unexpected error occurred" }, { status: 500 });
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

        return {
            message: "Workout deleted successfully",
        };
    } catch (error) {
        throw json({ error: "An unexpected error occurred" }, { status: 500 });
    }
};

export const readWorkoutPrototypes = async (
    user: IUser,
    searchParams: URLSearchParams,
): Promise<ServiceResult<ILocalizedWorkoutPrototype[]>> => {
    try {
        const { query, limit, offset, sortBy, sortOrder } =
            buildQueryFromSearchParams<IUser>(
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
            .select({
                [`name.${language}`]: 1,
                [`name.en`]: 1,
                [`description.${language}`]: 1,
                [`description.en`]: 1,
                sets: 1,
                userId: 1,
                intensityLevel: 1,
                createdAt: 1,
                updatedAt: 1,
            })
            .sort(sortOption)
            .skip(offset)
            .limit(limit);

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option) => {
            queryObj = queryObj.populate(option);
        });

        const workouts = (await queryObj.lean().exec()) as IWorkoutPrototype[];

        const localizedWorkouts: ILocalizedWorkoutPrototype[] = workouts.map(
            (workout) => {
                // Localize fields
                const localizedName = getLocalizedField(workout.name, language);
                const localizedDescription =
                    workout.description &&
                    getLocalizedField(workout.description, language);

                // Update the workout with localized fields
                const localizedWorkoutData = {
                    ...workout,
                    name: localizedName,
                    description: localizedDescription,
                };

                // Localize constants and nested structures
                const localizedWorkout = localizeWorkoutPrototypeConstants(
                    localizedWorkoutData as unknown as IWorkoutPrototype,
                    language,
                );

                return localizedWorkout;
            },
        );

        const totalCount = await WorkoutPrototype.countDocuments(query).exec();
        const hasMore = offset + workouts.length < totalCount;

        return { data: localizedWorkouts, hasMore };
    } catch (error) {
        if (error instanceof MongooseError) {
            throw json({
                status: 400,
                error: "Bad request, ensure that the query is valid",
            });
        }
        throw json({ status: 500, error: "An unexpected error occurred" });
    }
};

export const readWorkoutPrototypeById = async (
    user: IUser,
    workoutId: string,
    searchParams: URLSearchParams,
): Promise<ServiceResult<ILocalizedWorkoutPrototype>> => {
    try {
        const language = user.languagePreference as LanguageKey;

        let queryObj = WorkoutPrototype.findById(workoutId).select({
            [`name.${language}`]: 1,
            [`name.en`]: 1,
            [`description.${language}`]: 1,
            [`description.en`]: 1,
            sets: 1,
            userId: 1,
            intensityLevel: 1,
            createdAt: 1,
            updatedAt: 1,
        });

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

        // Localize fields
        const localizedName = getLocalizedField(workout.name, language);
        const localizedDescription =
            workout.description &&
            getLocalizedField(workout.description, language);

        // Update the workout with localized fields
        const localizedWorkoutData = {
            ...workout,
            name: localizedName,
            description: localizedDescription,
        };

        // Localize constants and nested structures
        const localizedWorkout = localizeWorkoutPrototypeConstants(
            localizedWorkoutData as unknown as IWorkoutPrototype,
            language,
        );

        return { data: localizedWorkout };
    } catch (error) {
        if (error instanceof MongooseError) {
            throw json({
                status: 400,
                error: "Bad request, ensure that the query is valid",
            });
        }
        throw json({ status: 500, error: "An unexpected error occurred" });
    }
};
