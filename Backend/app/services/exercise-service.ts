import { json } from "@remix-run/node";
import { RootFilterQuery } from "mongoose";
import { z } from "zod";
import { CATEGORY, CategoryValue } from "~/constants/category";
import { EQUIPMENT, EquipmentValue } from "~/constants/equipment";
import { FORCE, ForceValue } from "~/constants/force";
import { LEVEL, LevelValue } from "~/constants/level";
import { MUSCLE_GROUPS, MuscleGroupValue } from "~/constants/muscle-groups";
import { ServiceResult } from "~/interfaces/service-result";
import { Exercise, IExercise } from "~/models/exercise";
import {
    addPaginationAndSorting,
    buildQueryFromSearchParams,
    IBuildQueryConfig,
} from "~/utils/util.server";

// Defined search Params usable by Exercise Services
const queryConfig: IBuildQueryConfig = addPaginationAndSorting({
    name: {
        isArray: false,
        constructor: String,
        regex: (value: string) => new RegExp(value),
        validationSchema: z.string().min(1),
    },
    level: {
        isArray: false,
        constructor: String,
        validationSchema: z.enum(
            Object.values(LEVEL) as [LevelValue, ...LevelValue[]],
        ),
    },
    category: {
        isArray: false,
        constructor: String,
        validationSchema: z.enum(
            Object.values(CATEGORY) as [CategoryValue, ...CategoryValue[]],
        ),
    },
    force: {
        isArray: false,
        constructor: String,
        regex: (value: string) => new RegExp(value),
        validationSchema: z.enum(
            Object.values(FORCE) as [ForceValue, ...ForceValue[]],
        ),
    },
    equipment: {
        isArray: true,
        constructor: String,
        regex: (value: string) => new RegExp(value),
        validationSchema: z.enum(
            Object.values(EQUIPMENT) as [EquipmentValue, ...EquipmentValue[]],
        ),
    },
    primaryMuscles: {
        isArray: true,
        constructor: String,
        validationSchema: z.enum(
            Object.values(MUSCLE_GROUPS) as [
                MuscleGroupValue,
                ...MuscleGroupValue[],
            ],
        ),
    },
    secondaryMuscles: {
        isArray: true,
        constructor: String,
        validationSchema: z.enum(
            Object.values(MUSCLE_GROUPS) as [
                MuscleGroupValue,
                ...MuscleGroupValue[],
            ],
        ),
    },
});

export const readExercises = async (
    searchParams: URLSearchParams,
): Promise<ServiceResult<IExercise[]>> => {
    try {
        const { query, limit, offset, sortBy, sortOrder } =
            buildQueryFromSearchParams<IExercise>(searchParams, queryConfig);

        const sortOption: Record<string, 1 | -1> | undefined = sortBy
            ? { [sortBy]: sortOrder as 1 | -1 }
            : undefined;

        const exercises = await Exercise.find(
            query as RootFilterQuery<IExercise>,
        )
            .sort(sortOption)
            .skip(offset)
            .limit(limit)
            .lean()
            .exec();

        const totalCount = await Exercise.countDocuments(
            query as RootFilterQuery<IExercise>,
        ).exec();
        const hasMore = offset + exercises.length < totalCount;

        return { data: exercises, hasMore };
    } catch (error) {
        throw json({ status: 500, error: "An unexpected error occurred" });
    }
};

export const readExerciseById = async (
    exerciseId: string,
): Promise<ServiceResult<IExercise>> => {
    try {
        const exercise = await Exercise.findById(exerciseId).lean().exec();

        if (!exercise) {
            throw json({ error: "Exercise not found" }, { status: 404 });
        }

        return { data: exercise };
    } catch (error) {
        throw json({ status: 500, error: "An unexpected error occurred" });
    }
};
