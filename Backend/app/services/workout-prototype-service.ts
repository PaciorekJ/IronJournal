import { json } from "@remix-run/node";
import { z } from "zod";
import {
    INTENSITY_LEVEL,
    IntensityLevelValue,
} from "~/constants/intensity-levels";
import { ServiceResult } from "~/interfaces/service-result";
import { IUser } from "~/models/user";
import {
    IWorkoutPrototype,
    WorkoutPrototype,
} from "~/models/workout-prototype";
import {
    addPaginationAndSorting,
    buildPopulateOptions,
    buildQueryFromSearchParams,
    IBuildQueryConfig,
} from "~/utils/util.server";
import {
    CreateWorkoutPrototypeInput,
    UpdateWorkoutPrototypeInput,
} from "~/validation/workout-prototype";

// Defined search Params usable by WorkoutPrototype Services + Populate Options where applicable
const queryConfig: IBuildQueryConfig = addPaginationAndSorting({
    name: {
        isArray: false,
        constructor: String,
        regex: (value: string) => new RegExp(value),
        schema: z.string().min(1),
    },
    intensityLevel: {
        isArray: false,
        constructor: String,
        regex: (value: string) => new RegExp(value),
        schema: z.enum(
            Object.values(INTENSITY_LEVEL) as [
                IntensityLevelValue,
                ...IntensityLevelValue[],
            ],
        ),
    },
    userId: {
        isArray: false,
        constructor: String,
        schema: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
    },
});

export const createWorkoutPrototype = async (
    user: IUser,
    data: CreateWorkoutPrototypeInput,
): Promise<ServiceResult<IWorkoutPrototype>> => {
    try {
        const newWorkout = await WorkoutPrototype.create({
            ...data,
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
    updateData: UpdateWorkoutPrototypeInput,
): Promise<ServiceResult<IWorkoutPrototype>> => {
    try {
        const workout = await WorkoutPrototype.findOne({
            _id: workoutId,
            userId: user._id,
        });

        if (!workout) {
            throw json({ error: "Workout not found" }, { status: 404 });
        }

        Object.assign(workout, updateData);
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
): Promise<ServiceResult<IWorkoutPrototype[]>> => {
    try {
        const { query, limit, offset, sortBy, sortOrder } =
            buildQueryFromSearchParams(searchParams, queryConfig) as any;

        query.userId = user._id;

        const sortOption: Record<string, 1 | -1> | null = sortBy
            ? { [sortBy]: sortOrder as 1 | -1 }
            : null;

        let queryObj = WorkoutPrototype.find(query)
            .sort(sortOption)
            .skip(offset)
            .limit(limit);

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option: string | string[]) => {
            queryObj = queryObj.populate(option);
        });

        const workouts = await queryObj.lean();

        const totalCount = await WorkoutPrototype.countDocuments(query).exec();
        const hasMore = offset + workouts.length < totalCount;

        return { data: workouts, hasMore };
    } catch (error) {
        throw json({ error: "An unexpected error occurred" }, { status: 500 });
    }
};

export const readWorkoutPrototypeById = async (
    user: IUser,
    workoutId: string,
    searchParams: URLSearchParams,
): Promise<ServiceResult<IWorkoutPrototype>> => {
    try {
        let query = WorkoutPrototype.findById(workoutId);

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option) => {
            query = query.populate(option);
        });

        const workout = await query.lean();

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

        return { data: workout };
    } catch (error) {
        throw json({ error: "An unexpected error occurred" }, { status: 500 });
    }
};
